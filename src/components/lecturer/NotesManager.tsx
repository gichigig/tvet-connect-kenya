
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotesForm } from "./notes-manager/NotesForm";
import { NotesTable } from "./notes-manager/NotesTable";

export const NotesManager = () => {
  const { user, createdContent } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Get notes created by current lecturer
  const notes = createdContent.filter(content => 
    content.type === 'notes' && content.lecturerId === user?.id
  );

  const handleFormSubmit = () => {
    // This function is called when notes are successfully uploaded
    // No additional logic needed as the form handles everything
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes Management</h2>
          <p className="text-gray-600">Upload and manage course notes and materials</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Notes
        </Button>
      </div>

      {showUploadForm && (
        <NotesForm 
          onClose={() => setShowUploadForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <NotesTable notes={notes} />
    </div>
  );
};
