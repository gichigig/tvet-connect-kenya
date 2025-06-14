
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, Download, Eye, Calendar, User, GraduationCap } from "lucide-react";

export const NotesAccess = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'lecture' | 'tutorial' | 'assignment' | 'reference'>('all');

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  if (approvedRegistrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notes & Materials</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notes Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have approved unit registrations to access course materials.
          </p>
          <div className="text-sm text-gray-500">
            <p>Register for units and wait for approval to see course materials here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notes & Materials</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Notes</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by title, unit code, or unit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Filter by Type</Label>
          <div className="flex gap-2">
            <Button 
              variant={filterType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button 
              variant={filterType === 'lecture' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('lecture')}
            >
              Lectures
            </Button>
            <Button 
              variant={filterType === 'tutorial' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('tutorial')}
            >
              Tutorials
            </Button>
            <Button 
              variant={filterType === 'assignment' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('assignment')}
            >
              Assignments
            </Button>
            <Button 
              variant={filterType === 'reference' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('reference')}
            >
              Reference
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Materials Available Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your lecturers haven't uploaded any course materials yet for your registered units.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Registered Units:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {approvedRegistrations.map((reg) => (
              <Badge key={reg.id} variant="outline">
                {reg.unitCode} - {reg.unitName}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
