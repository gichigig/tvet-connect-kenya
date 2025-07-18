
import { getDatabase, ref, push, get } from "firebase/database";
import { firebaseApp } from "./config";

export interface AttendanceStudent {
  id: string;
  name: string;
  studentId: string;
  email: string;
  present: boolean;
}

export interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
  students: AttendanceStudent[];
  fingerprint?: string;
}

export async function saveAttendanceToFirebase(record: AttendanceRecord) {
  const db = getDatabase(firebaseApp);
  // Save attendance summary
  const attendanceRef = ref(db, `attendance/${record.id}`);
  await push(attendanceRef, {
    id: record.id,
    unitCode: record.unitCode,
    unitName: record.unitName,
    date: record.date,
    totalStudents: record.totalStudents,
    presentStudents: record.presentStudents,
    attendanceRate: record.attendanceRate,
    students: record.students,
    fingerprint: record.fingerprint || "",
  });

  // Check for reused fingerprints
  const allAttendanceRef = ref(db, "attendance");
  const snapshot = await get(allAttendanceRef);
  const reused: { attendanceId: string; studentId: string; date: string }[] = [];
  if (snapshot.exists()) {
    snapshot.forEach(childSnap => {
      childSnap.forEach(attSnap => {
        const data = attSnap.val();
        if (
          data.fingerprint === record.fingerprint &&
          data.students &&
          Array.isArray(data.students)
        ) {
          // If fingerprint matches and studentId is different
          const otherStudent = data.students.find(
            (s: any) => s.id !== record.students[0]?.id
          );
          if (otherStudent) {
            reused.push({
              attendanceId: data.id,
              studentId: otherStudent.id,
              date: data.date,
            });
          }
        }
      });
    });
  }
  if (reused.length > 0) {
    // You can log, notify admin, or block attendance here
    // For demo, just return info
    return { status: "warning", reused };
  }
  return { status: "ok" };
}
