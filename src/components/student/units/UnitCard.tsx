
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Users, MessageSquare, ExternalLink, GraduationCap, Clock } from "lucide-react";
import { Unit } from './types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentSemesterPlanView } from "../StudentSemesterPlanView";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";

interface UnitCardProps {
  unit: Unit;
  onUnitClick: (unit: Unit) => void;
  onJoinWhatsApp?: (link: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const UnitCard = ({ unit, onUnitClick, onJoinWhatsApp }: UnitCardProps) => {
  const [showSemesterPlan, setShowSemesterPlan] = useState(false);
  const { getSemesterProgress } = useSemesterPlan();

  // Get real semester progress from semester plan context
  const semesterProgress = getSemesterProgress(unit.id);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the unit click
    if (unit.whatsappLink && onJoinWhatsApp) {
      onJoinWhatsApp(unit.whatsappLink);
    }
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => onUnitClick(unit)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{unit.code}</CardTitle>
              <CardDescription className="text-sm">{unit.name}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(unit.status)}>
                {unit.status}
              </Badge>
              {unit.whatsappLink && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  WhatsApp
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Semester Progress</span>
              <span>{semesterProgress}%</span>
            </div>
            <Progress value={semesterProgress} className="h-2" />
            <div className="text-xs text-gray-500 text-center">
              Based on current week in semester plan
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{unit.lecturer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{unit.nextClass}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{unit.credits} Credits</span>
            </div>
          </div>
          
          {/* Click to view content hint */}
          <div className="pt-3 border-t">
            <div className="text-center text-sm text-blue-600 font-medium">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Click to view content
            </div>
          </div>
            
          {/* WhatsApp Quick Join Button */}
          {unit.whatsappLink && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={handleWhatsAppClick}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Join WhatsApp Group
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
};
