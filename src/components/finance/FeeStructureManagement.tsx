
import { useState } from "react";
import { allCourses } from "@/data/zetechCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const FeeStructureManagement = () => {
  const { toast } = useToast();
  const { feeStructures, addFeeStructure, updateFeeStructure, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<string | null>(null);

  const [newStructure, setNewStructure] = useState({
    course: "",
    year: 1,
    semester: 1,
    academicYear: "2024/2025",
    tuitionFee: 0,
    examFee: 0,
    libraryFee: 0,
    labFee: 0,
    cautionMoney: 0,
    activityFee: 0,
    medicalFee: 0,
    isActive: true
  });

  const courses = allCourses;

  const handleCreateStructure = () => {
    if (!newStructure.course || newStructure.tuitionFee <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const totalFee = newStructure.tuitionFee + newStructure.examFee + newStructure.libraryFee + 
                    newStructure.labFee + newStructure.cautionMoney + newStructure.activityFee + 
                    newStructure.medicalFee;

    if (editingStructure) {
      updateFeeStructure(editingStructure, {
        ...newStructure,
        totalFee,
        createdBy: user?.id || ""
      });
      toast({
        title: "Fee Structure Updated",
        description: "The fee structure has been updated successfully.",
      });
    } else {
      addFeeStructure({
        ...newStructure,
        totalFee,
        createdBy: user?.id || ""
      });
      toast({
        title: "Fee Structure Created",
        description: "New fee structure has been created successfully.",
      });
    }

    setNewStructure({
      course: "",
      year: 1,
      semester: 1,
      academicYear: "2024/2025",
      tuitionFee: 0,
      examFee: 0,
      libraryFee: 0,
      labFee: 0,
      cautionMoney: 0,
      activityFee: 0,
      medicalFee: 0,
      isActive: true
    });
    setEditingStructure(null);
    setIsDialogOpen(false);
  };

  const handleEditStructure = (structure: any) => {
    setNewStructure(structure);
    setEditingStructure(structure.id);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (structureId: string, currentStatus: boolean) => {
    updateFeeStructure(structureId, { isActive: !currentStatus });
    toast({
      title: "Status Updated",
      description: `Fee structure ${!currentStatus ? 'activated' : 'deactivated'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Structure Management</h2>
          <p className="text-gray-600">Configure tuition and other fees for different courses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingStructure ? 'Edit' : 'Create'} Fee Structure</DialogTitle>
              <DialogDescription>
                Set up fees for a specific course, year, and semester
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={newStructure.course} onValueChange={(value) => setNewStructure(prev => ({ ...prev, course: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={newStructure.year.toString()} onValueChange={(value) => setNewStructure(prev => ({ ...prev, year: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={newStructure.semester.toString()} onValueChange={(value) => setNewStructure(prev => ({ ...prev, semester: parseInt(value) }))}>
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
                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Select value={newStructure.academicYear} onValueChange={(value) => setNewStructure(prev => ({ ...prev, academicYear: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tuition">Tuition Fee (KSh)</Label>
                  <Input
                    id="tuition"
                    type="number"
                    value={newStructure.tuitionFee}
                    onChange={(e) => setNewStructure(prev => ({ ...prev, tuitionFee: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exam">Exam Fee (KSh)</Label>
                    <Input
                      id="exam"
                      type="number"
                      value={newStructure.examFee}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, examFee: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="library">Library Fee (KSh)</Label>
                    <Input
                      id="library"
                      type="number"
                      value={newStructure.libraryFee}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, libraryFee: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lab">Lab Fee (KSh)</Label>
                    <Input
                      id="lab"
                      type="number"
                      value={newStructure.labFee}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, labFee: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="caution">Caution Money (KSh)</Label>
                    <Input
                      id="caution"
                      type="number"
                      value={newStructure.cautionMoney}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, cautionMoney: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activity">Activity Fee (KSh)</Label>
                    <Input
                      id="activity"
                      type="number"
                      value={newStructure.activityFee}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, activityFee: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medical">Medical Fee (KSh)</Label>
                    <Input
                      id="medical"
                      type="number"
                      value={newStructure.medicalFee}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, medicalFee: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total Fee: KSh {(newStructure.tuitionFee + newStructure.examFee + newStructure.libraryFee + 
                newStructure.labFee + newStructure.cautionMoney + newStructure.activityFee + 
                newStructure.medicalFee).toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStructure}>
                  {editingStructure ? 'Update' : 'Create'} Structure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            Manage fee structures for different courses and academic years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Year/Semester</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Tuition Fee</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructures.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell className="font-medium">{structure.course}</TableCell>
                  <TableCell>Year {structure.year}, Sem {structure.semester}</TableCell>
                  <TableCell>{structure.academicYear}</TableCell>
                  <TableCell>KSh {structure.tuitionFee.toLocaleString()}</TableCell>
                  <TableCell>KSh {structure.totalFee.toLocaleString()}</TableCell>
                  <TableCell>
                    {structure.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStructure(structure)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={structure.isActive ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(structure.id, structure.isActive)}
                      >
                        {structure.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {feeStructures.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No fee structures found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
