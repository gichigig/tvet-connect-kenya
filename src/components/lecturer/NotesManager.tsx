
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotesForm } from "./notes-manager/NotesForm";
import { NotesTable } from "./notes-manager/NotesTable";
import { useDashboardSync } from "@/hooks/useDashboardSync";

export const NotesManager = () => {
  const { user, createdContent } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Get synced notes from semester plans
  const { getContentByType } = useDashboardSync('lecturer');
  const syncedNotes = getContentByType('notes');

  // Get manually created notes by current lecturer
  const manualNotes = createdContent.filter(content => 
    content.type === 'notes' && content.lecturerId === user?.id
  );

  // Combine manual and synced notes, removing duplicates
  const allNotes = [
    ...manualNotes,
    ...syncedNotes.filter(synced => 
      !manualNotes.some(manual => manual.id === synced.id)
    )
  ];

  console.log('NotesManager Debug:', {
    manualCount: manualNotes.length,
    syncedCount: syncedNotes.length,
    totalCount: allNotes.length,
    syncedSample: syncedNotes.slice(0, 2)
  });

  const handleFormSubmit = () => {
    // This function is called when notes are successfully uploaded
    // No additional logic needed as the form handles everything
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes Management</h2>
          <p className="text-gray-600">
            Upload and manage course notes and materials
            {syncedNotes.length > 0 && (
              <span className="text-blue-600 ml-1">
                • {syncedNotes.length} synced from semester plans
              </span>
            )}
          </p>
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

      <NotesTable notes={allNotes} />
    </div>
  );
};
