
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, Download, Eye, Calendar, User } from "lucide-react";

interface Note {
  id: string;
  title: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  type: 'lecture' | 'tutorial' | 'assignment' | 'reference';
  uploadDate: string;
  fileSize: string;
  downloadUrl: string;
  description: string;
}

const notes: Note[] = [
  {
    id: "1",
    title: "Introduction to OOP Concepts",
    unitCode: "SE101",
    unitName: "Introduction to Software Engineering",
    lecturer: "Dr. John Kamau",
    type: 'lecture',
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
    downloadUrl: "#",
    description: "Comprehensive guide to Object-Oriented Programming principles"
  },
  {
    id: "2",
    title: "Database Normalization Tutorial",
    unitCode: "DB201",
    unitName: "Database Management Systems",
    lecturer: "Prof. Mary Wanjiku",
    type: 'tutorial',
    uploadDate: "2024-01-18",
    fileSize: "1.8 MB",
    downloadUrl: "#",
    description: "Step-by-step guide to database normalization techniques"
  },
  {
    id: "3",
    title: "Web Development Assignment 1",
    unitCode: "WEB301",
    unitName: "Web Development",
    lecturer: "Mr. Peter Mwangi",
    type: 'assignment',
    uploadDate: "2024-01-20",
    fileSize: "500 KB",
    downloadUrl: "#",
    description: "Create a responsive landing page using HTML, CSS, and JavaScript"
  },
  {
    id: "4",
    title: "Programming Reference Manual",
    unitCode: "PROG101",
    unitName: "Programming Fundamentals",
    lecturer: "Ms. Grace Njeri",
    type: 'reference',
    uploadDate: "2024-01-10",
    fileSize: "5.2 MB",
    downloadUrl: "#",
    description: "Complete reference guide for programming concepts and syntax"
  }
];

export const NotesAccess = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'lecture' | 'tutorial' | 'assignment' | 'reference'>('all');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || note.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'tutorial':
        return 'bg-green-100 text-green-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'reference':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (note: Note) => {
    // In a real application, this would trigger the actual download
    console.log(`Downloading: ${note.title}`);
  };

  const handlePreview = (note: Note) => {
    // In a real application, this would open a preview modal or new tab
    console.log(`Previewing: ${note.title}`);
  };

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

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <CardDescription>{note.unitCode} - {note.unitName}</CardDescription>
                </div>
                <Badge className={getTypeColor(note.type)}>
                  {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">{note.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{note.lecturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(note.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{note.fileSize}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePreview(note)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownload(note)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No notes found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};
