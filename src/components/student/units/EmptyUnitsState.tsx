
import { GraduationCap } from "lucide-react";

export const EmptyUnitsState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Units</h2>
      </div>
      
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Units Registered</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven't registered for any units yet. Visit the Unit Registration tab to browse and register for available units.
        </p>
        <div className="text-sm text-gray-500">
          <p>Once you register for units and they are approved by the registrar,</p>
          <p>they will appear here in your dashboard.</p>
        </div>
      </div>
    </div>
  );
};
