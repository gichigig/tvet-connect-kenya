
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ExamTable } from "./exam-manager/ExamTable";
import { EmptyExamState } from "./exam-manager/EmptyExamState";

export const ExamManager = () => {
  const [activeTab, setActiveTab] = useState('cats');
  const { user, createdContent } = useAuth();

  // Get content created by current lecturer
  const lecturerContent = createdContent.filter(content => content.lecturerId === user?.id);
  const cats = lecturerContent.filter(content => content.type === 'cat');
  const exams = lecturerContent.filter(content => content.type === 'exam');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exams & CATs Management</h2>
          <p className="text-gray-600">Manage your continuous assessments and examinations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cats">CATs ({cats.length})</TabsTrigger>
          <TabsTrigger value="exams">Exams ({exams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cats">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Assessment Tests (CATs)</CardTitle>
              <CardDescription>Manage your scheduled CATs</CardDescription>
            </CardHeader>
            <CardContent>
              {cats.length === 0 ? (
                <EmptyExamState type="cats" />
              ) : (
                <ExamTable exams={cats} type="cats" />
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
              {exams.length === 0 ? (
                <EmptyExamState type="exams" />
              ) : (
                <ExamTable exams={exams} type="exams" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
