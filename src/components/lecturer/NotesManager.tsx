import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Share2, Download } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";

interface Note {
  id: string;
  title: string;
  content: string;
  unit: string;
  topic: string;
  createdDate: string;
  downloads: number;
  fileType: 'pdf' | 'doc' | 'ppt';
}

export const NotesManager = () => {
  const { user } = useAuth();
  const { getLecturerUnits } = useUnits();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Introduction to Programming',
      content: 'Basic programming concepts including variables, data types, and control structures',
      unit: 'CP101',
      topic: 'Programming Fundamentals',
      createdDate: '2025-09-01',
      downloads: 25,
      fileType: 'pdf'
    },
    {
      id: '2',
      title: 'Database Design Principles',
      content: 'Entity-Relationship modeling and normalization techniques',
      unit: 'CP201',
      topic: 'Database Design',
      createdDate: '2025-09-05',
      downloads: 18,
      fileType: 'ppt'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    unit: '',
    topic: '',
    fileType: 'pdf' as 'pdf' | 'doc' | 'ppt'
  });

  const lecturerUnits = getLecturerUnits(user?.id || '');

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.unit) return;

    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      createdDate: new Date().toISOString().split('T')[0],
      downloads: 0
    };

    setNotes([...notes, note]);
    setNewNote({
      title: '',
      content: '',
      unit: '',
      topic: '',
      fileType: 'pdf'
    });
    setShowCreateForm(false);
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'doc': return 'bg-blue-100 text-blue-800';
      case 'ppt': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes Manager</h2>
          <p className="text-gray-600">Create and manage lecture notes for your units</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Note
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
            <CardDescription>Add lecture notes for your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select
                  value={newNote.unit}
                  onValueChange={(value) => setNewNote({ ...newNote, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.code}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Input
                  value={newNote.topic}
                  onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                  placeholder="Topic or chapter"
                />
              </div>
              <div>
                <label className="text-sm font-medium">File Type</label>
                <Select
                  value={newNote.fileType}
                  onValueChange={(value) => setNewNote({ ...newNote, fileType: value as 'pdf' | 'doc' | 'ppt' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">Word Document</SelectItem>
                    <SelectItem value="ppt">PowerPoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Note content and summary"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateNote}>Create Note</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {note.title}
                  </CardTitle>
                  <CardDescription>{note.content}</CardDescription>
                </div>
                <Badge className={getFileTypeColor(note.fileType)}>
                  {note.fileType.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <Badge variant="outline">{note.unit}</Badge>
                  <span>Topic: {note.topic}</span>
                  <span>Created: {new Date(note.createdDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {note.downloads} downloads
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
