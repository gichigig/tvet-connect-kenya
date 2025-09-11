import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

interface ExamCardActivation {
  isActive: boolean;
  activatedBy: string;
  activatedAt: Date;
  examPeriod: string;
  instructions: string;
}

interface SemesterReport {
  studentId: string;
  course: string;
  year: number;
  semester: string;
  reportedAt: Date;
  status: 'active' | 'completed';
}

export const EnhancedExamCard = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const [examCardActivation, setExamCardActivation] = useState<ExamCardActivation | null>(null);
  const [semesterReport, setSemesterReport] = useState<SemesterReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  useEffect(() => {
    checkExamCardActivation();
    if (user?.id) {
      checkSemesterReport();
    }
  }, [user?.id]);

  const checkExamCardActivation = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_card_activation')
        .select('*')
        .eq('id', 'current')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking exam card activation:', error);
        return;
      }

      if (data) {
        setExamCardActivation(data as ExamCardActivation);
      }
    } catch (error) {
      console.error('Error checking exam card activation:', error);
    }
  };

  const checkSemesterReport = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('semester_reports')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking semester report:', error);
        return;
      }

      if (data) {
        setSemesterReport(data as SemesterReport);
      }
    } catch (error) {
      console.error('Error checking semester report:', error);
    }
  };

  const generateExamCard = async () => {
    if (!user || !semesterReport || approvedRegistrations.length === 0) return;

    setLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('TVET COLLEGE EXAMINATION CARD', 105, 25, { align: 'center' });
      
      // Generate serial number
      const now = new Date();
      const serialNumber = `EXM-${user.admissionNumber || 'UNKNOWN'}-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getTime().toString().slice(-5)}`;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Serial Number: ${serialNumber}`, 200, 15, { align: 'right' });
      doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 200, 20, { align: 'right' });
      
      // Student Information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('STUDENT INFORMATION', 20, 45);
      
      doc.setFont(undefined, 'normal');
      const studentInfo = [
        [`Name:`, `${user.firstName} ${user.lastName}`],
        [`Admission Number:`, `${user.admissionNumber || 'N/A'}`],
        [`Course:`, `${semesterReport.course}`],
        [`Year of Study:`, `Year ${semesterReport.year}`],
        [`Semester:`, `Semester ${semesterReport.semester}`],
        [`Academic Year:`, `${new Date().getFullYear()}`]
      ];

      let yPos = 55;
      studentInfo.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(value, 80, yPos);
        yPos += 8;
      });

      // Units Table
      doc.setFont(undefined, 'bold');
      doc.text('REGISTERED UNITS', 20, yPos + 10);
      
      const tableData = approvedRegistrations.map((reg, index) => [
        (index + 1).toString(),
        reg.unitCode,
        reg.unitName,
        '_____________', // Space for date
        '_____________'  // Space for signature
      ]);

      const tableHeaders = ['#', 'Unit Code', 'Unit Name', 'Exam Date', 'Invigilator Signature'];

      (doc as any).autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: yPos + 20,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          halign: 'left'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 70 },
          3: { cellWidth: 35 },
          4: { cellWidth: 45 }
        }
      });

      // Status and Instructions
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 128, 0);
      doc.text('STATUS: CLEARED FOR EXAMINATIONS', 20, finalY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      const instructions = [
        'Ã¢â‚¬Â¢ This examination card is valid only for the units listed above.',
        'Ã¢â‚¬Â¢ You must present this card for every examination.',
        'Ã¢â‚¬Â¢ Report any discrepancies to the registrar immediately.',
        'Ã¢â‚¬Â¢ Keep this card safe and bring it to all examinations.',
        'Ã¢â‚¬Â¢ Late arrivals may not be admitted to the examination room.',
        `Ã¢â‚¬Â¢ Valid for ${examCardActivation?.examPeriod || 'Current Semester'} examinations only.`
      ];

      let instructionY = finalY + 15;
      doc.text('EXAMINATION INSTRUCTIONS:', 20, instructionY);
      instructionY += 8;
      
      instructions.forEach(instruction => {
        doc.text(instruction, 25, instructionY);
        instructionY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated document. No signature required.', 105, 280, { align: 'center' });
      doc.text(`Generated by TVET Connect System - ${window.location.hostname}`, 105, 285, { align: 'center' });

      // Save the PDF
      doc.save(`ExamCard_${user.firstName}_${user.lastName}_${semesterReport.semester}_${new Date().getFullYear()}.pdf`);
      
    } catch (error) {
      console.error('Error generating exam card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if exam card is not activated by finance
  if (!examCardActivation?.isActive) {
    return null;
  }

  // Don't show if student hasn't reported semester
  if (!semesterReport) {
    return null;
  }

  // Don't show if no units are approved
  if (approvedRegistrations.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <FileText className="w-5 h-5" />
            Exam Card Available
          </CardTitle>
          <CardDescription className="text-amber-700">
            Exam cards are activated, but you need approved unit registrations to download your card.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Exam Card Available
        </CardTitle>
        <CardDescription className="text-green-700">
          Your exam card is ready for download. You have {approvedRegistrations.length} approved units.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Exam Period:</span>
              <div>{examCardActivation.examPeriod}</div>
            </div>
            <div>
              <span className="font-medium">Activated By:</span>
              <div>{examCardActivation.activatedBy}</div>
            </div>
            <div>
              <span className="font-medium">Semester:</span>
              <div>{semesterReport.course} - Year {semesterReport.year} - Semester {semesterReport.semester}</div>
            </div>
            <div>
              <span className="font-medium">Units Registered:</span>
              <div>{approvedRegistrations.length} units</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Registered Units:</div>
            <div className="flex flex-wrap gap-2">
              {approvedRegistrations.slice(0, 4).map((reg) => (
                <Badge key={reg.id} variant="secondary" className="text-xs">
                  {reg.unitCode}
                </Badge>
              ))}
              {approvedRegistrations.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{approvedRegistrations.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={generateExamCard}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Exam Card (PDF)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
