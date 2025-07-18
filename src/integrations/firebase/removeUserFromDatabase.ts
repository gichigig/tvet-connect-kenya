import { getDatabase, ref, remove, get, child } from "firebase/database";
import { firebaseApp } from "./config";

/**
 * Remove a user from the database by UID, searching both admins and students.
 */
export async function removeUserFromDatabase(uid: string): Promise<void> {
  const db = getDatabase(firebaseApp);
  // Try to find and remove from admins
  const adminsRef = ref(db, "admins");
  const studentsRef = ref(db, "students");

  // Helper to find and remove user by UID in a given ref
  async function findAndRemove(refPath: any) {
    const snapshot = await get(refPath);
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        if (data[key].uid === uid) {
          await remove(child(refPath, key));
          return true;
        }
      }
    }
    return false;
  }

  // Try admins first, then students
  const removedFromAdmins = await findAndRemove(adminsRef);
  if (!removedFromAdmins) {
    await findAndRemove(studentsRef);
  }
}
