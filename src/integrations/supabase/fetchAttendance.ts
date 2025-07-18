import { getDatabase, ref, get, child } from "firebase/database";
import { firebaseApp } from "@/integrations/firebase/config";

import type { AttendanceRecord } from "./attendance";

export async function fetchAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  const db = getDatabase(firebaseApp);
  const attendanceRef = ref(db, "attendance");
  const snapshot = await get(attendanceRef);
  if (!snapshot.exists()) return [];
  const recordsObj = snapshot.val();
  // Convert object to array
  return Object.values(recordsObj) as AttendanceRecord[];
}
