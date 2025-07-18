import { getDatabase, ref, get } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";
import type { AttendanceRecord } from "./attendance";

export async function fetchAttendanceByUnit(unitCode: string): Promise<AttendanceRecord[]> {
  const db = getDatabase(firebaseApp);
  const attendanceRef = ref(db, "attendance");
  const snapshot = await get(attendanceRef);
  if (!snapshot.exists()) return [];
  const recordsObj = snapshot.val();
  return Object.values(recordsObj).filter((rec: any) => rec.unitCode === unitCode) as AttendanceRecord[];
}

export async function fetchAttendanceByLecturer(lecturerId: string): Promise<AttendanceRecord[]> {
  const db = getDatabase(firebaseApp);
  const attendanceRef = ref(db, "attendance");
  const snapshot = await get(attendanceRef);
  if (!snapshot.exists()) return [];
  const recordsObj = snapshot.val();
  // Assumes AttendanceRecord has a lecturerId property. If not, add it when saving.
  return Object.values(recordsObj).filter((rec: any) => rec.lecturerId === lecturerId) as AttendanceRecord[];
}
