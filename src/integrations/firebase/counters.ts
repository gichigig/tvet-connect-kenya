import { db } from './config';
import { doc, runTransaction } from 'firebase/firestore';

const COUNTERS_COLLECTION = 'counters';

export async function getNextAdmissionNumber(department: string): Promise<string> {
  // Validate that department is provided
  if (!department || typeof department !== 'string') {
    throw new Error('Department is required and must be a string');
  }

  const counterRef = doc(db, COUNTERS_COLLECTION, `admission_${department}`);
  
  const newNumber = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    if (!counterDoc.exists()) {
      // Initialize the counter if it doesn't exist
      // The first student will get number 100
      transaction.set(counterRef, { nextNumber: 101 });
      return 100; 
    }
    
    const currentNumber = counterDoc.data().nextNumber;
    transaction.update(counterRef, { nextNumber: currentNumber + 1 });
    
    return currentNumber;
  });

  const year = new Date().getFullYear();
  const departmentCode = department.substring(0, 3).toUpperCase();
  
  // Format: DPT/0100/2025
  return `${departmentCode}/${String(newNumber).padStart(4, '0')}/${year}`;
}
