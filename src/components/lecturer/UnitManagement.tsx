
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Settings, ExternalLink, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const UnitManagement = () => {
  const { toast } = useToast();
  const { user, createdUnits, updateCreatedUnit } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const handleUpdateWhatsAppLink = (unitId: string) => {
    if (!whatsappLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid WhatsApp link.",
        variant: "destructive",
      });
      return;
    }

    updateCreatedUnit(unitId, { whatsappLink });
    setWhatsappLink("");
    setIsEditDialogOpen(false);
    
    toast({
      title: "WhatsApp Link Updated",
      description: "Students can now join the WhatsApp group for this unit.",
    });
  };

  const handleEnableDiscussionGroup = (unitId: string) => {
    updateCreatedUnit(unitId, { hasDiscussionGroup: true });
    
    toast({
      title: "Discussion Group Enabled",
      description: "Students can now access the discussion group for this unit.",
    });
  };

  const openEditDialog = (unitId: string, currentLink?: string) => {
    setSelectedUnit(unitId);
    setWhatsappLink(currentLink || "");
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Allocated Units</h2>
          <p className="text-gray-600">Manage your assigned units and course resources</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedUnits.map((unit) => (
          <Card key={unit.id} className="h-full">
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
              
              <div className="flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(unit.id, unit.whatsappLink)}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {unit.whatsappLink ? "Update WhatsApp Link" : "Add WhatsApp Link"}
                </Button>
                
                {!unit.hasDiscussionGroup && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEnableDiscussionGroup(unit.id)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enable Discussion Group
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignedUnits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Units Assigned</h3>
            <p className="text-gray-500">
              You haven't been assigned any units yet. Contact the registrar to get units allocated to you.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update WhatsApp Link</DialogTitle>
            <DialogDescription>
              Add or update the WhatsApp group link for students to join
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappLink">WhatsApp Group Link</Label>
              <Input
                id="whatsappLink"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedUnit && handleUpdateWhatsAppLink(selectedUnit)}>
              Update Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
