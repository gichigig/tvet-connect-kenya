import { getDatabase, ref, get } from "firebase/database";
import { firebaseApp } from "./config";

export async function fetchAllUsersFromFirebase() {
  const db = getDatabase(firebaseApp);
  // Fetch both admins and students
  const adminsSnap = await get(ref(db, "admins"));
  const studentsSnap = await get(ref(db, "students"));
  let users: any[] = [];
  if (adminsSnap.exists()) {
    users = users.concat(Object.values(adminsSnap.val()));
  }
  if (studentsSnap.exists()) {
    users = users.concat(Object.values(studentsSnap.val()));
  }
  // Optionally: fetch other roles (lecturer, hod, registrar, finance) if stored separately
  // e.g. lecturers: ref(db, "lecturers")
  return users;
}
