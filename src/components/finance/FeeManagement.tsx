
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const FeeManagement = () => {
  const { toast } = useToast();
  const { addStudentFee, getAllUsers } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<string>("");

  const [newFee, setNewFee] = useState({
    studentId: "",
    feeType: "supplementary_exam" as const,
    amount: 0,
    unitCode: "",
    unitName: "",
    description: "",
    dueDate: "",
    academicYear: "2024/2025",
    semester: 1
  });

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const feeAmounts = {
    supplementary_exam: 2000,
    special_exam: 1500,
    unit_retake: 5000
  };

  const handleCreateFee = () => {
    if (!newFee.studentId || !newFee.feeType || !newFee.amount || !newFee.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === newFee.studentId);
    if (!student) {
      toast({
        title: "Student Not Found",
        description: "Please select a valid student.",
        variant: "destructive",
      });
      return;
    }

    addStudentFee({
      ...newFee,
      studentName: `${student.firstName} ${student.lastName}`
    });

    setNewFee({
      studentId: "",
      feeType: "supplementary_exam",
      amount: 0,
      unitCode: "",
      unitName: "",
      description: "",
      dueDate: "",
      academicYear: "2024/2025",
      semester: 1
    });
    setIsDialogOpen(false);

    toast({
      title: "Fee Added",
      description: `${newFee.feeType.replace('_', ' ')} fee has been added for ${student.firstName} ${student.lastName}.`,
    });
  };

  const handleFeeTypeChange = (feeType: string) => {
    setSelectedFeeType(feeType);
    setNewFee(prev => ({
      ...prev,
      feeType: feeType as any,
      amount: feeAmounts[feeType as keyof typeof feeAmounts] || 0,
      description: `${feeType.replace('_', ' ')} fee`
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-gray-600">Add fees for supplementary exams, special exams, and unit retakes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Student Fee</DialogTitle>
              <DialogDescription>
                Add a fee for supplementary exam, special exam, or unit retake
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={newFee.studentId} onValueChange={(value) => setNewFee(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fee-type">Fee Type</Label>
                  <Select value={selectedFeeType} onValueChange={handleFeeTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplementary_exam">Supplementary Exam</SelectItem>
                      <SelectItem value="special_exam">Special Exam</SelectItem>
                      <SelectItem value="unit_retake">Unit Retake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (KSh)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newFee.amount}
                    onChange={(e) => setNewFee(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Select value={newFee.academicYear} onValueChange={(value) => setNewFee(prev => ({ ...prev, academicYear: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={newFee.semester.toString()} onValueChange={(value) => setNewFee(prev => ({ ...prev, semester: parseInt(value) }))}>
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

              {(selectedFeeType === "supplementary_exam" || selectedFeeType === "special_exam" || selectedFeeType === "unit_retake") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit-code">Unit Code</Label>
                    <Input
                      id="unit-code"
                      value={newFee.unitCode}
                      onChange={(e) => setNewFee(prev => ({ ...prev, unitCode: e.target.value }))}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit-name">Unit Name</Label>
                    <Input
                      id="unit-name"
                      value={newFee.unitName}
                      onChange={(e) => setNewFee(prev => ({ ...prev, unitName: e.target.value }))}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newFee.dueDate}
                  onChange={(e) => setNewFee(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFee.description}
                  onChange={(e) => setNewFee(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Fee description..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFee}>
                  Add Fee
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fee Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Supplementary Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KSh 2,000</div>
            <p className="text-sm text-gray-600">For students who missed main exams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Special Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">KSh 1,500</div>
            <p className="text-sm text-gray-600">For special circumstances</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Unit Retake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KSh 5,000</div>
            <p className="text-sm text-gray-600">For repeating a unit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
