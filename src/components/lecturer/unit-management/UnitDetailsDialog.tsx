
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Calendar, FileText, Video } from "lucide-react";
import { ContentForm } from "./ContentForm";
import { UnitSettingsTab } from "./UnitSettingsTab";

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
  if (!unit) return null;

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
            <ContentForm
              title="Add New Assignment"
              icon={<Upload className="w-4 h-4 mr-2" />}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
              type="Assignment"
              linkPlaceholder="Assignment link or file URL"
            />
          </TabsContent>

          <TabsContent value="cats" className="space-y-4">
            <ContentForm
              title="Add New CAT"
              icon={<Calendar className="w-4 h-4 mr-2" />}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
              type="CAT"
              linkPlaceholder="CAT link or document URL"
            />
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <ContentForm
              title="Add New Exam"
              icon={<FileText className="w-4 h-4 mr-2" />}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
              type="Exam"
              linkPlaceholder="Exam link or document URL"
            />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <ContentForm
              title="Add New Notes"
              icon={<FileText className="w-4 h-4 mr-2" />}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
              type="Notes"
              linkLabel="File Link"
              linkPlaceholder="Notes file URL or document link"
            />
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <ContentForm
              title="Add Online Class"
              icon={<Video className="w-4 h-4 mr-2" />}
              newItem={newItem}
              onItemChange={setNewItem}
              onAddItem={onAddItem}
              type="Online Class"
              linkLabel="Meeting Link"
              linkPlaceholder="Zoom, Teams, or other meeting link"
            />
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
