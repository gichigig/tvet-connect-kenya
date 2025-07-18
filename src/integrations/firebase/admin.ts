import { getDatabase, ref, push } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseApp } from "./config";

export async function saveAdminToFirebase(admin: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "admin" | "student" | "lecturer" | "registrar" | "hod" | "finance";
  course?: string;
  level?: string;
  admissionNumber?: string;
}) {
  const auth = getAuth(firebaseApp);
  // Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
  // Send email verification
  if (userCredential && userCredential.user) {
    try {
      await sendEmailVerification(userCredential.user);
    } catch (err) {
      // Ignore or log error
    }
  }
  // Save user profile in database (for app use)
  const db = getDatabase(firebaseApp);
  let dbRef;
  let data: any = {
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    uid: userCredential.user.uid,
    role: admin.role
  };
  if (admin.role === "student") {
    dbRef = ref(db, "students");
    data.course = admin.course || "";
    data.level = admin.level || "";
    data.admissionNumber = admin.admissionNumber || "";
  } else {
    dbRef = ref(db, "admins");
  }
  await push(dbRef, data);
  return userCredential;
}
