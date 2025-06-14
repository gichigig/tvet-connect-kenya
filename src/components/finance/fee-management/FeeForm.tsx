
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { feeAmounts, feeTypeOptions, academicYearOptions, semesterOptions } from "./feeConfig";

interface FeeFormProps {
  onClose: () => void;
}

export const FeeForm = ({ onClose }: FeeFormProps) => {
  const { toast } = useToast();
  const { addStudentFee, getAllUsers } = useAuth();
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
    onClose();

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
              {feeTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
              {academicYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
              {semesterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateFee}>
          Add Fee
        </Button>
      </div>
    </div>
  );
};
