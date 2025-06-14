
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UnitCardProps {
  unit: any;
  onClick: (unitId: string) => void;
}

export const UnitCard = ({ unit, onClick }: UnitCardProps) => {
  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(unit.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{unit.code}</CardTitle>
            <CardDescription className="font-medium text-gray-900 mt-1">
              {unit.name}
            </CardDescription>
          </div>
          <Badge variant="default">
            {unit.enrolled}/{unit.capacity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Course:</strong> {unit.course}</p>
          <p><strong>Year:</strong> {unit.year}, Semester {unit.semester}</p>
          <p><strong>Credits:</strong> {unit.credits}</p>
          {unit.schedule && (
            <p><strong>Schedule:</strong> {unit.schedule}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WhatsApp Group:</span>
            {unit.whatsappLink ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="secondary">Not Set</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Discussion Group:</span>
            {unit.hasDiscussionGroup ? (
              <Badge variant="default">Enabled</Badge>
            ) : (
              <Badge variant="secondary">Disabled</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
