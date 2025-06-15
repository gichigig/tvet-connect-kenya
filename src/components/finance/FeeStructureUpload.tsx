
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const FeeStructureUpload = () => {
  const { toast } = useToast();
  const { addFeeStructure } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Format",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file processing
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data from uploaded file
      const mockStructures = [
        {
          course: "Computer Science",
          year: 1,
          semester: 1,
          academicYear: "2024/2025",
          tuitionFee: 75000,
          examFee: 5000,
          libraryFee: 2000,
          labFee: 8000,
          cautionMoney: 10000,
          activityFee: 3000,
          medicalFee: 2500,
          totalFee: 105500,
          isActive: true,
          createdBy: "finance-upload"
        },
        {
          course: "Information Technology",
          year: 1,
          semester: 1,
          academicYear: "2024/2025",
          tuitionFee: 70000,
          examFee: 5000,
          libraryFee: 2000,
          labFee: 7000,
          cautionMoney: 10000,
          activityFee: 3000,
          medicalFee: 2500,
          totalFee: 99500,
          isActive: true,
          createdBy: "finance-upload"
        }
      ];

      // Add structures to system
      mockStructures.forEach(structure => {
        addFeeStructure(structure);
      });

      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `${mockStructures.length} fee structures imported successfully.`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Course,Year,Semester,Academic Year,Tuition Fee,Exam Fee,Library Fee,Lab Fee,Caution Money,Activity Fee,Medical Fee\nComputer Science,1,1,2024/2025,75000,5000,2000,8000,10000,3000,2500\nInformation Technology,1,1,2024/2025,70000,5000,2000,7000,10000,3000,2500";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fee_structure_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Fee Structures
        </CardTitle>
        <CardDescription>
          Import multiple fee structures from CSV or Excel files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="fee-upload">Select File</Label>
            <Input
              id="fee-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="mt-1"
            />
          </div>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="mt-6"
          >
            <File className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)</p>
          <p><strong>Required columns:</strong> Course, Year, Semester, Academic Year, Tuition Fee, etc.</p>
        </div>
      </CardContent>
    </Card>
  );
};
