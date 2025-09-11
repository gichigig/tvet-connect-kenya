import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, PauseCircle, Calendar, Settings } from "lucide-react";

interface SemesterReportingPeriod {
  id: string;
  isActive: boolean;
  academicYear: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  activatedBy: string;
  activatedAt: Date;
}

interface ExamCardActivation {
  isActive: boolean;
  activatedBy: string;
  activatedAt: Date;
  examPeriod: string;
  instructions: string;
}

export const HodSemesterControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportingPeriod, setReportingPeriod] = useState<SemesterReportingPeriod | null>(null);
  const [examCardActivation, setExamCardActivation] = useState<ExamCardActivation | null>(null);
  const [formData, setFormData] = useState({
    academicYear: new Date().getFullYear().toString(),
    semester: '1',
    examPeriod: '',
    instructions: 'Standard examination instructions apply. Students must arrive 30 minutes before the exam.'
  });
  const db = getFirestore();

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      // Load reporting period
      const periodDoc = await getDoc(doc(db, 'semesterReporting', 'currentPeriod'));
      if (periodDoc.exists()) {
        setReportingPeriod(periodDoc.data() as SemesterReportingPeriod);
      }

      // Load exam card activation
      const examDoc = await getDoc(doc(db, 'examCardActivation', 'current'));
      if (examDoc.exists()) {
        setExamCardActivation(examDoc.data() as ExamCardActivation);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleActivateReporting = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const period: SemesterReportingPeriod = {
        id: 'currentPeriod',
        isActive: true,
        academicYear: formData.academicYear,
        semester: formData.semester,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        activatedBy: `${user.firstName} ${user.lastName}`,
        activatedAt: new Date()
      };

      await setDoc(doc(db, 'semesterReporting', 'currentPeriod'), period);
      setReportingPeriod(period);
      
      toast({
        title: "Semester Reporting Activated",
        description: `Students can now report for Academic Year ${formData.academicYear} Semester ${formData.semester}`,
      });
    } catch (error) {
      console.error('Error activating reporting:', error);
      toast({
        title: "Error",
        description: "Failed to activate semester reporting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateReporting = async () => {
    if (!reportingPeriod) return;

    setLoading(true);
    try {
      const updatedPeriod = {
        ...reportingPeriod,
        isActive: false
      };

      await setDoc(doc(db, 'semesterReporting', 'currentPeriod'), updatedPeriod);
      setReportingPeriod(updatedPeriod);
      
      toast({
        title: "Semester Reporting Deactivated",
        description: "Students can no longer submit semester reports",
      });
    } catch (error) {
      console.error('Error deactivating reporting:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate semester reporting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateExamCard = async () => {
    if (!user || !formData.examPeriod) {
      toast({
        title: "Missing Information",
        description: "Please specify the exam period",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const activation: ExamCardActivation = {
        isActive: true,
        activatedBy: `${user.firstName} ${user.lastName}`,
        activatedAt: new Date(),
        examPeriod: formData.examPeriod,
        instructions: formData.instructions
      };

      await setDoc(doc(db, 'examCardActivation', 'current'), activation);
      setExamCardActivation(activation);
      
      toast({
        title: "Exam Cards Activated",
        description: `Students can now download exam cards for ${formData.examPeriod}`,
      });
    } catch (error) {
      console.error('Error activating exam cards:', error);
      toast({
        title: "Error",
        description: "Failed to activate exam cards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateExamCard = async () => {
    if (!examCardActivation) return;

    setLoading(true);
    try {
      const updatedActivation = {
        ...examCardActivation,
        isActive: false
      };

      await setDoc(doc(db, 'examCardActivation', 'current'), updatedActivation);
      setExamCardActivation(updatedActivation);
      
      toast({
        title: "Exam Cards Deactivated",
        description: "Students can no longer download exam cards",
      });
    } catch (error) {
      console.error('Error deactivating exam cards:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate exam cards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Semester & Exam Management</h2>
      </div>

      {/* Semester Reporting Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semester Reporting Period
          </CardTitle>
          <CardDescription>
            Control when students can report their semester information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportingPeriod && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    reportingPeriod.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {reportingPeriod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Academic Year:</span>
                  <span className="ml-2">{reportingPeriod.academicYear}</span>
                </div>
                <div>
                  <span className="font-medium">Semester:</span>
                  <span className="ml-2">{reportingPeriod.semester}</span>
                </div>
                <div>
                  <span className="font-medium">Activated By:</span>
                  <span className="ml-2">{reportingPeriod.activatedBy}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                placeholder="2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleActivateReporting}
              disabled={loading || reportingPeriod?.isActive}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Activate Reporting
            </Button>
            <Button
              onClick={handleDeactivateReporting}
              disabled={loading || !reportingPeriod?.isActive}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PauseCircle className="w-4 h-4" />
              Deactivate Reporting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exam Card Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Exam Card Activation
          </CardTitle>
          <CardDescription>
            Control when students can download their exam cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {examCardActivation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    examCardActivation.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {examCardActivation.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Exam Period:</span>
                  <span className="ml-2">{examCardActivation.examPeriod}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Activated By:</span>
                  <span className="ml-2">{examCardActivation.activatedBy}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examPeriod">Exam Period</Label>
              <Input
                id="examPeriod"
                value={formData.examPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, examPeriod: e.target.value }))}
                placeholder="End of Semester 1 Examinations 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Additional Instructions</Label>
              <Input
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Special instructions for students"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleActivateExamCard}
              disabled={loading || examCardActivation?.isActive}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Activate Exam Cards
            </Button>
            <Button
              onClick={handleDeactivateExamCard}
              disabled={loading || !examCardActivation?.isActive}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PauseCircle className="w-4 h-4" />
              Deactivate Exam Cards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
