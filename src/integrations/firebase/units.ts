import { db } from './config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Unit } from '@/types/unitManagement';

const UNITS_COLLECTION = 'units';

export async function saveUnitToFirebase(unit: Unit) {
  const docRef = await addDoc(collection(db, UNITS_COLLECTION), unit);
  return { ...unit, id: docRef.id };
}

export async function fetchUnitsFromFirebase(): Promise<Unit[]> {
  const querySnapshot = await getDocs(collection(db, UNITS_COLLECTION));
  return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Unit[];
}

export async function updateUnitInFirebase(unitId: string, updates: Partial<Unit>) {
  const unitRef = doc(db, UNITS_COLLECTION, unitId);
  await updateDoc(unitRef, updates);
}

export async function deleteUnitFromFirebase(unitId: string) {
  const unitRef = doc(db, UNITS_COLLECTION, unitId);
  await deleteDoc(unitRef);
}
