
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Users } from "lucide-react";
import { Unit } from './types';

interface UnitCardProps {
  unit: Unit;
  onUnitClick: (unit: Unit) => void;
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

export const UnitCard = ({ unit, onUnitClick }: UnitCardProps) => {
  return (
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
          <Badge className={getStatusColor(unit.status)}>
            {unit.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{unit.progress}%</span>
          </div>
          <Progress value={unit.progress} className="h-2" />
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
      </CardContent>
    </Card>
  );
};
