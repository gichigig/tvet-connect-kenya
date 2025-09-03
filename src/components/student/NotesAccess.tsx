
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useCourseContent } from "@/contexts/CourseContentContext";
import LocalFileDisplay from "@/components/ui/LocalFileDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, Download, Eye, Calendar, User, GraduationCap } from "lucide-react";

interface SyncedNote {
  id: string;
  type: string;
  title: string;
  description: string;
  unitCode: string;
  unitName: string;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  isFromSemesterPlan?: boolean;
  instructions?: string;
  dueDate?: string;
  maxMarks?: number;
}

interface NotesAccessProps {
  syncedNotes?: SyncedNote[];
}

export const NotesAccess = ({ syncedNotes = [] }: NotesAccessProps) => {
  const { user, pendingUnitRegistrations } = useAuth();
  const { getContentForStudent } = useCourseContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'assignment' | 'material' | 'exam' | 'cat'>('all');

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Get unit IDs for approved registrations
  const approvedUnitIds = approvedRegistrations.map(reg => reg.unitId);
  
  // Get all content for approved units
  const availableContent = getContentForStudent(user?.id || '', approvedUnitIds);
  
  // Combine original content with synced notes from semester plans
  const allContent = [
    ...availableContent,
    ...syncedNotes.map(note => ({
      ...note,
      lecturerName: 'Semester Plan',
      updatedAt: note.createdAt
    }))
  ];
  
  // Debug logging
  console.log('Student NotesAccess Debug:', {
    userId: user?.id,
    approvedUnitIds,
    originalContentCount: availableContent.length,
    syncedNotesCount: syncedNotes.length,
    totalContentCount: allContent.length,
    syncedNotes: syncedNotes.slice(0, 3) // First 3 synced items for debugging
  });
  
  // Filter content based on search and filter type
  const filteredContent = allContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || content.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
              variant={filterType === 'notes' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('notes')}
            >
              Notes
            </Button>
            <Button 
              variant={filterType === 'material' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('material')}
            >
              Materials
            </Button>
            <Button 
              variant={filterType === 'assignment' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('assignment')}
            >
              Assignments
            </Button>
            <Button 
              variant={filterType === 'exam' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('exam')}
            >
              Exams
            </Button>
            <Button 
              variant={filterType === 'cat' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('cat')}
            >
              CATs
            </Button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {availableContent.length === 0 ? "No Materials Available Yet" : "No matches found"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {availableContent.length === 0 
              ? "Your lecturers haven't uploaded any course materials yet for your registered units."
              : "Try adjusting your search terms or filters."
            }
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
      ) : (
        <div className="grid gap-4">
          {filteredContent.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription>{content.description}</CardDescription>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="secondary">{content.unitCode}</Badge>
                      <Badge variant="outline" className="capitalize">{content.type}</Badge>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {content.lecturerName || 'Unknown Lecturer'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(content.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {content.fileUrl && (
                      <LocalFileDisplay
                        fileUrl={content.fileUrl}
                        fileName={content.fileName || 'Download'}
                        className="flex items-center gap-1 px-3 py-1 text-sm"
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              {(content.instructions || content.dueDate || content.maxMarks) && (
                <CardContent>
                  {content.instructions && (
                    <div className="mb-2">
                      <strong className="text-sm">Instructions:</strong>
                      <p className="text-sm text-gray-600 mt-1">{content.instructions}</p>
                    </div>
                  )}
                  {content.dueDate && (
                    <div className="mb-2">
                      <strong className="text-sm">Due Date:</strong>
                      <span className="text-sm text-gray-600 ml-2">
                        {new Date(content.dueDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {content.maxMarks && (
                    <div>
                      <strong className="text-sm">Max Marks:</strong>
                      <span className="text-sm text-gray-600 ml-2">{content.maxMarks}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
