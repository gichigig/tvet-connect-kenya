
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AttendanceQuiz {
  id: string;
  title: string;
  unitCode: string;
  unitName: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  responses: number;
  createdDate: string;
}

export interface QuizFormData {
  title: string;
  unitCode: string;
  timeLimit: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}
