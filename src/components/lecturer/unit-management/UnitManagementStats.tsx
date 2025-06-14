
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, ExternalLink } from "lucide-react";

interface UnitManagementStatsProps {
  assignedUnits: any[];
}

export const UnitManagementStats = ({ assignedUnits }: UnitManagementStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Units</p>
              <p className="text-2xl font-bold text-blue-600">{assignedUnits.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-green-600">
                {assignedUnits.reduce((total, unit) => total + unit.enrolled, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Units with WhatsApp</p>
              <p className="text-2xl font-bold text-orange-600">
                {assignedUnits.filter(unit => unit.whatsappLink).length}
              </p>
            </div>
            <ExternalLink className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
