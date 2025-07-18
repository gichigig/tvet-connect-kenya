import { getDatabase, ref, push, set } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";

export interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
  lecturerId: string;
  students: { id: string; name: string; studentId: string; email: string; present: boolean }[];
}

export async function saveAttendanceRecord(record: AttendanceRecord) {
  const db = getDatabase(firebaseApp);
  // Save attendance summary and students under /attendance/{id}
  const attendanceRef = ref(db, `attendance/${record.id}`);
  await set(attendanceRef, {
    id: record.id,
    unitCode: record.unitCode,
    unitName: record.unitName,
    date: record.date,
    totalStudents: record.totalStudents,
    presentStudents: record.presentStudents,
    attendanceRate: record.attendanceRate,
    lecturerId: record.lecturerId,
    students: record.students,
  });
  return true;
}
