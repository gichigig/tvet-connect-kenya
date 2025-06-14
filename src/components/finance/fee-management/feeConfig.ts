
export const feeAmounts = {
  supplementary_exam: 2000,
  special_exam: 1500,
  unit_retake: 5000
} as const;

export const feeTypeOptions = [
  { value: "supplementary_exam", label: "Supplementary Exam" },
  { value: "special_exam", label: "Special Exam" },
  { value: "unit_retake", label: "Unit Retake" }
] as const;

export const academicYearOptions = [
  { value: "2024/2025", label: "2024/2025" },
  { value: "2023/2024", label: "2023/2024" }
] as const;

export const semesterOptions = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" }
] as const;
