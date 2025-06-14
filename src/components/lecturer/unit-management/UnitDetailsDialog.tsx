
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitSettingsTab } from "./UnitSettingsTab";
import { AssignmentForm } from "./AssignmentForm";
import { CATForm } from "./CATForm";
import { ExamForm } from "./ExamForm";
import { NotesForm } from "./NotesForm";
import { OnlineClassForm } from "./OnlineClassForm";
import { useToast } from "@/hooks/use-toast";

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

  if (!unit) return null;

  const handleAddAssignment = (assignment: any) => {
    toast({
      title: "Assignment Created",
      description: `${assignment.title} has been created successfully.`,
    });
    console.log("Assignment created:", assignment);
  };

  const handleAddCAT = (cat: any) => {
    toast({
      title: "CAT Scheduled",
      description: `${cat.title} has been scheduled successfully.`,
    });
    console.log("CAT scheduled:", cat);
  };

  const handleAddExam = (exam: any) => {
    toast({
      title: "Exam Submitted for Approval",
      description: `${exam.title} has been submitted to HOD for approval.`,
    });
    console.log("Exam submitted:", exam);
  };

  const handleAddNotes = (notes: any) => {
    toast({
      title: "Notes Uploaded",
      description: `${notes.title} has been uploaded successfully.`,
    });
    console.log("Notes uploaded:", notes);
  };

  const handleAddOnlineClass = (onlineClass: any) => {
    toast({
      title: "Online Class Scheduled",
      description: `${onlineClass.title} has been scheduled successfully.`,
    });
    console.log("Online class scheduled:", onlineClass);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit.name}</DialogTitle>
          <DialogDescription>Manage unit content and settings</DialogDescription>
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
            <AssignmentForm onAddAssignment={handleAddAssignment} />
          </TabsContent>

          <TabsContent value="cats" className="space-y-4">
            <CATForm onAddCAT={handleAddCAT} />
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <ExamForm onAddExam={handleAddExam} />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <NotesForm onAddNotes={handleAddNotes} />
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
