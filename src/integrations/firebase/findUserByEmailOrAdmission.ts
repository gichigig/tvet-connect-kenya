import { getDatabase, ref, get } from "firebase/database";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { firebaseApp } from "./config";

export async function findUserByEmailOrAdmission({ email, admission }: { email?: string; admission?: string }) {
  // Search in Firebase Realtime Database
  const db = getDatabase(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  // Search by email
  if (email) {
    // Search admins in Realtime Database
    const adminsRef = ref(db, "admins");
    const adminsSnap = await get(adminsRef);
    if (adminsSnap.exists()) {
      const admins = Object.values(adminsSnap.val());
      const found = admins.find((a: any) => a.email === email);
      if (found) return found;
    }
    
    // Search students in Realtime Database
    const studentsRef = ref(db, "students");
    const studentsSnap = await get(studentsRef);
    if (studentsSnap.exists()) {
      const students = Object.values(studentsSnap.val());
      const found = students.find((s: any) => s.email === email);
      if (found) return found;
    }

    // Search in Firestore collections
    try {
      // Search users collection
      const usersQuery = query(collection(firestore, "users"), where("email", "==", email));
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        return { ...usersSnapshot.docs[0].data(), id: usersSnapshot.docs[0].id };
      }

      // Search students collection in Firestore
      const firestoreStudentsQuery = query(collection(firestore, "students"), where("email", "==", email));
      const firestoreStudentsSnapshot = await getDocs(firestoreStudentsQuery);
      if (!firestoreStudentsSnapshot.empty) {
        return { ...firestoreStudentsSnapshot.docs[0].data(), id: firestoreStudentsSnapshot.docs[0].id };
      }
    } catch (error) {
      console.error("Error searching Firestore:", error);
    }
  }
  
  // Search by admission number
  if (admission) {
    // Search students in Realtime Database by admission number
    const studentsRef = ref(db, "students");
    const studentsSnap = await get(studentsRef);
    if (studentsSnap.exists()) {
      const students = Object.values(studentsSnap.val());
      const found = students.find((s: any) => s.admissionNumber === admission);
      if (found) return found;
    }

    // Search in Firestore by admission number
    try {
      const firestoreStudentsQuery = query(
        collection(firestore, "students"), 
        where("admissionNumber", "==", admission)
      );
      const firestoreStudentsSnapshot = await getDocs(firestoreStudentsQuery);
      if (!firestoreStudentsSnapshot.empty) {
        return { ...firestoreStudentsSnapshot.docs[0].data(), id: firestoreStudentsSnapshot.docs[0].id };
      }
    } catch (error) {
      console.error("Error searching Firestore by admission:", error);
    }
  }
  
  return null;
}
