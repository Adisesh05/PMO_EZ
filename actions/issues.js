"use server";

import { db } from "@/lib/prisma";
import { currentUser, createClerkClient } from "@clerk/nextjs/server";

export async function getIssuesForSprint(sprintId, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  try {
    // Ensure user exists in database (create if doesn't exist)
    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      },
    });

    console.log('✅ DB User ensured:', dbUser.id);

    const issues = await db.issue.findMany({
      where: { sprintId: sprintId },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        assignee: true,
        reporter: true,
      },
    });

    console.log('✅ Issues fetched:', issues.length);
    return issues;

  } catch (error) {
    console.error('❌ Error fetching issues:', error);
    throw new Error("Error fetching issues: " + error.message);
  }
}

export async function createIssue(projectId, data, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  try {
    // Ensure user exists in database (create if doesn't exist)
    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      },
    });

    console.log('✅ DB User ensured:', dbUser.id);

    const lastIssue = await db.issue.findFirst({
      where: { projectId, status: data.status },
      orderBy: { order: "desc" },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await db.issue.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: projectId,
        sprintId: data.sprintId,
        reporterId: dbUser.id,
        assigneeId: data.assigneeId || null,
        order: newOrder,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    console.log('✅ Issue created:', issue.id);
    return issue;

  } catch (error) {
    console.error('❌ Error creating issue:', error);
    throw new Error("Error creating issue: " + error.message);
  }
}

export async function updateIssueOrder(updatedIssues, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  try {
    // Ensure user exists in database (create if doesn't exist)
    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      },
    });

    console.log('✅ DB User ensured:', dbUser.id);

    // Start a transaction
    await db.$transaction(async (prisma) => {
      // Update each issue
      for (const issue of updatedIssues) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: {
            status: issue.status,
            order: issue.order,
          },
        });
      }
    });

    console.log('✅ Issue order updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating issue order:', error);
    throw new Error("Error updating issue order: " + error.message);
  }
}

export async function deleteIssue(issueId, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  try {
    // Ensure user exists in database (create if doesn't exist)
    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      },
    });

    console.log('✅ DB User ensured:', dbUser.id);

    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Issue does not belong to your organization");
    }

    // Check if user is the reporter or has admin permissions
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const { data: membershipList } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === user.id
    );

    const isAdmin = userMembership?.role === "org:admin";
    const isReporter = issue.reporterId === dbUser.id;

    if (!isReporter && !isAdmin) {
      throw new Error("You don't have permission to delete this issue");
    }

    console.log('✅ User has permission to delete issue');

    await db.issue.delete({ where: { id: issueId } });

    console.log('✅ Issue deleted successfully:', issueId);
    return { success: true };

  } catch (error) {
    console.error('❌ Error deleting issue:', error);
    throw new Error("Error deleting issue: " + error.message);
  }
}

export async function updateIssue(issueId, data, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  try {
    // Ensure user exists in database (create if doesn't exist)
    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      },
    });

    console.log('✅ DB User ensured:', dbUser.id);

    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Issue does not belong to your organization");
    }

    console.log('✅ Issue belongs to organization');

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    console.log('✅ Issue updated successfully:', updatedIssue.id);
    return updatedIssue;

  } catch (error) {
    console.error('❌ Error updating issue:', error);
    throw new Error("Error updating issue: " + error.message);
  }
}