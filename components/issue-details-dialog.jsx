"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import UserAvatar from "./user-avatar";
import useFetch from "@/hooks/use-fetch";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarLoader } from "react-spinners";
import { ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import statuses from "@/data/status";
import { deleteIssue, updateIssue } from "@/actions/issues";

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function IssueDetailsDialog({
  isOpen,
  onClose,
  issue,
  onDelete = () => {},
  onUpdate = () => {},
  borderCol = "",
}) {
  const [status, setStatus] = useState(issue.status);
  const [priority, setPriority] = useState(issue.priority);
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();

  const {
    loading: deleteLoading,
    error: deleteError,
    fn: deleteIssueFn,
    data: deleted,
  } = useFetch(deleteIssue);

  const {
    loading: updateLoading,
    error: updateError,
    fn: updateIssueFn,
    data: updated,
  } = useFetch(updateIssue);

  // Debug logging
  useEffect(() => {
    console.log('🔍 IssueDetailsDialog - Organization check:', {
      organizationId: organization?.id,
      hasOrganization: !!organization,
      issue: issue?.id
    });
  }, [organization, issue]);

  const handleDelete = async () => {
    if (!organization?.id) {
      console.error('❌ No organization ID available for delete');
      return;
    }

    if (window.confirm("Are you sure you want to delete this issue?")) {
      console.log('🗑️ Attempting to delete issue:', issue.id, 'with orgId:', organization.id);
      deleteIssueFn(issue.id, organization.id);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!organization?.id) {
      console.error('❌ No organization ID available for status update');
      return;
    }

    console.log('📝 Updating status:', {
      issueId: issue.id,
      newStatus,
      priority,
      orgId: organization.id
    });

    setStatus(newStatus);
    updateIssueFn(issue.id, { status: newStatus, priority }, organization.id);
  };

  const handlePriorityChange = async (newPriority) => {
    if (!organization?.id) {
      console.error('❌ No organization ID available for priority update');
      return;
    }

    console.log('🎯 Updating priority:', {
      issueId: issue.id,
      status,
      newPriority,
      orgId: organization.id
    });

    setPriority(newPriority);
    updateIssueFn(issue.id, { status, priority: newPriority }, organization.id);
  };

  useEffect(() => {
    if (deleted) {
      console.log('✅ Issue deleted successfully');
      onClose();
      onDelete();
    }
    if (updated) {
      console.log('✅ Issue updated successfully');
      onUpdate(updated);
    }
  }, [deleted, updated, deleteLoading, updateLoading]);

  const canChange =
    user?.id === issue.reporter.clerkUserId || membership?.role === "org:admin";

  const handleGoToProject = () => {
    router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
  };

  const isProjectPage = !pathname.startsWith("/project/");

  // Show loading state while organization is loading
  if (!organization && membership === undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <BarLoader width={"100%"} color="#36d7b7" />
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if no organization is selected
  if (!organization) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Organization Selected</DialogTitle>
          </DialogHeader>
          <p>Please select an organization to view issue details.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
            {isProjectPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoToProject}
                title="Go to Project"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        {(updateLoading || deleteLoading) && (
          <BarLoader width={"100%"} color="#36d7b7" />
        )}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={status} onValueChange={handleStatusChange} disabled={!canChange}>
              <SelectTrigger className="">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={handlePriorityChange}
              disabled={!canChange}
            >
              <SelectTrigger className={`border ${borderCol} rounded`}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="font-semibold">Description</h4>
            <MDEditor.Markdown
              className="rounded px-2 py-1"
              source={issue.description ? issue.description : "--"}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              <UserAvatar user={issue.assignee} />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter} />
            </div>
          </div>
          {canChange && (
            <Button
              onClick={handleDelete}
              disabled={deleteLoading || !organization?.id}
              variant="destructive"
            >
              {deleteLoading ? "Deleting..." : "Delete Issue"}
            </Button>
          )}
          {(deleteError || updateError) && (
            <p className="text-red-500">
              {deleteError?.message || updateError?.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}