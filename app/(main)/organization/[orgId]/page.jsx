// app/(main)/organization/[orgId]/page.jsx
import { getOrganization } from "@/actions/organizations";
import { currentUser } from "@clerk/nextjs/server";
import OrgSwitcher from "@/components/org-switcher";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";

const Organization = async ({ params }) => {
  // Next.js 15 requires awaiting params
  const { orgId } = await params;
  
  // Get current user
  const user = await currentUser();
  
  console.log('🔍 Organization Page Debug:', {
    orgId,
    userId: user?.id,
    userExists: !!user
  });
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600">You must be logged in to view this page.</p>
      </div>
    );
  }
  
  const organization = await getOrganization(orgId);
  
  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Organization Not Found</h1>
        <p className="text-gray-600">The organization you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <div className="rounded-lg shadow p-6 border-2 border-dotted border-white bg-gray-900">
          <h1 className="text-2xl font-bold gradient-title pb-8">
            {organization.name}&rsquo;s Projects
          </h1>
          
          <p className="text-white mb-4">Organization ID: {organization.id}</p>
          <p className="text-white mb-4">Slug: {organization.slug}</p>
        </div>
        <OrgSwitcher />
      </div>
      
      <div className="mb-4">
        <ProjectList orgId={organization.id} />
      </div>
      
      <div className="mt-8">
        {/* Pass orgId instead of userId */}
        <UserIssues orgId={organization.id} />
      </div>
    </div>
  );
};

export default Organization;