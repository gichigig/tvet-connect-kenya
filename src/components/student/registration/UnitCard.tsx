
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, MessageCircle, Users } from "lucide-react";
import { AvailableUnit, PendingRegistration } from './types';

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
  const isAlreadyRegistered = pendingRegistrations.some(p => p.unitCode === unit.code);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{unit.code}</CardTitle>
            <CardDescription>{unit.name}</CardDescription>
          </div>
          <Badge variant="outline">{unit.credits} Credits</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{unit.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{unit.lecturer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{unit.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{unit.semester}, Year {unit.year}</span>
          </div>
        </div>

        {unit.prerequisites.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Prerequisites:</h4>
            <div className="flex flex-wrap gap-2">
              {unit.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="secondary" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {unit.whatsappLink && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onJoinWhatsApp(unit.whatsappLink!)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          )}
          {unit.hasDiscussionGroup && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onJoinDiscussion(unit.code)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Discussion
            </Button>
          )}
        </div>

        <Button 
          onClick={() => onRegister(unit.id)}
          className="w-full"
          disabled={isAlreadyRegistered}
        >
          {isAlreadyRegistered ? 'Already Registered' : 'Register for Unit'}
        </Button>
      </CardContent>
    </Card>
  );
};
