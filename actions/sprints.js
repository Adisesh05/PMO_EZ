"use server";

import { db } from "@/lib/prisma";
import { currentUser, createClerkClient } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
  console.log("🚀 === SERVER ACTION CALLED ===");
  console.log("📝 Received projectId:", projectId);
  console.log("📝 Received data:", JSON.stringify(data, null, 2));
  
  try {
    // Test 1: Basic logging
    console.log("✅ Test 1: Server action is reachable");
    
    // Test 2: Check if we can get current user
    console.log("📝 Test 2: Getting current user...");
    const user = await currentUser();
    
    if (!user) {
      console.error("❌ Test 2 Failed: No user found");
      throw new Error("Unauthorized - Please make sure you're logged in");
    }
    
    console.log("✅ Test 2 Passed: User found -", user.id);
    
    // Test 3: Validate input
    console.log("📝 Test 3: Validating input...");
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!data || !data.name) {
      throw new Error("Sprint name is required");
    }
    if (!data.startDate || !data.endDate) {
      throw new Error("Start and end dates are required");
    }
    console.log("✅ Test 3 Passed: Input validation successful");
    
    // Test 4: Check database connection
    console.log("📝 Test 4: Testing database connection...");
    try {
      // Simple database test
      const testQuery = await db.$queryRaw`SELECT 1 as test`;
      console.log("✅ Test 4 Passed: Database connection successful", testQuery);
    } catch (dbError) {
      console.error("❌ Test 4 Failed: Database connection error", dbError.message);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    // Test 5: Check if project exists
    console.log("📝 Test 5: Checking if project exists...");
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        organizationId: true,
        _count: {
          select: { sprints: true }
        }
      },
    });
    
    if (!project) {
      console.error("❌ Test 5 Failed: Project not found for ID:", projectId);
      throw new Error(`Project not found with ID: ${projectId}`);
    }
    
    console.log("✅ Test 5 Passed: Project found -", {
      id: project.id,
      name: project.name,
      orgId: project.organizationId,
      sprintCount: project._count.sprints
    });
    
    // Test 6: Create a minimal sprint (skip organization check for now)
    console.log("📝 Test 6: Creating sprint...");
    
    const sprint = await db.sprint.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "PLANNED",
        projectId: projectId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
      }
    });
    
    console.log("✅ Test 6 Passed: Sprint created successfully -", sprint);
    
    console.log("🎉 === ALL TESTS PASSED ===");
    return { success: true, sprint };
    
  } catch (error) {
    console.error("❌ === SERVER ACTION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== END ERROR ===");
    
    // Return a more specific error
    throw new Error(`Sprint creation failed: ${error.message}`);
  }
}

export async function updateSprintStatus(sprintId, newStatus) {
  console.log("🚀 === UPDATE SPRINT STATUS CALLED ===");
  console.log("📝 Sprint ID:", sprintId);
  console.log("📝 New Status:", newStatus);

  const user = await currentUser();
  
  if (!user) {
    console.error("❌ No user found");
    throw new Error("Unauthorized");
  }

  console.log('✅ User found:', user.id);

  try {
    // Ensure user exists in database (create if doesn't exist)
    console.log("📝 Ensuring user exists in database...");
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

    // Get the sprint with its project to find the organizationId
    console.log("📝 Finding sprint...");
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });

    console.log('Sprint found:', sprint ? sprint.id : 'null');

    if (!sprint) {
      console.error("❌ Sprint not found");
      throw new Error("Sprint not found");
    }

    console.log('✅ Sprint found, verifying user access to organization:', sprint.project.organizationId);

    // Create a proper Clerk client instance
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Check if the user is an admin of the organization
    const { data: membershipList } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: sprint.project.organizationId,
    });

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === user.id
    );

    if (!userMembership || userMembership.role !== "org:admin") {
      console.error("❌ User not authorized");
      throw new Error("Only organization admins can update sprint status");
    }

    console.log('✅ User is admin, proceeding with sprint update');

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Can only complete an active sprint");
    }

    console.log("📝 Updating sprint status...");
    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
    });

    console.log('✅ Sprint status updated:', updatedSprint.status);
    return { success: true, sprint: updatedSprint };

  } catch (error) {
    console.error('❌ Error updating sprint status:', error);
    console.error("Error stack:", error.stack);
    throw new Error(error.message);
  }
}