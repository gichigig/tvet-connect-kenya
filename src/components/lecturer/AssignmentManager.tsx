
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentForm } from "./assignment-manager/AssignmentForm";
import { AssignmentTable } from "./assignment-manager/AssignmentTable";

export const AssignmentManager = () => {
  const { user, createdContent } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get assignments created by current lecturer
  const assignments = createdContent.filter(content => 
    content.type === 'assignment' && content.lecturerId === user?.id
  );

  const handleFormSubmit = () => {
    // This function is called when an assignment is successfully created
    // No additional logic needed as the form handles everything
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-gray-600">Create and manage course assignments</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {showCreateForm && (
        <AssignmentForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <AssignmentTable assignments={assignments} />
    </div>
  );
};
