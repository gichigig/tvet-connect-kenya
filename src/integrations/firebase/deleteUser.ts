import { getAuth, deleteUser as fbDeleteUser } from "firebase/auth";
import { firebaseApp } from "./config";

export async function deleteUserFromFirebase(uid: string) {
  const auth = getAuth(firebaseApp);
  // Only the currently signed-in user can delete themselves in client SDK.
  // For admin deletion, this should be done via Firebase Admin SDK on a server.
  // Here, we attempt to delete if the user is signed in as the target.
  if (auth.currentUser && auth.currentUser.uid === uid) {
    await fbDeleteUser(auth.currentUser);
    return true;
  } else {
    throw new Error("Cannot delete user: must be signed in as the user to delete.");
  }
}
