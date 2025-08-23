import { Suspense } from "react";
import { getUserIssues } from "@/actions/organizations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCard from "@/components/issue-card";
import { currentUser } from "@clerk/nextjs/server";

export default async function UserIssues({ orgId }) {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your issues.</p>
      </div>
    );
  }

  console.log('🎯 UserIssues component called with orgId:', orgId, 'for user:', user.id);
  
  let issues = [];
  let error = null;
  
  try {
    issues = await getUserIssues(orgId);
    console.log('✅ getUserIssues returned:', {
      count: issues?.length || 0,
      issues: issues?.map(i => ({ id: i.id, title: i.title })) || []
    });
  } catch (err) {
    console.error('❌ Error in getUserIssues:', err);
    error = err.message;
  }

  // Show debug info even when there are no issues
  console.log('📊 Issues breakdown:', {
    totalIssues: issues?.length || 0,
    assignedCount: issues?.filter(issue => issue.assignee?.clerkUserId === user.id)?.length || 0,
    reportedCount: issues?.filter(issue => issue.reporter?.clerkUserId === user.id)?.length || 0,
  });

  if (!issues || issues.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <h1 className="text-4xl font-bold gradient-title mb-4">My Issues</h1>
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No issues found</p>
            <p className="text-sm">You haven't been assigned to any issues or reported any issues yet.</p>
          </div>
        )}
      </div>
    );
  }

  const assignedIssues = issues.filter(
    (issue) => issue.assignee?.clerkUserId === user.id
  );
  const reportedIssues = issues.filter(
    (issue) => issue.reporter?.clerkUserId === user.id
  );

  return (
    <>
      <h1 className="text-4xl font-bold gradient-title mb-4">My Issues</h1>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned">
            Assigned to You ({assignedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="reported">
            Reported by You ({reportedIssues.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Suspense fallback={<div>Loading assigned issues...</div>}>
            <IssueGrid issues={assignedIssues} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported">
          <Suspense fallback={<div>Loading reported issues...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}

function IssueGrid({ issues }) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No issues in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showStatus />
      ))}
    </div>
  );
}