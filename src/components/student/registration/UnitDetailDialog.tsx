import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, BookOpen, GraduationCap, MessageCircle, ExternalLink } from "lucide-react";
import { AvailableUnit } from "./types";

interface UnitDetailDialogProps {
  unit: AvailableUnit | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinWhatsApp?: (link: string) => void;
  onJoinDiscussion?: (unitCode: string) => void;
  isRegistered?: boolean;
  registrationStatus?: string;
}

export const UnitDetailDialog = ({
  unit,
  isOpen,
  onOpenChange,
  onJoinWhatsApp,
  onJoinDiscussion,
  isRegistered = false,
  registrationStatus
}: UnitDetailDialogProps) => {
  if (!unit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {unit.code} - {unit.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this unit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Unit Status */}
          <div className="flex items-center gap-4">
            <Badge variant={unit.enrolled >= unit.capacity ? "destructive" : "default"}>
              {unit.enrolled}/{unit.capacity} Students
            </Badge>
            {isRegistered && registrationStatus && (
              <Badge 
                variant={
                  registrationStatus === 'approved' ? 'default' : 
                  registrationStatus === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                Registration {registrationStatus}
              </Badge>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Credits:</span>
                <span className="font-medium">{unit.credits}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Department:</span>
                <span className="font-medium">{unit.department}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Year:</span>
                <span className="font-medium">Year {unit.year}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Semester:</span>
                <span className="font-medium">Semester {unit.semester}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Capacity:</span>
                <span className="font-medium">{unit.capacity} students</span>
              </div>

              {unit.schedule && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Schedule:</span>
                  <span className="font-medium text-xs">{unit.schedule}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Lecturer Information */}
          {unit.lecturer && (
            <div className="space-y-2">
              <h4 className="font-medium">Lecturer Information</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{unit.lecturer.name}</p>
                <p className="text-sm text-gray-600">{unit.lecturer.email}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {unit.description && (
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {unit.description}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {unit.prerequisites.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Prerequisites</h4>
              <div className="flex flex-wrap gap-2">
                {unit.prerequisites.map((prereq) => (
                  <Badge key={prereq} variant="outline">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons for Approved Registrations */}
          {isRegistered && registrationStatus === 'approved' && (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-medium">Unit Resources</h4>
              <div className="flex gap-2">
                {unit.whatsappLink && onJoinWhatsApp && (
                  <Button
                    variant="outline"
                    onClick={() => onJoinWhatsApp(unit.whatsappLink!)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join WhatsApp Group
                  </Button>
                )}
                
                {unit.hasDiscussionGroup && onJoinDiscussion && (
                  <Button
                    variant="outline"
                    onClick={() => onJoinDiscussion(unit.code)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discussion Group
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
