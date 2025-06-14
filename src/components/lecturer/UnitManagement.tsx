
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UnitManagementStats } from "./unit-management/UnitManagementStats";
import { UnitCard } from "./unit-management/UnitCard";
import { UnitDetailsDialog } from "./unit-management/UnitDetailsDialog";

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

  const handleUpdateWhatsAppLink = () => {
    if (!selectedUnit) return;
    
    if (!whatsappLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid WhatsApp link.",
        variant: "destructive",
      });
      return;
    }

    updateCreatedUnit(selectedUnit, { whatsappLink });
    setWhatsappLink("");
    
    toast({
      title: "WhatsApp Link Updated",
      description: "Students can now join the WhatsApp group for this unit.",
    });
  };

  const handleEnableDiscussionGroup = () => {
    if (!selectedUnit) return;
    
    updateCreatedUnit(selectedUnit, { hasDiscussionGroup: true });
    
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

    toast({
      title: "Item Added",
      description: `${type} "${newItem.title}" has been added successfully.`,
    });

    setNewItem({ title: "", description: "", link: "" });
  };

  const selectedUnitData = selectedUnit ? assignedUnits.find(u => u.id === selectedUnit) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Allocated Units</h2>
          <p className="text-gray-600">Click on a unit to manage its content</p>
        </div>
      </div>

      <UnitManagementStats assignedUnits={assignedUnits} />

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedUnits.map((unit) => (
          <UnitCard 
            key={unit.id} 
            unit={unit} 
            onClick={openUnitDetails}
          />
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

      <UnitDetailsDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        unit={selectedUnitData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        whatsappLink={whatsappLink}
        setWhatsappLink={setWhatsappLink}
        newItem={newItem}
        setNewItem={setNewItem}
        onUpdateWhatsAppLink={handleUpdateWhatsAppLink}
        onEnableDiscussionGroup={handleEnableDiscussionGroup}
        onAddItem={handleAddItem}
      />
    </div>
  );
};
