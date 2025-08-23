"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";

// Import the server action
import { createSprint } from "@/actions/sprints";

export default function SprintCreationForm({
  projectTitle,
  projectKey,
  projectId,
  sprintKey,
}) {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [sprintName, setSprintName] = useState(`${projectKey}-${sprintKey}`);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log("🔍 Form submitted, preparing data...");
      console.log("📝 Project ID:", projectId);
      console.log("📝 Sprint Name:", sprintName);
      console.log("📝 Start Date:", startDate);
      console.log("📝 End Date:", endDate);
      
      // Validate inputs
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
      
      if (!sprintName.trim()) {
        throw new Error("Sprint name is required");
      }
      
      if (!startDate || !endDate) {
        throw new Error("Both start and end dates are required");
      }
      
      // Prepare data object that matches server action expectations
      const sprintData = {
        name: sprintName.trim(),
        startDate: startDate, // Send as string, server will convert to Date
        endDate: endDate,     // Send as string, server will convert to Date
      };
      
      console.log("📤 Calling server action with:", {
        projectId,
        data: sprintData
      });
      
      // Call server action with correct parameters: projectId and data object
      const result = await createSprint(projectId, sprintData);
      
      console.log("✅ Server action returned:", result);
      setSuccess(true);
      
      // Reset form and refresh after success
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        router.refresh();
      }, 2000);
      
    } catch (err) {
      console.error("❌ Error in component:", err);
      setError(err.message || "Failed to create sprint");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setError(null);
    setSuccess(false);
    setSprintName(`${projectKey}-${sprintKey}`);
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  };

  return (
    <>
      <div className="flex justify-between items-start">
        <h1 className="text-5xl font-bold mb-8 gradient-title">
          {projectTitle}
        </h1>
        <Button
          className="mt-2"
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          variant={!showForm ? "default" : "destructive"}
        >
          {!showForm ? "Create New Sprint" : "Cancel"}
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="pt-4 mb-4 border-green-500">
          <CardContent>
            <div className="text-green-600">
              ✅ Sprint created successfully! Refreshing page...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="pt-4 mb-4 border-red-500">
          <CardContent>
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="pt-4 mb-4">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Sprint Name
                  </label>
                  <Input
                    id="name"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    className="bg-slate-950"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-950"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-950"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Sprint"}
                </Button>
              </div>
            </form>

            {/* Debug Info */}
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <strong>Debug Info:</strong>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Project ID: <code className="bg-gray-200 px-1 rounded">{projectId}</code></div>
                <div>Project Key: <code className="bg-gray-200 px-1 rounded">{projectKey}</code></div>
                <div>Sprint Key: <code className="bg-gray-200 px-1 rounded">{sprintKey}</code></div>
                <div>Sprint Name: <code className="bg-gray-200 px-1 rounded">{sprintName}</code></div>
                <div>Start Date: <code className="bg-gray-200 px-1 rounded">{startDate}</code></div>
                <div>End Date: <code className="bg-gray-200 px-1 rounded">{endDate}</code></div>
              </div>
              <div className="mt-2 text-xs">
                <strong>Loading:</strong> {isLoading ? "Yes" : "No"} | 
                <strong> Error:</strong> {error ? "Yes" : "No"} | 
                <strong> Success:</strong> {success ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}