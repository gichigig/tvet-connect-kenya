import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { AssignmentForm } from "./assignment-manager/AssignmentForm";
import { AssignmentTable } from "./assignment-manager/AssignmentTable";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import LecturerGrading from "@/components/lecturer/LecturerGrading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AssignmentManager = () => {
  const { user, createdContent, createdUnits } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [gradingUnit, setGradingUnit] = useState<any | null>(null);
  
  // Get synced assignments from semester plans
  const { getContentByType } = useDashboardSync('lecturer');
  const syncedAssignments = getContentByType('assignment');

  // Get manually created assignments by current lecturer
  const manualAssignments = createdContent.filter(content => 
    content.type === 'assignment' && content.lecturerId === user?.id
  );

  // Combine manual and synced assignments, removing duplicates
  const allAssignments = [
    ...manualAssignments,
    ...syncedAssignments.filter(synced => 
      !manualAssignments.some(manual => manual.id === synced.id)
    )
  ];

  console.log('AssignmentManager Debug:', {
    manualCount: manualAssignments.length,
    syncedCount: syncedAssignments.length,
    totalCount: allAssignments.length,
    syncedSample: syncedAssignments.slice(0, 2)
  });

  const handleFormSubmit = () => {
    // This function is called when an assignment is successfully created
    // No additional logic needed as the form handles everything
  };

  // Build grading queue from Grade-Vault local fallback
  const allGV = typeof window !== 'undefined' ? localStorage.getItem('grade_vault_submissions') : null;
  const gvSubmissions = useMemo(() => {
    try {
      const arr = allGV ? JSON.parse(allGV) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [allGV]);

  const myPending = gvSubmissions.filter((s: any) => s.lecturerId === user?.id && s.gradingWorkflow?.stage === 'submitted');

  const unitsById = useMemo(() => {
    const map: Record<string, any> = {};
    createdUnits.forEach((u: any) => { map[u.id] = u; });
    return map;
  }, [createdUnits]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-gray-600">
            Create and manage course assignments 
            {syncedAssignments.length > 0 && (
              <span className="text-blue-600 ml-1">
                • {syncedAssignments.length} synced from semester plans
              </span>
            )}
          </p>
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

      {/* Grading Queue (local fallback) */}
      {myPending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions Waiting for Your Grading ({myPending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {myPending.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{s.title || 'Submission'}</span>
                    <span className="text-gray-600 ml-2">{s.studentName}</span>
                    <span className="text-gray-500 ml-2">{s.unitCode}</span>
                  </div>
                  <Button size="sm" onClick={() => { setGradingUnit(unitsById[s.unitId]); setShowGrading(true); }}>
                    Open Grading
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AssignmentTable assignments={allAssignments} />

      {showGrading && gradingUnit && (
        <LecturerGrading
          assignments={myPending.filter((s: any) => s.unitId === gradingUnit.id)}
          unitId={gradingUnit.id}
          unitCode={gradingUnit.code}
          unitName={gradingUnit.name}
          onGradeSubmission={async (submissionId, gradeData) => {
            // Update local/global Grade-Vault stores
            const allKey = 'grade_vault_submissions';
            const raw = localStorage.getItem(allKey);
            const list = raw ? JSON.parse(raw) : [];
            const updated = list.map((x: any) => x.id === submissionId ? {
              ...x,
              gradingWorkflow: gradeData.gradingWorkflow,
              gradeStatus: 'graded',
              status: 'graded'
            } : x);
            localStorage.setItem(allKey, JSON.stringify(updated));
          }}
        />
      )}
    </div>
  );
};
