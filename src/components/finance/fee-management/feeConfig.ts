// Fee configuration types and defaults

export interface FeeStructure {
  id: string;
  courseId: string;
  feeType: string;
  amount: number;
  dueDate: string;
}

export const defaultFeeTypes = [
  'Tuition',
  'Library',
  'Laboratory',
  'Registration',
  'Examination'
];

export const feeAmounts: Record<string, number> = {
  'Tuition': 50000,
  'Library': 5000,
  'Laboratory': 10000,
  'Registration': 3000,
  'Examination': 7000
};

export const feeTypeOptions = defaultFeeTypes;

export const academicYearOptions = [
  '2023/2024',
  '2024/2025',
  '2025/2026'
];

export const semesterOptions = [
  'Semester 1',
  'Semester 2',
  'Semester 3'
];

export const calculateTotalFees = (fees: FeeStructure[]): number => {
  return fees.reduce((total, fee) => total + fee.amount, 0);
};