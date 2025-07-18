import { getDatabase, ref, get } from "firebase/database";
import { firebaseApp } from "./config";

export async function findUserByEmailOrAdmission({ email, admission }: { email?: string; admission?: string }) {
  const db = getDatabase(firebaseApp);
  // Search admins by email
  if (email) {
    const adminsRef = ref(db, "admins");
    const adminsSnap = await get(adminsRef);
    if (adminsSnap.exists()) {
      const admins = Object.values(adminsSnap.val());
      const found = admins.find((a: any) => a.email === email);
      if (found) return found;
    }
    // Search students by email
    const studentsRef = ref(db, "students");
    const studentsSnap = await get(studentsRef);
    if (studentsSnap.exists()) {
      const students = Object.values(studentsSnap.val());
      const found = students.find((s: any) => s.email === email);
      if (found) return found;
    }
  }
  // Search students by admission number
  if (admission) {
    const studentsRef = ref(db, "students");
    const studentsSnap = await get(studentsRef);
    if (studentsSnap.exists()) {
      const students = Object.values(studentsSnap.val());
      const found = students.find((s: any) => s.admissionNumber === admission);
      if (found) return found;
    }
  }
  return null;
}
