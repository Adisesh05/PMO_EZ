"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import useFetch from "@/hooks/use-fetch";

import statuses from "@/data/status";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";

import SprintManager from "./sprint-manager";
import IssueCreationDrawer from "./create-issue";
import IssueCard from "@/components/issue-card";
import BoardFilters from "./board-filters";

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default function SprintBoard({ sprints, projectId, orgId }) {
  const [currentSprint, setCurrentSprint] = useState(
    sprints.find((spr) => spr.status === "ACTIVE") || sprints[0]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Create a wrapper function that includes orgId
  const getIssuesWithOrgId = async (sprintId) => {
    console.log("🔍 Fetching issues for sprint:", sprintId, "in org:", orgId);
    return await getIssuesForSprint(sprintId, orgId);
  };

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch(getIssuesWithOrgId);

  const [filteredIssues, setFilteredIssues] = useState([]);

  const handleFilterChange = (newFilteredIssues) => {
    setFilteredIssues(newFilteredIssues);
  };

  // Update filteredIssues when issues change
  useEffect(() => {
    if (issues) {
      setFilteredIssues(issues);
    }
  }, [issues]);

  useEffect(() => {
    // Only fetch if we have both currentSprint and orgId
    if (currentSprint?.id && orgId) {
      console.log("📝 Current sprint changed, fetching issues:", currentSprint.id);
      fetchIssues(currentSprint.id);
    }
  }, [currentSprint?.id, orgId]); // Added optional chaining for safety

  const handleAddIssue = (status) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {
    if (currentSprint?.id) {
      fetchIssues(currentSprint.id);
    }
  };

  // Create wrapper for updateIssueOrder that includes orgId
  const updateIssueOrderWithOrgId = async (sortedIssues) => {
    console.log("🔍 Updating issue order with org:", orgId);
    return await updateIssueOrder(sortedIssues, orgId);
  };

  const {
    fn: updateIssueOrderFn,
    loading: updateIssuesLoading,
    error: updateIssuesError,
  } = useFetch(updateIssueOrderWithOrgId);

  const onDragEnd = async (result) => {
    if (!currentSprint) {
      toast.error("No sprint selected");
      return;
    }

    if (currentSprint.status === "PLANNED") {
      toast.warning("Start the sprint to update board");
      return;
    }
    if (currentSprint.status === "COMPLETED") {
      toast.warning("Cannot update board after sprint end");
      return;
    }

    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!issues || issues.length === 0) {
      toast.error("No issues available to reorder");
      return;
    }

    const newOrderedData = [...issues];

    // source and destination list
    const sourceList = newOrderedData.filter(
      (list) => list.status === source.droppableId
    );

    const destinationList = newOrderedData.filter(
      (list) => list.status === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorder(
        sourceList,
        source.index,
        destination.index
      );

      reorderedCards.forEach((card, i) => {
        card.order = i;
      });
    } else {
      // remove card from the source list
      const [movedCard] = sourceList.splice(source.index, 1);

      // assign the new list id to the moved card
      movedCard.status = destination.droppableId;

      // add new card to the destination list
      destinationList.splice(destination.index, 0, movedCard);

      sourceList.forEach((card, i) => {
        card.order = i;
      });

      // update the order for each card in destination list
      destinationList.forEach((card, i) => {
        card.order = i;
      });
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    setIssues(sortedIssues);

    // Update the filtered issues as well to reflect the changes immediately
    setFilteredIssues(sortedIssues);

    updateIssueOrderFn(sortedIssues);
  };

  // Debug info
  useEffect(() => {
    console.log("🔍 SprintBoard Debug Info:");
    console.log("  - orgId:", orgId);
    console.log("  - projectId:", projectId);
    console.log("  - currentSprint:", currentSprint?.id);
    console.log("  - sprints count:", sprints?.length);
    console.log("  - issues count:", issues?.length);
    console.log("  - filteredIssues count:", filteredIssues?.length);
  }, [orgId, projectId, currentSprint, sprints, issues, filteredIssues]);

  // Early return if no organization ID
  if (!orgId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Organization Selected
          </h3>
          <p className="text-gray-600">
            Please select an organization to view the sprint board.
          </p>
        </div>
      </div>
    );
  }

  // Early return if no current sprint
  if (!currentSprint) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Sprint Available
          </h3>
          <p className="text-gray-600">
            Create a sprint to start managing issues.
          </p>
        </div>
      </div>
    );
  }

  if (issuesError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error Loading Issues
          </h3>
          <p className="text-gray-600 mb-4">{issuesError.message}</p>
          <Button 
            onClick={() => currentSprint?.id && fetchIssues(currentSprint.id)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint}
        setSprint={setCurrentSprint}
        sprints={sprints}
        projectId={projectId}
      />

      {issues && !issuesLoading && (
        <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
      )}

      {updateIssuesError && (
        <p className="text-red-500 mt-2">{updateIssuesError.message}</p>
      )}
      {(updateIssuesLoading || issuesLoading) && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {statuses.map((column) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {column.name}
                  </h3>
                  {(filteredIssues || [])
                    .filter((issue) => issue.status === column.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                        isDragDisabled={updateIssuesLoading}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <IssueCard
                              issue={issue}
                              orgId={orgId}
                              onDelete={() => currentSprint?.id && fetchIssues(currentSprint.id)}
                              onUpdate={(updated) => {
                                setIssues((prevIssues) =>
                                  prevIssues.map((issue) => {
                                    if (issue.id === updated.id) return updated;
                                    return issue;
                                  })
                                );
                                // Also update filtered issues
                                setFilteredIssues((prevFiltered) =>
                                  prevFiltered.map((issue) => {
                                    if (issue.id === updated.id) return updated;
                                    return issue;
                                  })
                                );
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {column.key === "TODO" &&
                    currentSprint.status !== "COMPLETED" && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleAddIssue(column.key)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprint.id}
        status={selectedStatus}
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
}