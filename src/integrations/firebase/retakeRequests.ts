import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

export interface RetakeRequest {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  previousGrade: string;
  requestDate: string;
  reason: string;
  academicYear: string;
  semester: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

const RETAKE_REQUESTS_COLLECTION = 'retakeRequests';

export const addRetakeRequestToFirebase = async (request: Omit<RetakeRequest, 'id'>) => {
  const db = getFirestore();
  const docRef = await addDoc(collection(db, RETAKE_REQUESTS_COLLECTION), request);
  return docRef.id;
};

export const fetchRetakeRequestsFromFirebase = async (): Promise<RetakeRequest[]> => {
  const db = getFirestore();
  const querySnapshot = await getDocs(collection(db, RETAKE_REQUESTS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RetakeRequest[];
};

export const updateRetakeRequestInFirebase = async (requestId: string, updates: Partial<RetakeRequest>) => {
  const db = getFirestore();
  const requestRef = doc(db, RETAKE_REQUESTS_COLLECTION, requestId);
  await updateDoc(requestRef, updates);
};

export const deleteRetakeRequestFromFirebase = async (requestId: string) => {
  const db = getFirestore();
  const requestRef = doc(db, RETAKE_REQUESTS_COLLECTION, requestId);
  await deleteDoc(requestRef);
};

export const subscribeToRetakeRequests = (callback: (requests: RetakeRequest[]) => void) => {
  const db = getFirestore();
  return onSnapshot(collection(db, RETAKE_REQUESTS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RetakeRequest[];
    callback(requests);
  });
};
