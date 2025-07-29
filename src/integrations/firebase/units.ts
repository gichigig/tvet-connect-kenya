import { db } from './config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Unit } from '@/types/unitManagement';

const UNITS_COLLECTION = 'units';

export async function saveUnitToFirebase(unit: Omit<Unit, 'id'>) {
  try {
    // Clean the unit object by removing undefined and empty values
    const cleanUnit = Object.fromEntries(
      Object.entries(unit).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );

    // Save to Firebase
    const docRef = await addDoc(collection(db, UNITS_COLLECTION), cleanUnit);
    return { ...cleanUnit, id: docRef.id } as Unit;
  } catch (error) {
    console.error('Error saving unit to Firebase:', error);
    throw new Error('Failed to save unit. Please try again.');
  }
}

export async function fetchUnitsFromFirebase(): Promise<Unit[]> {
  try {
    // Debug: Check authentication status
    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log('fetchUnitsFromFirebase - Current user:', currentUser?.uid);
    console.log('fetchUnitsFromFirebase - User email:', currentUser?.email);
    
    const querySnapshot = await getDocs(collection(db, UNITS_COLLECTION));
    console.log('fetchUnitsFromFirebase - Successfully fetched units:', querySnapshot.size);
    return querySnapshot.docs.map(docSnap => ({ 
      id: docSnap.id, 
      ...docSnap.data() 
    })) as Unit[];
  } catch (error) {
    console.error('Error fetching units from Firebase:', error);
    throw new Error('Failed to fetch units. Please try again.');
  }
}

export async function updateUnitInFirebase(unitId: string, updates: Partial<Unit>) {
  try {
    // Clean the updates object
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );

    const unitRef = doc(db, UNITS_COLLECTION, unitId);
    await updateDoc(unitRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating unit in Firebase:', error);
    throw new Error('Failed to update unit. Please try again.');
  }
}

export async function deleteUnitFromFirebase(unitId: string) {
  try {
    const unitRef = doc(db, UNITS_COLLECTION, unitId);
    await deleteDoc(unitRef);
  } catch (error) {
    console.error('Error deleting unit from Firebase:', error);
    throw new Error('Failed to delete unit. Please try again.');
  }
}
