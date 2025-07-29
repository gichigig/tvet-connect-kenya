import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

export interface Exam {
  id: string;
  title: string;
  type: 'supplementary' | 'special';
  unitCode: string;
  unitName: string;
  date: string;
  time: string;
  duration: number;
  venue: string;
  students: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
}

const EXAMS_COLLECTION = 'exams';

export const addExamToFirebase = async (exam: Omit<Exam, 'id'>) => {
  const db = getFirestore();
  const docRef = await addDoc(collection(db, EXAMS_COLLECTION), exam);
  return docRef.id;
};

export const fetchExamsFromFirebase = async (): Promise<Exam[]> => {
  const db = getFirestore();
  const querySnapshot = await getDocs(collection(db, EXAMS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exam[];
};

export const updateExamInFirebase = async (examId: string, updates: Partial<Exam>) => {
  const db = getFirestore();
  const examRef = doc(db, EXAMS_COLLECTION, examId);
  await updateDoc(examRef, updates);
};

export const deleteExamFromFirebase = async (examId: string) => {
  const db = getFirestore();
  const examRef = doc(db, EXAMS_COLLECTION, examId);
  await deleteDoc(examRef);
};

export const subscribeToExams = (callback: (exams: Exam[]) => void) => {
  const db = getFirestore();
  return onSnapshot(collection(db, EXAMS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
    const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exam[];
    callback(exams);
  });
};
