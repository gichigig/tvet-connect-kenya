
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Settings, ExternalLink, Plus, Upload, FileText, Video, Calendar, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const UnitManagement = () => {
  const { toast } = useToast();
  const { user, createdUnits, updateCreatedUnit } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [newItem, setNewItem] = useState({ title: "", description: "", link: "" });
  const [activeTab, setActiveTab] = useState("assignments");

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

  const openUnitDetails = (unitId: string) => {
    const unit = assignedUnits.find(u => u.id === unitId);
    if (unit) {
      setSelectedUnit(unitId);
      setWhatsappLink(unit.whatsappLink || "");
      setIsDetailDialogOpen(true);
    }
  };

  const handleAddItem = (type: string) => {
    if (!newItem.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save to a database
    toast({
      title: "Item Added",
      description: `${type} "${newItem.title}" has been added successfully.`,
    });

    setNewItem({ title: "", description: "", link: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Allocated Units</h2>
          <p className="text-gray-600">Click on a unit to manage its content</p>
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
          <Card 
            key={unit.id} 
            className="h-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openUnitDetails(unit.id)}
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

      {/* Unit Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUnit && assignedUnits.find(u => u.id === selectedUnit)?.name}
            </DialogTitle>
            <DialogDescription>
              Manage unit content and settings
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="cats">CATs</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="classes">Online Classes</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Add New Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignment-title">Title</Label>
                    <Input
                      id="assignment-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="Assignment title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-link">Link (optional)</Label>
                    <Input
                      id="assignment-link"
                      value={newItem.link}
                      onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                      placeholder="Assignment link or file URL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assignment-description">Description</Label>
                  <Textarea
                    id="assignment-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Assignment description and instructions"
                  />
                </div>
                <Button onClick={() => handleAddItem("Assignment")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assignment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cats" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add New CAT
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cat-title">CAT Title</Label>
                    <Input
                      id="cat-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="CAT title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-link">Link (optional)</Label>
                    <Input
                      id="cat-link"
                      value={newItem.link}
                      onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                      placeholder="CAT link or document URL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cat-description">Description</Label>
                  <Textarea
                    id="cat-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="CAT description and instructions"
                  />
                </div>
                <Button onClick={() => handleAddItem("CAT")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add CAT
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="exams" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Add New Exam
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exam-title">Exam Title</Label>
                    <Input
                      id="exam-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="Exam title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exam-link">Link (optional)</Label>
                    <Input
                      id="exam-link"
                      value={newItem.link}
                      onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                      placeholder="Exam link or document URL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exam-description">Description</Label>
                  <Textarea
                    id="exam-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Exam description and instructions"
                  />
                </div>
                <Button onClick={() => handleAddItem("Exam")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exam
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Add New Notes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notes-title">Notes Title</Label>
                    <Input
                      id="notes-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="Notes title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes-link">File Link</Label>
                    <Input
                      id="notes-link"
                      value={newItem.link}
                      onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                      placeholder="Notes file URL or document link"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes-description">Description</Label>
                  <Textarea
                    id="notes-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Notes description and content overview"
                  />
                </div>
                <Button onClick={() => handleAddItem("Notes")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Notes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Add Online Class
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class-title">Class Title</Label>
                    <Input
                      id="class-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="Class session title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class-link">Meeting Link</Label>
                    <Input
                      id="class-link"
                      value={newItem.link}
                      onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                      placeholder="Zoom, Teams, or other meeting link"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="class-description">Description</Label>
                  <Textarea
                    id="class-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Class agenda and topics to be covered"
                  />
                </div>
                <Button onClick={() => handleAddItem("Online Class")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Online Class
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-6">
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">WhatsApp Group</h3>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappLink">WhatsApp Group Link</Label>
                    <Input
                      id="whatsappLink"
                      value={whatsappLink}
                      onChange={(e) => setWhatsappLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </div>
                  <Button onClick={() => selectedUnit && handleUpdateWhatsAppLink(selectedUnit)}>
                    Update WhatsApp Link
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Discussion Group</h3>
                  <p className="text-sm text-gray-600">
                    Enable discussion group for students to communicate
                  </p>
                  <Button 
                    onClick={() => selectedUnit && handleEnableDiscussionGroup(selectedUnit)}
                    disabled={selectedUnit ? assignedUnits.find(u => u.id === selectedUnit)?.hasDiscussionGroup : false}
                  >
                    {selectedUnit && assignedUnits.find(u => u.id === selectedUnit)?.hasDiscussionGroup 
                      ? "Discussion Group Enabled" 
                      : "Enable Discussion Group"}
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Link className="w-4 h-4 mr-2" />
                    Add Other Links
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="link-title">Link Title</Label>
                      <Input
                        id="link-title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                        placeholder="Link title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        value={newItem.link}
                        onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="link-description">Description</Label>
                    <Textarea
                      id="link-description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Link description"
                    />
                  </div>
                  <Button onClick={() => handleAddItem("Link")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
