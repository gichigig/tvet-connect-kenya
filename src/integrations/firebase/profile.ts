import { getAuth, updateEmail, updatePassword, updateProfile, User as FirebaseUser } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "./config";

export async function updateUserEmail(newEmail: string) {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) throw new Error("Not authenticated");
  await updateEmail(auth.currentUser, newEmail);
}

export async function updateUserPassword(newPassword: string) {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) throw new Error("Not authenticated");
  await updatePassword(auth.currentUser, newPassword);
}

export async function updateUserPhoneNumber(userId: string, phone: string) {
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, { phone });
}

export async function updateUserProfilePicture(userId: string, file: File): Promise<string> {
  const storage = getStorage(firebaseApp);
  const fileRef = storageRef(storage, `profile_pictures/${userId}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  // Optionally update user profile in database
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, { profilePicture: url });
  return url;
}
