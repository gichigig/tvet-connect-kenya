
import { ExamResult, User } from './types';

export const sendResultsNotification = async (
  resultIds: string[], 
  sendToGuardians: boolean, 
  examResults: ExamResult[], 
  users: User[]
): Promise<void> => {
  try {
    const selectedResults = examResults.filter(result => resultIds.includes(result.id));
    
    for (const result of selectedResults) {
      const student = users.find(u => u.id === result.studentId);
      if (!student) continue;

      // Send to student
      console.log(`Sending result notification to student: ${student.email}`);
      console.log(`SMS to: ${student.phone}`);
      console.log(`Result: ${result.unitName} - ${result.grade} (${result.status})`);

      // Send to guardians if requested
      if (sendToGuardians && student.guardians) {
        for (const guardian of student.guardians) {
          console.log(`Sending result notification to guardian: ${guardian.email}`);
          console.log(`SMS to guardian: ${guardian.phone}`);
          console.log(`Student: ${student.firstName} ${student.lastName} - ${result.unitName} - ${result.grade} (${result.status})`);
        }
      }
    }

    return Promise.resolve();
  } catch (error) {
    console.error("Failed to send notifications:", error);
    throw error;
  }
};
