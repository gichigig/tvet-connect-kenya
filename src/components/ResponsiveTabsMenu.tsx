
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ResponsiveTabsMenuProps {
  tabs: { value: string; label: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export const ResponsiveTabsMenu = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: ResponsiveTabsMenuProps) => {
  return (
    <div className={`md:hidden flex items-center ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Show menu">
            <Menu />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <ul>
            {tabs.map((tab) => (
              <li key={tab.value} className="border-b last:border-b-0">
                <button
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === tab.value
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onTabChange(tab.value)}
                  aria-current={activeTab === tab.value}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      <span className="ml-2 font-medium text-base truncate">
        {tabs.find((t) => t.value === activeTab)?.label}
      </span>
    </div>
  );
};
