
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface ExamCardDownloadButtonProps {
  user: any;
  enrolledUnits: Array<any>;
  myFees: Array<any>;
  totalOwed: number;
}

export const ExamCardDownloadButton = ({
  user,
  enrolledUnits,
  myFees,
  totalOwed,
}: ExamCardDownloadButtonProps) => {
  const feesAreCleared =
    myFees.length > 0 &&
    myFees.every(f => f.status === "paid") &&
    totalOwed === 0;

  const handleDownloadExamCard = () => {
    if (!user) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${now.getFullYear().toString().substr(-2)}${pad(
      now.getMonth() + 1
    )}${pad(now.getDate())}`;
    const serial = `EXM-${user.admissionNumber || "UNKNOWN"}-${datePart}-${now
      .getTime()
      .toString()
      .slice(-5)}`;

    const enrolledUnitList = enrolledUnits
      .map(
        (reg: any, idx: number) =>
          `${idx + 1}. ${reg.unitCode || "-"} - ${reg.unitName || "-"}`
      )
      .join("\n");

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("EXAMINATION CARD", 20, 30);

    doc.setFontSize(12);
    doc.text(`Serial No: ${serial}`, 150, 20);
    doc.setFontSize(14);

    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 45);
    doc.text(`Admission Number: ${user.admissionNumber || "-"}`, 20, 55);
    doc.text(`Year of Study: ${user.year != null ? user.year : "-"}`, 20, 65);
    doc.text(`Course: ${user.course || "-"}`, 20, 75);

    doc.text("Units Registered:", 20, 85);
    doc.setFontSize(12);
    doc.text(enrolledUnitList || "No units found.", 25, 93);

    doc.setFontSize(14);
    doc.text("Status: CLEARED", 20, 120);

    doc.setFontSize(11);
    doc.text(
      "This card allows you to sit for all listed examinations for this semester. Carry this card for every exam.",
      20,
      130,
      { maxWidth: 170 }
    );
    doc.save(`ExamCard_${user.firstName}_${user.lastName}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDownloadExamCard}
        variant="default"
        className="flex items-center"
        disabled={!feesAreCleared}
      >
        <Download className="w-4 h-4 mr-2" />
        Download Exam Card
      </Button>
      {!feesAreCleared && (
        <span className="text-xs text-red-600 ml-2">
          You must clear all your fees to download your exam card.
        </span>
      )}
    </div>
  );
};
