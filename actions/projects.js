"use server";

import { db } from "@/lib/prisma";
import { currentUser, createClerkClient } from "@clerk/nextjs/server";

export async function createProject(data, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  console.log('✅ Organization ID:', orgId);

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

  try {
    // Check if project with this key already exists for this organization
    const existingProject = await db.project.findFirst({
      where: {
        organizationId: orgId,
        key: data.key
      }
    });

    if (existingProject) {
      throw new Error(`Project with key "${data.key}" already exists for this organization`);
    }

    // Create a proper Clerk client instance
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Check if the user is an admin of the organization
    const { data: membershipList } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === user.id
    );

    if (!userMembership || userMembership.role !== "org:admin") {
      throw new Error("Only organization admins can create projects");
    }

    console.log('✅ User is admin, creating project');

    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    console.log('✅ Project created:', project.id);
    return project;

  } catch (error) {
    console.error('❌ Error creating project:', error);
    
    // Handle specific Prisma unique constraint error
    if (error.code === 'P2002' && error.meta?.target?.includes('organizationId_key')) {
      throw new Error(`A project with key "${data.key}" already exists for this organization`);
    }
    
    throw new Error("Error creating project: " + error.message);
  }
}

export async function getProjectById(projectId, orgId) {
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

    // Get project with sprints and organization
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify project belongs to the organization
    if (project.organizationId !== orgId) {
      console.log('❌ Project does not belong to user organization');
      return null;
    }

    console.log('✅ Project found and verified:', project.id);
    return project;

  } catch (error) {
    console.error('❌ Error getting project:', error);
    throw new Error("Error getting project: " + error.message);
  }
}

export async function deleteProject(projectId, orgId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

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

  try {
    // Create a proper Clerk client instance
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Check if the user is an admin of the organization
    const { data: membershipList } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === user.id
    );

    if (!userMembership || userMembership.role !== "org:admin") {
      throw new Error("Only organization admins can delete projects");
    }

    console.log('✅ User is admin, proceeding with deletion');

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.organizationId !== orgId) {
      throw new Error(
        "Project not found or you don't have permission to delete it"
      );
    }

    await db.project.delete({
      where: { id: projectId },
    });

    console.log('✅ Project deleted successfully:', projectId);
    return { success: true };

  } catch (error) {
    console.error('❌ Error deleting project:', error);
    throw new Error("Error deleting project: " + error.message);
  }
}

export async function getProject(projectId) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

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

    // First, get the project to find its organizationId
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    console.log('✅ Project found, verifying user access to organization:', project.organizationId);

    // Now verify the user has access to this organization
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const { data: membershipList } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: project.organizationId,
    });

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === user.id
    );

    if (!userMembership) {
      console.log('❌ User does not have access to this organization');
      return null;
    }

    console.log('✅ Project found and user verified:', project.id);
    return project;

  } catch (error) {
    console.error('❌ Error getting project:', error);
    throw new Error("Error getting project: " + error.message);
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