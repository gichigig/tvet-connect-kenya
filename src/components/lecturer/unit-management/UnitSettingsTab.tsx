
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, Plus } from "lucide-react";

interface UnitSettingsTabProps {
  whatsappLink: string;
  setWhatsappLink: (link: string) => void;
  onUpdateWhatsAppLink: () => void;
  onEnableDiscussionGroup: () => void;
  isDiscussionGroupEnabled: boolean;
  newItem: { title: string; description: string; link: string };
  onItemChange: (item: { title: string; description: string; link: string }) => void;
  onAddItem: (type: string) => void;
}

export const UnitSettingsTab = ({
  whatsappLink,
  setWhatsappLink,
  onUpdateWhatsAppLink,
  onEnableDiscussionGroup,
  isDiscussionGroupEnabled,
  newItem,
  onItemChange,
  onAddItem
}: UnitSettingsTabProps) => {
  return (
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
        <Button onClick={onUpdateWhatsAppLink}>
          Update WhatsApp Link
        </Button>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Discussion Group</h3>
        <p className="text-sm text-gray-600">
          Enable discussion group for students to communicate
        </p>
        <Button 
          onClick={onEnableDiscussionGroup}
          disabled={isDiscussionGroupEnabled}
        >
          {isDiscussionGroupEnabled ? "Discussion Group Enabled" : "Enable Discussion Group"}
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
              onChange={(e) => onItemChange({...newItem, title: e.target.value})}
              placeholder="Link title"
            />
          </div>
          <div>
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={newItem.link}
              onChange={(e) => onItemChange({...newItem, link: e.target.value})}
              placeholder="https://..."
            />
          </div>
        </div>
        <div>
          <Label htmlFor="link-description">Description</Label>
          <Textarea
            id="link-description"
            value={newItem.description}
            onChange={(e) => onItemChange({...newItem, description: e.target.value})}
            placeholder="Link description"
          />
        </div>
        <Button onClick={() => onAddItem("Link")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>
    </div>
  );
};
