import { useState, useEffect, useRef } from "react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Download, Send, Plus, Trash2, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { createNotification } from "@/utils/notificationUtils";
import { uploadStudentDocument } from "@/integrations/aws/fileUpload";

interface TimetableEntry {
  id: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  day: string;
  time: string;
  venue: string;
  duration: string;
  course: string;
  year: number;
  semester: number;
}

interface Timetable {
  id: string;
  name: string;
  description: string;
  course: string;
  year: number;
  semester: number;
  entries: TimetableEntry[];
  createdDate: string;
  isActive: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export const TimetableManagement = () => {
  const { getAllActiveUnits } = useUnits();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newTimetable, setNewTimetable] = useState({
    name: '',
    description: '',
    course: '',
    year: 1,
    semester: 1
  });
  const [newEntry, setNewEntry] = useState({
    unitCode: '',
    day: '',
    time: '',
    venue: '',
    duration: '2'
  });

  const units = getAllActiveUnits();
  const users = getAllUsers();
  const lecturers = users.filter(u => u.role === 'lecturer');
  const students = users.filter(u => u.role === 'student' && u.approved);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const handleCreateTimetable = () => {
    if (!newTimetable.name || !newTimetable.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const timetable: Timetable = {
      id: Date.now().toString(),
      ...newTimetable,
      entries: [],
      createdDate: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setTimetables(prev => [...prev, timetable]);
    setSelectedTimetable(timetable);
    setNewTimetable({ name: '', description: '', course: '', year: 1, semester: 1 });
    setIsCreateDialogOpen(false);

    toast({
      title: "Timetable Created",
      description: `${timetable.name} has been created successfully.`,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, Excel file, or image.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleUploadTimetable = async () => {
    if (!uploadFile || !newTimetable.name || !newTimetable.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to S3
      const fileUrl = await uploadStudentDocument(uploadFile, `timetable_${Date.now()}`);
      
      const timetable: Timetable = {
        id: Date.now().toString(),
        ...newTimetable,
        entries: [],
        createdDate: new Date().toISOString().split('T')[0],
        isActive: true,
        fileUrl,
        fileName: uploadFile.name,
        fileSize: uploadFile.size
      };

      setTimetables(prev => [...prev, timetable]);
      setSelectedTimetable(timetable);
      setNewTimetable({ name: '', description: '', course: '', year: 1, semester: 1 });
      setUploadFile(null);
      setIsUploadDialogOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Timetable Uploaded",
        description: `${timetable.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading timetable:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddEntry = () => {
    if (!selectedTimetable || !newEntry.unitCode || !newEntry.day || !newEntry.time || !newEntry.venue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const unit = units.find(u => u.code === newEntry.unitCode);
    if (!unit) {
      toast({
        title: "Unit Not Found",
        description: "The selected unit could not be found.",
        variant: "destructive",
      });
      return;
    }

    const entry: TimetableEntry = {
      id: Date.now().toString(),
      unitCode: unit.code,
      unitName: unit.name,
      lecturer: unit.lecturerName || 'TBA',
      day: newEntry.day,
      time: newEntry.time,
      venue: newEntry.venue,
      duration: newEntry.duration,
      course: selectedTimetable.course,
      year: selectedTimetable.year,
      semester: selectedTimetable.semester
    };

    const updatedTimetable = {
      ...selectedTimetable,
      entries: [...selectedTimetable.entries, entry]
    };

    setTimetables(prev => prev.map(t => t.id === selectedTimetable.id ? updatedTimetable : t));
    setSelectedTimetable(updatedTimetable);
    setNewEntry({ unitCode: '', day: '', time: '', venue: '', duration: '2' });

    toast({
      title: "Entry Added",
      description: "Timetable entry has been added successfully.",
    });
  };

  const handleRemoveEntry = (entryId: string) => {
    if (!selectedTimetable) return;

    const updatedTimetable = {
      ...selectedTimetable,
      entries: selectedTimetable.entries.filter(e => e.id !== entryId)
    };

    setTimetables(prev => prev.map(t => t.id === selectedTimetable.id ? updatedTimetable : t));
    setSelectedTimetable(updatedTimetable);

    toast({
      title: "Entry Removed",
      description: "Timetable entry has been removed.",
    });
  };

  const handleDownloadPDF = () => {
    if (!selectedTimetable) return;

    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text(selectedTimetable.name, 20, 20);
    
    // Course info
    pdf.setFontSize(12);
    pdf.text(`Course: ${selectedTimetable.course} - Year ${selectedTimetable.year}, Semester ${selectedTimetable.semester}`, 20, 35);
    
    if (selectedTimetable.description) {
      pdf.text(`Description: ${selectedTimetable.description}`, 20, 45);
    }

    // Timetable
    const tableData = selectedTimetable.entries.map(entry => [
      entry.day,
      entry.time,
      entry.unitCode,
      entry.unitName,
      entry.lecturer,
      entry.venue,
      `${entry.duration}hrs`
    ]);

    (pdf as any).autoTable({
      head: [['Day', 'Time', 'Unit Code', 'Unit Name', 'Lecturer', 'Venue', 'Duration']],
      body: tableData,
      startY: 55,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    pdf.save(`${selectedTimetable.name.replace(/\s+/g, '_')}_timetable.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "Timetable has been downloaded as PDF.",
    });
  };

  const handleSendToStudentsAndLecturers = async () => {
    if (!selectedTimetable) return;

    try {
      // Get ALL students and lecturers (department-wide distribution)
      const allStudents = students; // All approved students in the department
      const allLecturers = lecturers; // All lecturers in the department

      // Send notifications to ALL students
      const studentPromises = allStudents.map(student => 
        createNotification({
          userId: student.id,
          title: 'New Timetable Available',
          message: `A new timetable "${selectedTimetable.name}" has been published for the entire department. Please check if it applies to your course.`,
          type: 'announcement',
          actionUrl: selectedTimetable.fileUrl || '/student-dashboard?tab=timetable',
          data: { 
            timetableId: selectedTimetable.id,
            fileName: selectedTimetable.fileName,
            downloadUrl: selectedTimetable.fileUrl
          }
        })
      );

      // Send notifications to ALL lecturers
      const lecturerPromises = allLecturers.map(lecturer => 
        createNotification({
          userId: lecturer.id,
          title: 'New Timetable Published',
          message: `A new department timetable "${selectedTimetable.name}" has been published. Please review for your teaching schedule.`,
          type: 'info',
          actionUrl: selectedTimetable.fileUrl || '/lecturer-dashboard?tab=timetable',
          data: { 
            timetableId: selectedTimetable.id,
            fileName: selectedTimetable.fileName,
            downloadUrl: selectedTimetable.fileUrl
          }
        })
      );

      await Promise.all([...studentPromises, ...lecturerPromises]);

      toast({
        title: "Notifications Sent",
        description: `Timetable notifications sent to ${allStudents.length} students and ${allLecturers.length} lecturers across the entire department.`,
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <p className="text-gray-600">Create and manage course timetables</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Timetable Document</DialogTitle>
                <DialogDescription>
                  Upload a timetable document (PDF, Word, Excel, or Image)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-name">Timetable Name</Label>
                  <Input
                    id="upload-name"
                    value={newTimetable.name}
                    onChange={(e) => setNewTimetable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science Y1 S1 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-description">Description (Optional)</Label>
                  <Textarea
                    id="upload-description"
                    value={newTimetable.description}
                    onChange={(e) => setNewTimetable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the timetable"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upload-course">Course</Label>
                    <Input
                      id="upload-course"
                      value={newTimetable.course}
                      onChange={(e) => setNewTimetable(prev => ({ ...prev, course: e.target.value }))}
                      placeholder="Course name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={newTimetable.year.toString()} onValueChange={(value) => setNewTimetable(prev => ({ ...prev, year: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={newTimetable.semester.toString()} onValueChange={(value) => setNewTimetable(prev => ({ ...prev, semester: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-file">Timetable File</Label>
                  <Input
                    ref={fileInputRef}
                    id="upload-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  {uploadFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{uploadFile.name}</span>
                      <span>({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadTimetable} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Timetable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Timetable</DialogTitle>
                <DialogDescription>
                  Create a new timetable for a specific course and year.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Timetable Name</Label>
                  <Input
                    id="name"
                    value={newTimetable.name}
                    onChange={(e) => setNewTimetable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science Y1 S1 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newTimetable.description}
                    onChange={(e) => setNewTimetable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the timetable"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={newTimetable.course}
                      onChange={(e) => setNewTimetable(prev => ({ ...prev, course: e.target.value }))}
                      placeholder="Course name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={newTimetable.year.toString()} onValueChange={(value) => setNewTimetable(prev => ({ ...prev, year: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={newTimetable.semester.toString()} onValueChange={(value) => setNewTimetable(prev => ({ ...prev, semester: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTimetable}>
                  Create Timetable
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetables List */}
        <Card>
          <CardHeader>
            <CardTitle>Timetables</CardTitle>
            <CardDescription>Select a timetable to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {timetables.map(timetable => (
              <Button
                key={timetable.id}
                variant={selectedTimetable?.id === timetable.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedTimetable(timetable)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{timetable.name}</div>
                  <div className="text-xs text-gray-500">
                    {timetable.course} Y{timetable.year} S{timetable.semester} - {timetable.entries.length} entries
                    {timetable.fileUrl && <span className="ml-1">📎</span>}
                  </div>
                </div>
              </Button>
            ))}
            {timetables.length === 0 && (
              <p className="text-gray-500 text-center py-4">No timetables created yet</p>
            )}
          </CardContent>
        </Card>

        {/* Timetable Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedTimetable ? selectedTimetable.name : "Select a Timetable"}
                </CardTitle>
                <CardDescription>
                  {selectedTimetable 
                    ? `${selectedTimetable.course} - Year ${selectedTimetable.year}, Semester ${selectedTimetable.semester}`
                    : "Choose a timetable to view and edit"
                  }
                </CardDescription>
              </div>
              {selectedTimetable && (
                <div className="flex gap-2">
                  {selectedTimetable.fileUrl ? (
                    <Button variant="outline" onClick={() => window.open(selectedTimetable.fileUrl, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleDownloadPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                  <Button onClick={handleSendToStudentsAndLecturers}>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Department
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTimetable ? (
              <div className="space-y-6">
                {!selectedTimetable.fileUrl && (
                  <>
                    {/* Add Entry Form */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-medium">Add Timetable Entry</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select value={newEntry.unitCode} onValueChange={(value) => setNewEntry(prev => ({ ...prev, unitCode: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.filter(u => u.course === selectedTimetable.course && u.year === selectedTimetable.year).map(unit => (
                                <SelectItem key={unit.id} value={unit.code}>
                                  {unit.code} - {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Day</Label>
                          <Select value={newEntry.day} onValueChange={(value) => setNewEntry(prev => ({ ...prev, day: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {days.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Select value={newEntry.time} onValueChange={(value) => setNewEntry(prev => ({ ...prev, time: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Venue</Label>
                          <Input
                            value={newEntry.venue}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, venue: e.target.value }))}
                            placeholder="Room/Hall"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (hrs)</Label>
                          <Select value={newEntry.duration} onValueChange={(value) => setNewEntry(prev => ({ ...prev, duration: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="2">2 hours</SelectItem>
                              <SelectItem value="3">3 hours</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleAddEntry} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>
                  </>
                )}

                {/* Timetable Entries */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {selectedTimetable.fileUrl ? 'Uploaded Document' : `Timetable Entries (${selectedTimetable.entries.length})`}
                  </h3>
                  {selectedTimetable.fileUrl ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedTimetable.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {selectedTimetable.fileSize && `${(selectedTimetable.fileSize / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => window.open(selectedTimetable.fileUrl, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ) : selectedTimetable.entries.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTimetable.entries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="grid grid-cols-6 gap-4 flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{entry.day}</span>
                            </div>
                            <div className="text-sm">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {entry.time}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{entry.unitCode}</span>
                            </div>
                            <div className="text-sm">{entry.unitName}</div>
                            <div className="text-sm">{entry.lecturer}</div>
                            <div className="text-sm">{entry.venue}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No entries added yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a timetable to view and edit entries</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
