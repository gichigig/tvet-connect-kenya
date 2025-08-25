import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseApp } from "./config";

export async function saveAdminToFirebase(admin: {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "admin" | "student" | "lecturer" | "registrar" | "hod" | "finance";
  course?: string;
  level?: string;
  admissionNumber?: string;
  departments?: string[];
  courses?: string[];
  units?: string[];
  department?: string;
}) {
  const auth = getAuth(firebaseApp);
  
  // Create user in Firebase Authentication using the provided email
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
    username: admin.username,
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
    // Add role-specific data
    if (admin.role === "hod" && admin.department) {
      data.department = admin.department;
    }
    if (admin.role === "lecturer") {
      data.departments = admin.departments || [];
      data.courses = admin.courses || [];
      data.units = admin.units || [];
    }
  }
  await push(dbRef, data);
  
  // Also save to username index for lookup
  const usernameRef = ref(db, `usersByUsername/${admin.username}`);
  await set(usernameRef, {
    uid: userCredential.user.uid,
    role: admin.role,
    ...data
  });
  
  return userCredential;
}
