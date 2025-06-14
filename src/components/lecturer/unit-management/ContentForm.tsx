
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface ContentFormProps {
  title: string;
  icon: React.ReactNode;
  newItem: { title: string; description: string; link: string };
  onItemChange: (item: { title: string; description: string; link: string }) => void;
  onAddItem: (type: string) => void;
  type: string;
  linkLabel?: string;
  linkPlaceholder?: string;
}

export const ContentForm = ({ 
  title, 
  icon, 
  newItem, 
  onItemChange, 
  onAddItem, 
  type,
  linkLabel = "Link (optional)",
  linkPlaceholder = "Link or file URL"
}: ContentFormProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold flex items-center">
        {icon}
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${type}-title`}>Title</Label>
          <Input
            id={`${type}-title`}
            value={newItem.title}
            onChange={(e) => onItemChange({...newItem, title: e.target.value})}
            placeholder={`${type} title`}
          />
        </div>
        <div>
          <Label htmlFor={`${type}-link`}>{linkLabel}</Label>
          <Input
            id={`${type}-link`}
            value={newItem.link}
            onChange={(e) => onItemChange({...newItem, link: e.target.value})}
            placeholder={linkPlaceholder}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${type}-description`}>Description</Label>
        <Textarea
          id={`${type}-description`}
          value={newItem.description}
          onChange={(e) => onItemChange({...newItem, description: e.target.value})}
          placeholder={`${type} description and instructions`}
        />
      </div>
      <Button onClick={() => onAddItem(type)}>
        <Plus className="w-4 h-4 mr-2" />
        Add {type}
      </Button>
    </div>
  );
};
