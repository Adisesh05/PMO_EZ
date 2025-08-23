"use server";

import { db } from "@/lib/prisma";
import { currentUser, createClerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  console.log('✅ DB User found:', dbUser.id);

  try {
    // Create a proper Clerk client instance
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    console.log('🔧 Created Clerk client');
    console.log('🔍 Clerk client has organizations:', !!clerk.organizations);

    // Get the organization details
    const organization = await clerk.organizations.getOrganization({
      slug,
    });

    if (!organization) {
      console.log('❌ Organization not found:', slug);
      return null;
    }

    console.log('✅ Organization found:', organization.id);

    // Check if user belongs to this organization
    const membership = await clerk.organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

    const userMembership = membership.data?.find(
      (member) => member.publicUserData.userId === user.id
    );

    if (!userMembership) {
      console.log('❌ User is not a member of this organization');
      return null;
    }

    console.log('✅ User membership confirmed');
    return organization;

  } catch (error) {
    console.error('❌ Error in getOrganization:', error);
    console.error('❌ Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to get organization: ${error.message}`);
  }
}

export async function getProjects(orgId) {
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

    const projects = await db.project.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    console.log('✅ Projects fetched:', projects.length);
    return projects;

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    throw new Error("Error fetching projects: " + error.message);
  }
}

export async function getUserIssues(orgId) {
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
      where: {
        OR: [{ assigneeId: dbUser.id }, { reporterId: dbUser.id }],
        project: {
          organizationId: orgId,
        },
      },
      include: {
        project: true,
        assignee: true,
        reporter: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log('✅ User issues fetched:', issues.length);
    return issues;

  } catch (error) {
    console.error('❌ Error fetching user issues:', error);
    throw new Error("Error fetching user issues: " + error.message);
  }
}

export async function getOrganizationUsers(orgId) {
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

    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const organizationMemberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const userIds = organizationMemberships.data.map(
      (membership) => membership.publicUserData.userId
    );

    const users = await db.user.findMany({
      where: {
        clerkUserId: {
          in: userIds,
        },
      },
    });

    console.log('✅ Organization users fetched:', users.length);
    return users;

  } catch (error) {
    console.error('❌ Error fetching organization users:', error);
    throw new Error("Error fetching organization users: " + error.message);
  }
}