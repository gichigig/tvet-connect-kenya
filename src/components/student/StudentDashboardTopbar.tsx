
import { User } from "@/contexts/auth/types";

export const StudentDashboardTopbar = ({ user }: { user: User }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
    <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
    {user?.admissionNumber && (
      <p className="text-sm text-blue-600 font-medium mt-1">
        Admission Number: {user.admissionNumber}
      </p>
    )}
  </div>
);
