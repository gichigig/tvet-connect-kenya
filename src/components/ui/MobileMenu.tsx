import { useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileMenuProps {
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <button
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-50 border-b animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
