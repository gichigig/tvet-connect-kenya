import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Clock, Users, ExternalLink, MessageCircle } from "lucide-react";
import { AvailableUnit, PendingRegistration } from "./types";
import { UnitDetailDialog } from "./UnitDetailDialog";

interface RegisteredUnitsDisplayProps {
  units: AvailableUnit[];
  registrations: PendingRegistration[];
  onJoinWhatsApp?: (link: string) => void;
  onJoinDiscussion?: (unitCode: string) => void;
  onRegister?: (unitId: string) => void;
}

export const RegisteredUnitsDisplay = ({
  units,
  registrations,
  onJoinWhatsApp,
  onJoinDiscussion,
  onRegister
}: RegisteredUnitsDisplayProps) => {
  const [selectedUnit, setSelectedUnit] = useState<AvailableUnit | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleUnitClick = (unit: AvailableUnit) => {
    setSelectedUnit(unit);
    setIsDetailDialogOpen(true);
  };

  const getRegistrationStatus = (unitCode: string) => {
    const registration = registrations.find(reg => reg.unitCode === unitCode);
    return registration?.status || 'not-registered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedRegistration = selectedUnit ? registrations.find(reg => reg.unitCode === selectedUnit.code) : null;

  if (units.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Units Available</h3>
        <p className="text-gray-600">
          No units have been created for your course and year yet.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please contact the registrar to set up units for your course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Available Units for Your Course</h3>
        <Badge variant="outline">
          {units.length} unit{units.length !== 1 ? 's' : ''} found
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => {
          const status = getRegistrationStatus(unit.code);
          const isRegistered = status !== 'not-registered';
          
          return (
            <Card 
              key={unit.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
              onClick={() => handleUnitClick(unit)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{unit.code}</CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-700 mt-1">
                      {unit.name}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={unit.enrolled >= unit.capacity ? "destructive" : "default"}>
                      {unit.enrolled}/{unit.capacity}
                    </Badge>
                    {isRegistered && (
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">{unit.credits} Credits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Y{unit.year} S{unit.semester}</span>
                  </div>
                </div>

                {unit.lecturer && (
                  <div className="flex items-center gap-1 text-sm">
                    <User className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 truncate">{unit.lecturer.name}</span>
                  </div>
                )}

                {unit.schedule && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 text-xs truncate">{unit.schedule}</span>
                  </div>
                )}

                {/* Registration or Quick action buttons */}
                {!isRegistered ? (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    disabled={unit.enrolled >= unit.capacity}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister?.(unit.id);
                    }}
                  >
                    {unit.enrolled >= unit.capacity ? "Unit Full" : "Register"}
                  </Button>
                ) : status === 'approved' ? (
                  <div className="flex gap-1 pt-2">
                    {unit.whatsappLink && onJoinWhatsApp && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinWhatsApp(unit.whatsappLink!);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    
                    {unit.hasDiscussionGroup && onJoinDiscussion && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinDiscussion(unit.code);
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Discussion
                      </Button>
                    )}
                  </div>
                ) : null}

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Click to view detailed information
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UnitDetailDialog
        unit={selectedUnit}
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onJoinWhatsApp={onJoinWhatsApp}
        onJoinDiscussion={onJoinDiscussion}
        isRegistered={selectedRegistration !== undefined}
        registrationStatus={selectedRegistration?.status}
      />
    </div>
  );
};