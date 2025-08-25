import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CampusAPI } from "@/integrations/api/campusAPI";
import { Campus } from "@/types/campus";
import { Unit } from "@/types/unitManagement";
import { MapPin, Users, Building, BookOpen, Clock, GraduationCap, MessageSquare, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentCampusRegistrationProps {
  availableUnits: Unit[];
  onRegistrationComplete: () => void;
}

export const StudentCampusRegistration = ({ 
  availableUnits, 
  onRegistrationComplete 
}: StudentCampusRegistrationProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCampuses();
  }, []);

  const loadCampuses = async () => {
    setIsLoading(true);
    try {
      const data = await CampusAPI.getAllCampuses();
      setCampuses(data);
    } catch (error) {
      console.error('Failed to load campuses:', error);
      toast({
        title: "Error",
        description: "Failed to load campuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampusSelect = (campus: Campus) => {
    setSelectedCampus(campus);
    // Filter units available at this campus
    const campusUnits = availableUnits.filter(unit => 
      !unit.availableCampuses || 
      unit.availableCampuses.length === 0 || 
      unit.availableCampuses.includes(campus.id)
    );
    setSelectedUnits(campusUnits);
    setIsDialogOpen(true);
  };

  const handleUnitRegistration = async (unit: Unit) => {
    if (!user?.id || !selectedCampus) return;

    try {
      await CampusAPI.registerStudentForCampusUnit(user.id, unit.id, selectedCampus.id);
      
      toast({
        title: "Registration Submitted",
        description: `Your registration for ${unit.code} at ${selectedCampus.name} has been submitted for approval.`,
      });

      onRegistrationComplete();
    } catch (error) {
      console.error('Failed to register for unit:', error);
      toast({
        title: "Error",
        description: "Failed to register for unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading campuses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Available Campuses</h3>
        <p className="text-gray-600">Select a campus to register for units</p>
      </div>

      {campuses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campuses available</h3>
            <p className="text-gray-600">No campuses are currently accepting registrations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campuses.map((campus) => (
            <Card key={campus.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {campus.name}
                </CardTitle>
                <CardDescription>Code: {campus.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {campus.location}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {campus.currentEnrollment} / {campus.capacity} students
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{campus.description}</p>

                {campus.facilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {campus.facilities.slice(0, 3).map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {campus.facilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{campus.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => handleCampusSelect(campus)}
                >
                  View Available Units
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unit Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Available Units at {selectedCampus?.name}
            </DialogTitle>
            <DialogDescription>
              Select units to register for at this campus
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUnits.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No units available</h3>
                <p className="text-gray-600">No units are currently available at this campus</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedUnits.map((unit) => (
                  <Card key={unit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{unit.code} - {unit.name}</h4>
                          <p className="text-gray-600 text-sm">{unit.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{unit.credits} Credits</Badge>
                          {unit.whatsappLink && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Year {unit.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Semester {unit.semester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{unit.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{unit.enrolled}/{unit.capacity}</span>
                        </div>
                      </div>

                      {unit.prerequisites.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {unit.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          onClick={() => handleUnitRegistration(unit)}
                          disabled={unit.enrolled >= unit.capacity}
                        >
                          {unit.enrolled >= unit.capacity ? 'Full' : 'Register'}
                        </Button>
                        
                        {unit.whatsappLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => window.open(unit.whatsappLink, '_blank')}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        
                        {unit.lecturerName && (
                          <div className="text-sm text-gray-600 flex items-center ml-auto">
                            <span>Lecturer: {unit.lecturerName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
