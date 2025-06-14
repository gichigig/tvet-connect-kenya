
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, ExternalLink } from "lucide-react";
import { AvailableUnit, PendingRegistration } from "./types";

interface UnitCardProps {
  unit: AvailableUnit;
  pendingRegistrations: PendingRegistration[];
  onRegister: (unitId: string) => void;
  onJoinWhatsApp: (link: string) => void;
  onJoinDiscussion: (unitCode: string) => void;
}

export const UnitCard = ({
  unit,
  pendingRegistrations,
  onRegister,
  onJoinWhatsApp,
  onJoinDiscussion
}: UnitCardProps) => {
  const isRegistered = pendingRegistrations.some(reg => reg.unitCode === unit.code);
  const registration = pendingRegistrations.find(reg => reg.unitCode === unit.code);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{unit.code}</CardTitle>
            <CardDescription className="text-sm font-medium text-gray-900 mt-1">
              {unit.name}
            </CardDescription>
          </div>
          <Badge variant={unit.enrolled >= unit.capacity ? "destructive" : "default"}>
            {unit.enrolled}/{unit.capacity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Credits:</strong> {unit.credits}</p>
          <p><strong>Department:</strong> {unit.department}</p>
          {unit.lecturer && (
            <p><strong>Lecturer:</strong> {unit.lecturer.name}</p>
          )}
          {unit.schedule && (
            <p><strong>Schedule:</strong> {unit.schedule}</p>
          )}
        </div>
        
        {unit.description && (
          <p className="text-sm text-gray-600">{unit.description}</p>
        )}
        
        {unit.prerequisites.length > 0 && (
          <div>
            <p className="text-sm font-medium">Prerequisites:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {unit.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          {!isRegistered ? (
            <Button 
              onClick={() => onRegister(unit.id)}
              disabled={unit.enrolled >= unit.capacity}
              className="w-full"
            >
              {unit.enrolled >= unit.capacity ? "Unit Full" : "Register"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Badge 
                variant={
                  registration?.status === 'approved' ? 'default' : 
                  registration?.status === 'rejected' ? 'destructive' : 
                  'secondary'
                }
                className="w-full justify-center py-2"
              >
                Registration {registration?.status}
              </Badge>
              
              {registration?.status === 'approved' && (
                <div className="flex space-x-2">
                  {unit.whatsappLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onJoinWhatsApp(unit.whatsappLink!)}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {unit.hasDiscussionGroup && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onJoinDiscussion(unit.code)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Discussion
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
