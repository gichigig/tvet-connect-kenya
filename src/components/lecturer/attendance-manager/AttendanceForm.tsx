
import { useState, useEffect } from "react";
import { useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
// Helper: Get IP-based location
async function getIPLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return { lat: data.latitude, lng: data.longitude };
  } catch {
    return null;
  }
}

// Helper: Device fingerprint (simple)
function getDeviceFingerprint() {
  return [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio,
    (window as any).hardwareConcurrency || "",
  ].join("|");
}
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Default map center (e.g., Nairobi)
const DEFAULT_CENTER = { lat: -1.286389, lng: 36.817223 };
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Unit } from "@/types/unitManagement";
import { StudentAttendanceTable } from "./StudentAttendanceTable";
import { saveAttendanceToFirebase } from "@/integrations/firebase/attendance";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  present: boolean;
}

interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
}

interface AttendanceFormProps {
  assignedUnits: Unit[];
  onSaveAttendance: (record: AttendanceRecord) => void;
  allowedLat?: string;
  allowedLng?: string;
  allowedRadius?: string;
  areaSet?: boolean;
}

export function AttendanceForm({ assignedUnits, onSaveAttendance, allowedLat = '', allowedLng = '', allowedRadius = '', areaSet = false }: AttendanceFormProps) {
  // HTTPS check
  const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";
  const fingerprintRef = useRef<string>(getDeviceFingerprint());
    const { toast } = useToast();
    const [selectedUnit, setSelectedUnit] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Lecturer setup for allowed area (lat, lng, radius in meters)
  const [localLat, setLocalLat] = useState<string>(allowedLat);
  const [localLng, setLocalLng] = useState<string>(allowedLng);
  const [localRadius, setLocalRadius] = useState<string>(allowedRadius);
  const [localAreaSet, setLocalAreaSet] = useState(areaSet);

  // Student geolocation state
  const [studentLat, setStudentLat] = useState<number | null>(null);
  const [studentLng, setStudentLng] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [ipLocation, setIPLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ipLocationError, setIPLocationError] = useState<string | null>(null);
  // On mount, get IP-based location
  useEffect(() => {
    getIPLocation().then(loc => {
      if (loc) setIPLocation(loc);
      else setIPLocationError("Failed to get IP-based location.");
    });
  }, []);

  // Use real enrolled students for the selected unit
  const { users, pendingUnitRegistrations } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!selectedUnit) {
      setStudents([]);
      return;
    }
    // Find all approved registrations for this unit
    const approvedRegs = pendingUnitRegistrations
      ? pendingUnitRegistrations.filter(
          reg => reg.unitCode === selectedUnit && reg.status === 'approved'
        )
      : [];
    // Map to student user info
    const enrolledStudents: Student[] = approvedRegs.map(reg => {
      const user = users.find(u => u.id === reg.studentId);
      return {
        id: reg.studentId,
        name: user ? `${user.firstName} ${user.lastName}` : reg.studentName,
        studentId: user?.admissionNumber || reg.studentId,
        email: user?.email || reg.studentEmail,
        present: false,
      };
    });
    setStudents(enrolledStudents);
  }, [selectedUnit, users, pendingUnitRegistrations]);


  // Haversine formula to calculate distance between two lat/lng points in meters
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat)/2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
  }

  // Student attempts to mark attendance
  const handleStudentAttendance = (studentId: string, present: boolean) => {
    // If area restriction is set, check geolocation
    if (areaSet && allowedLat && allowedLng && allowedRadius) {
      if (studentLat === null || studentLng === null) {
        setGeoError("Location not detected. Please allow location access and try again.");
        return;
      }
      const dist = getDistanceFromLatLonInMeters(
        parseFloat(allowedLat),
        parseFloat(allowedLng),
        studentLat,
        studentLng
      );
      if (dist > parseFloat(allowedRadius)) {
        setGeoError(`You are outside the allowed area for attendance. Distance: ${dist.toFixed(1)}m`);
        return;
      }
    }
    setGeoError(null);
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, present } : student
    ));
  };

  const handleMarkAll = (present: boolean) => {
    setStudents(students.map(student => ({ ...student, present })));
  };

  // Student: get current location
  const handleDetectLocation = () => {
    if (!isSecure) {
      setGeoError("Attendance marking is disabled unless HTTPS or localhost is used.");
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Trying IP-based location...");
      if (ipLocation) {
        setStudentLat(ipLocation.lat);
        setStudentLng(ipLocation.lng);
        setGeoError(null);
      } else {
        setGeoError(ipLocationError || "Failed to get IP-based location.");
      }
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStudentLat(pos.coords.latitude);
        setStudentLng(pos.coords.longitude);
        setGeoError(null);
      },
      (err) => {
        setGeoError("Failed to get location: " + err.message + ". Trying IP-based location...");
        if (ipLocation) {
          setStudentLat(ipLocation.lat);
          setStudentLng(ipLocation.lng);
          setGeoError(null);
        } else {
          setGeoError(ipLocationError || "Failed to get IP-based location.");
        }
      }
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedUnit) {
      toast({
        title: "Error",
        description: "Please select a unit first.",
        variant: "destructive",
      });
      return;
    }

    const selectedUnitData = assignedUnits.find(unit => unit.code === selectedUnit);
    if (!selectedUnitData) {
      toast({
        title: "Error",
        description: "Selected unit not found.",
        variant: "destructive",
      });
      return;
    }

    const presentStudents = students.filter(s => s.present).length;
    const attendanceRate = Math.round((presentStudents / students.length) * 100 * 10) / 10;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      unitCode: selectedUnitData.code,
      unitName: selectedUnitData.name,
      date: selectedDate,
      totalStudents: students.length,
      presentStudents,
      attendanceRate
    };

    try {
      await saveAttendanceToFirebase({
        ...newRecord,
        students,
        fingerprint: fingerprintRef.current,
      });
      onSaveAttendance(newRecord);
      toast({
        title: "Attendance Saved",
        description: `Attendance for ${selectedUnitData.code} on ${selectedDate} has been saved and synced to Firebase.`
      });
      // Reset attendance for next session
      setStudents(students.map(student => ({ ...student, present: false })));
    } catch (err: any) {
      toast({
        title: "Database Error",
        description: err.message || "Failed to save attendance to Firebase.",
        variant: "destructive",
      });
    }
  };

  const presentCount = students.filter(s => s.present).length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100 * 10) / 10 : 0;

  // Device fingerprint warning (for admin/lecturer)
  // In a real app, you would send this to backend and compare across users
  // For demo, just show it
  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Attendance</CardTitle>
        <CardDescription>Mark student attendance for today's class</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSecure && (
          <div className="text-xs text-red-600 mb-2">
            Attendance marking is <b>disabled</b> unless HTTPS or localhost is used.<br />
            Please switch to a secure connection.
          </div>
        )}
        <div className="text-xs text-gray-500 mb-2">
          Device fingerprint: <span className="break-all">{fingerprintRef.current}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {assignedUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.code}>
                    {unit.code} - {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Show map with red circle if area is set and coordinates are available */}
        {localAreaSet && localLat && localLng && localRadius && (
          <div className="my-4">
            <div className="font-semibold mb-2">Allowed Attendance Area</div>
            <div style={{ height: 300, width: "100%" }}>
              <MapContainer
                center={{ lat: parseFloat(localLat), lng: parseFloat(localLng) }}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={{ lat: parseFloat(localLat), lng: parseFloat(localLng) }} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />
                <Circle
                  center={{ lat: parseFloat(localLat), lng: parseFloat(localLng) }}
                  radius={parseFloat(localRadius)}
                  pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.2 }}
                />
              </MapContainer>
            </div>
            <div className="text-xs text-red-700 mt-1">
              Area: {localRadius}m radius around ({parseFloat(localLat).toFixed(5)}, {parseFloat(localLng).toFixed(5)})
            </div>
          </div>
        )}
        {/* Lecturer: Set allowed area for attendance */}
        <div className="border rounded p-3 my-2 bg-gray-50">
          <div className="font-semibold mb-2">Lecturer: Set Allowed Attendance Area</div>
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitude"
              value={localLat}
              onChange={e => setLocalLat(e.target.value)}
              className="w-full md:w-1/4"
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              value={localLng}
              onChange={e => setLocalLng(e.target.value)}
              className="w-full md:w-1/4"
            />
            <Input
              type="number"
              step="any"
              placeholder="Radius (meters)"
              value={localRadius}
              onChange={e => setLocalRadius(e.target.value)}
              className="w-full md:w-1/4"
            />
            <Button
              variant={areaSet ? "default" : "secondary"}
              onClick={() => {
                if (allowedLat && allowedLng && allowedRadius) {
                  setLocalAreaSet(true);
                  toast({ title: "Area Set", description: "Attendance restricted to " + allowedRadius + "m around (" + allowedLat + ", " + allowedLng + ")" });
                } else {
                  toast({ title: "Error", description: "Please enter all area fields.", variant: "destructive" });
                }
              }}
            >
              {areaSet ? "Area Set" : "Set Area"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!navigator.geolocation) {
                  toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
                  return;
                }
                setGeoError(null);
                toast({ title: "Detecting Location...", description: "Please allow location access." });
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLocalLat(pos.coords.latitude.toString());
                    setLocalLng(pos.coords.longitude.toString());
                    toast({ title: "Location Set", description: `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}` });
                  },
                  (err) => {
                    setGeoError("Failed to get location: " + err.message);
                    toast({ title: "Error", description: "Failed to get location: " + err.message, variant: "destructive" });
                  }
                );
              }}
            >
              Use My Location
            </Button>
            {geoError && (
              <div className="text-xs text-red-600 mt-1">
                {geoError}<br />
                {geoError.toLowerCase().includes('only secure origins are allowed') ? (
                  <div className="mt-1 text-xs text-orange-600">
                    Location access only works on HTTPS or localhost.<br />
                    Please deploy your site with HTTPS or use <b>localhost</b> for development.<br />
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts" target="_blank" rel="noopener noreferrer" className="underline">Learn more</a>
                  </div>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => {
                      setGeoError(null);
                      if (!navigator.geolocation) {
                        toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
                        return;
                      }
                      toast({ title: "Retrying Location...", description: "Please allow location access." });
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLocalLat(pos.coords.latitude.toString());
                          setLocalLng(pos.coords.longitude.toString());
                          toast({ title: "Location Set", description: `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}` });
                        },
                        (err) => {
                          setGeoError("Failed to get location: " + err.message);
                          toast({ title: "Error", description: "Failed to get location: " + err.message, variant: "destructive" });
                        }
                      );
                    }}>
                      Retry Location
                    </Button>
                    <div className="mt-1 text-xs text-gray-500">If you denied location access, please enable it in your browser settings and try again.</div>
                  </>
                )}
              </div>
            )}
            {areaSet && (
              <Button variant="outline" onClick={() => setLocalAreaSet(false)}>
                Clear
              </Button>
            )}
          </div>
          {areaSet && (
            <div className="text-xs text-green-700 mt-1">Area restriction is active for students.</div>
          )}
        </div>

        {/* Student: Detect location and show status */}
        {areaSet && (
          <div className="border rounded p-3 my-2 bg-blue-50">
            <div className="font-semibold mb-2">Student: Location Check</div>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <Button variant="outline" onClick={handleDetectLocation} disabled={!isSecure}>
                Detect My Location
              </Button>
              {studentLat !== null && studentLng !== null && (
                <span className="text-xs text-gray-700">Lat: {studentLat.toFixed(5)}, Lng: {studentLng.toFixed(5)}</span>
              )}
              {geoError && (
                <span className="text-xs text-red-600">{geoError}</span>
              )}
              {!geoError && studentLat !== null && studentLng !== null && (
                <span className="text-xs text-green-700">Location OK</span>
              )}
            </div>
          </div>
        )}

        {selectedUnit && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  {presentCount}/{students.length} Present ({attendanceRate}%)
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleMarkAll(true)}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleMarkAll(false)}>
                  Mark All Absent
                </Button>
              </div>
            </div>

            <StudentAttendanceTable 
              students={students}
              onStudentAttendanceChange={handleStudentAttendance}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={handleSaveAttendance}>
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
