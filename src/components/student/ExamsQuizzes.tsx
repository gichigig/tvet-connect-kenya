
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, PenTool, Award, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";

export const ExamsQuizzes = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'graded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exam' | 'quiz' | 'cat' | 'assignment'>('all');

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  if (approvedRegistrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <PenTool className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams or Quizzes Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have approved unit registrations to access exams and quizzes.
          </p>
          <div className="text-sm text-gray-500">
            <p>Register for units and wait for approval to see assessments here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'upcoming', 'active', 'completed', 'graded'].map((status) => (
              <Button 
                key={status}
                variant={filter === status ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'exam', 'quiz', 'cat', 'assignment'].map((type) => (
              <Button 
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter(type as any)}
              >
                {type === 'cat' ? 'CAT' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Available Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your lecturers haven't created any exams or quizzes yet for your registered units.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Registered Units:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {approvedRegistrations.map((reg) => (
              <Badge key={reg.id} variant="outline">
                {reg.unitCode} - {reg.unitName}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
