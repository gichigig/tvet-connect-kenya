
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface StudentMobileMenuProps {
  menuItems: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
  }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentMobileMenu = ({
  menuItems,
  activeTab,
  setActiveTab
}: StudentMobileMenuProps) => (
  <div className="md:hidden">
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Student Menu</SheetTitle>
          <SheetDescription>
            Navigate through your student portal
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  </div>
);
