import { getDatabase, ref, get, child } from "firebase/database";
import { firebaseApp } from "./config";

export async function fetchAdminsFromFirebase() {
  const db = getDatabase(firebaseApp);
  const adminsRef = ref(db, "admins");
  const snapshot = await get(adminsRef);
  if (snapshot.exists()) {
    // Return as array of admin objects
    return Object.values(snapshot.val());
  }
  return [];
}
