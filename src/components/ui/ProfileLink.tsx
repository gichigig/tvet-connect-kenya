import { Link } from "react-router-dom";
import { User } from "lucide-react";

export const ProfileLink = () => {
  return (
    <Link 
      to="/profile" 
      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
    >
      <User className="w-4 h-4 mr-2" />
      Profile Settings
    </Link>
  );
};