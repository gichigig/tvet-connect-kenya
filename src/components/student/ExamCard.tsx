import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';

interface ExamCardProps {
  studentName: string;
  registrationNumber: string;
  course: string;
  year: number;
  semester: number;
  academicYear: string;
  passportPhotoUrl?: string;
  units: { code: string; name: string }[];
  hasOutstandingFees?: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({
  studentName,
  registrationNumber,
  course,
  year,
  semester,
  academicYear,
  passportPhotoUrl,
  units,
  hasOutstandingFees = false,
}) => {
  const { user } = useAuth();
  const examCardRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (examCardRef.current) {
      html2canvas(examCardRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ExamCard-${registrationNumber}.pdf`);
      });
    }
  };

  return (
    <div>
      <Card ref={examCardRef} className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <img src="/placeholder.svg" alt="Institution Logo" className="w-24 h-24 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">TVET Connect Kenya Institution</CardTitle>
          <p className="text-lg">Examination Card</p>
          <p className="text-sm">{academicYear} - Semester {semester}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={passportPhotoUrl} alt={studentName} />
              <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p><strong>Student Name:</strong> {studentName}</p>
              <p><strong>Registration No:</strong> {registrationNumber}</p>
              <p><strong>Course:</strong> {course}</p>
              <p><strong>Year of Study:</strong> {year}</p>
            </div>
          </div>

          <h3 className="font-bold mb-2">Registered Units for Examination:</h3>
          <ul className="list-disc pl-5">
            {units.map(unit => (
              <li key={unit.code}>{unit.code} - {unit.name}</li>
            ))}
          </ul>

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Instructions to Candidates:</strong></p>
            <ol className="list-decimal pl-5">
              <li>You must present this card to the invigilator in the examination room.</li>
              <li>You are not allowed to carry any unauthorized materials into the examination room.</li>
              <li>Ensure you arrive at the examination venue at least 15 minutes before the start of the exam.</li>
            </ol>
          </div>
          <div className="mt-6 border-t pt-4">
             <p><strong>Finance Officer's Signature:</strong> ......................................</p>
             <p className="mt-2"><strong>Date:</strong> ......................................</p>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-4">
        <Button 
          onClick={handleDownload} 
          disabled={hasOutstandingFees}
          className={hasOutstandingFees ? "opacity-50 cursor-not-allowed" : ""}
        >
          {hasOutstandingFees ? "Clear Fees to Download" : "Download Exam Card (PDF)"}
        </Button>
        {hasOutstandingFees && (
          <p className="text-sm text-red-600 mt-2">
            You must clear all outstanding fees before downloading your exam card.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
