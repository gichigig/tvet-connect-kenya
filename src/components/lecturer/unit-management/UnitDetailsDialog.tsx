import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitSettingsTab } from "./UnitSettingsTab";
import { AssignmentForm } from "./AssignmentForm";
import { CATForm } from "./CATForm";
import { ExamForm } from "./ExamForm";
import { NotesForm } from "./NotesForm";
import { OnlineClassForm } from "./OnlineClassForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { ResponsiveTabsMenu } from "@/components/ResponsiveTabsMenu";

interface UnitDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unit: any | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  whatsappLink: string;
  setWhatsappLink: (link: string) => void;
  newItem: { title: string; description: string; link: string };
  setNewItem: (item: { title: string; description: string; link: string }) => void;
  onUpdateWhatsAppLink: () => void;
  onEnableDiscussionGroup: () => void;
  onAddItem: (type: string) => void;
}

export const UnitDetailsDialog = ({
  isOpen,
  onOpenChange,
  unit,
  activeTab,
  setActiveTab,
  whatsappLink,
  setWhatsappLink,
  newItem,
  setNewItem,
  onUpdateWhatsAppLink,
  onEnableDiscussionGroup,
  onAddItem
}: UnitDetailsDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  if (!unit) return null;

  const handleAddAssignment = (assignment: any) => {
    const contentItem = {
      id: Date.now().toString(),
      ...assignment,
      lecturerId: user?.id,
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code
    };
    
    toast({
      title: "Assignment Created",
      description: `${assignment.title} has been created successfully.`,
    });
    console.log("Assignment created:", contentItem);
  };

  const handleAddCAT = (cat: any) => {
    const contentItem = {
      id: Date.now().toString(),
      ...cat,
      lecturerId: user?.id,
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code
    };
    
    toast({
      title: "CAT Scheduled",
      description: `${cat.title} has been scheduled successfully.`,
    });
    console.log("CAT scheduled:", contentItem);
  };

  const handleAddExam = (exam: any) => {
    const contentItem = {
      id: Date.now().toString(),
      ...exam,
      lecturerId: user?.id,
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code
    };
    
    toast({
      title: "Exam Submitted for Approval",
      description: `${exam.title} has been submitted to HOD for approval.`,
    });
    console.log("Exam submitted:", contentItem);
  };

  const handleAddNotes = (notes: any) => {
    const contentItem = {
      id: Date.now().toString(),
      ...notes,
      lecturerId: user?.id,
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code
    };
    
    toast({
      title: "Notes Uploaded",
      description: `${notes.title} has been uploaded successfully.`,
    });
    console.log("Notes uploaded:", contentItem);
  };

  const handleAddOnlineClass = (onlineClass: any) => {
    const contentItem = {
      id: Date.now().toString(),
      ...onlineClass,
      lecturerId: user?.id,
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code
    };
    
    toast({
      title: "Online Class Scheduled",
      description: `${onlineClass.title} has been scheduled successfully.`,
    });
    console.log("Online class scheduled:", contentItem);
  };

  // Tab configuration for menu & triggers
  const tabItems = [
    { value: "assignments", label: "Assignments" },
    { value: "cats", label: "CATs" },
    { value: "exams", label: "Exams" },
    { value: "notes", label: "Notes" },
    { value: "classes", label: "Online Classes" },
    { value: "settings", label: "Settings" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit.name}</DialogTitle>
          <DialogDescription>Manage unit content and settings</DialogDescription>
        </DialogHeader>
        
        {/* Hamburger menu for mobile */}
        <div className="mb-3">
          <ResponsiveTabsMenu tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tabs triggers only on md+ screens */}
        <div className="hidden md:block mb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              {tabItems.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
          <TabsContent value="assignments" className="space-y-4">
            <AssignmentForm onAddAssignment={handleAddAssignment} unitCode={unit.code} unitId={unit.id} />
          </TabsContent>
          <TabsContent value="cats" className="space-y-4">
            <CATForm onAddCAT={handleAddCAT} unitCode={unit.code} unitId={unit.id} />
          </TabsContent>
          <TabsContent value="exams" className="space-y-4">
            <ExamForm onAddExam={handleAddExam} unitCode={unit.code} unitId={unit.id} />
          </TabsContent>
          <TabsContent value="notes" className="space-y-4">
            <NotesForm onAddNotes={handleAddNotes} unitCode={unit.code} unitId={unit.id} />
          </TabsContent>
          <TabsContent value="classes" className="space-y-4">
            <OnlineClassForm onAddOnlineClass={handleAddOnlineClass} />
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <UnitSettingsTab
              whatsappLink={whatsappLink}
              setWhatsappLink={setWhatsappLink}
              onUpdateWhatsAppLink={onUpdateWhatsAppLink}
              onEnableDiscussionGroup={onEnableDiscussionGroup}
              isDiscussionGroupEnabled={unit.hasDiscussionGroup}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
