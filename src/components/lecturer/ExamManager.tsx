
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ExamTable } from "./exam-manager/ExamTable";
import { EmptyExamState } from "./exam-manager/EmptyExamState";
import { useDashboardSync } from "@/hooks/useDashboardSync";

export const ExamManager = () => {
  const [activeTab, setActiveTab] = useState('cats');
  const { user, createdContent } = useAuth();
  
  // Get synced exams and CATs from semester plans
  const { getContentByType } = useDashboardSync('lecturer');
  const syncedCats = getContentByType('cat');
  const syncedExams = getContentByType('exam');

  // Get manually created content by current lecturer
  const lecturerContent = createdContent.filter(content => content.lecturerId === user?.id);
  const manualCats = lecturerContent.filter(content => content.type === 'cat');
  const manualExams = lecturerContent.filter(content => content.type === 'exam');

  // Combine manual and synced content, removing duplicates
  const allCats = [
    ...manualCats,
    ...syncedCats.filter(synced => 
      !manualCats.some(manual => manual.id === synced.id)
    )
  ];

  const allExams = [
    ...manualExams,
    ...syncedExams.filter(synced => 
      !manualExams.some(manual => manual.id === synced.id)
    )
  ];

  console.log('ExamManager Debug:', {
    manualCatsCount: manualCats.length,
    syncedCatsCount: syncedCats.length,
    totalCatsCount: allCats.length,
    manualExamsCount: manualExams.length,
    syncedExamsCount: syncedExams.length,
    totalExamsCount: allExams.length,
    syncedCatsSample: syncedCats.slice(0, 2),
    syncedExamsSample: syncedExams.slice(0, 2)
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exams & CATs Management</h2>
          <p className="text-gray-600">
            Manage your continuous assessments and examinations
            {(syncedCats.length > 0 || syncedExams.length > 0) && (
              <span className="text-blue-600 ml-1">
                • {syncedCats.length + syncedExams.length} synced from semester plans
              </span>
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cats">
            CATs ({allCats.length})
            {syncedCats.length > 0 && (
              <span className="text-xs text-blue-600 ml-1">+{syncedCats.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="exams">
            Exams ({allExams.length})
            {syncedExams.length > 0 && (
              <span className="text-xs text-blue-600 ml-1">+{syncedExams.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cats">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Assessment Tests (CATs)</CardTitle>
              <CardDescription>Manage your scheduled CATs</CardDescription>
            </CardHeader>
            <CardContent>
              {allCats.length === 0 ? (
                <EmptyExamState type="cats" />
              ) : (
                <ExamTable exams={allCats} type="cats" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Final Examinations</CardTitle>
              <CardDescription>Manage your scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {allExams.length === 0 ? (
                <EmptyExamState type="exams" />
              ) : (
                <ExamTable exams={allExams} type="exams" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
