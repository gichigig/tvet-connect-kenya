import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeolocationService } from '@/lib/geolocation';
import { StorageService } from '@/lib/storage';
import { AttendanceLocation, AttendanceRecord, GeolocationData } from '@/types/attendance';

import type { StudentData } from "@/types/attendance";
interface AttendanceButtonProps {
  location?: AttendanceLocation;
  onAttendanceMarked?: () => void;
  student?: StudentData | null;
  isInsideGeofence?: boolean;
}

export function AttendanceButton({ location, onAttendanceMarked, student, isInsideGeofence }: AttendanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationData | null>(null);
  const [canMarkAttendance, setCanMarkAttendance] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingAttendance();
    // eslint-disable-next-line
  }, [location?.id, student?.id]);

  const checkExistingAttendance = () => {
    let studentId = student?.id;
    if (!studentId) {
      const user = StorageService.getCurrentUser();
      if (!user || !user.student) return;
      studentId = user.student.id;
    }
    if (!studentId || !location) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = StorageService.getStudentAttendanceRecords(studentId);
    const todayRecord = records.find(r => {
      const recordDate = new Date(r.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime() && r.locationId === location.id;
    });
    setAlreadyMarked(!!todayRecord);
  };

  const checkLocation = async () => {
    setIsLoading(true);
    try {
      const position = await GeolocationService.getCurrentPosition();
      setCurrentLocation(position);

      const { isValid, distance: calculatedDistance } = GeolocationService.isWithinGeofence(
        position,
        location
      );

      setDistance(calculatedDistance);
      setCanMarkAttendance(isValid);

      if (!isValid) {
        toast({
          title: "Location Error",
          description: `You are ${GeolocationService.formatDistance(calculatedDistance)} away from the allowed area. You must be within ${location.radius}m to mark attendance.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!currentLocation || !canMarkAttendance) {
      await checkLocation();
      return;
    }

    let studentId = student?.id;
    if (!studentId) {
      const user = StorageService.getCurrentUser();
      if (!user || !user.student) {
        toast({
          title: "Error",
          description: "Please log in to mark attendance.",
          variant: "destructive",
        });
        return;
      }
      studentId = user.student.id;
    }
    if (!studentId || !location) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const attendanceRecord: AttendanceRecord = {
        id: `${studentId}-${location.id}-${now.getTime()}`,
        studentId: studentId,
        locationId: location.id,
        timestamp: now,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        status: 'present',
        distance: distance || 0,
      };

      StorageService.addAttendanceRecord(attendanceRecord);
      setAlreadyMarked(true);

      toast({
        title: "Attendance Marked!",
        description: `Successfully marked attendance for ${location.name}`,
        variant: "default",
      });

      onAttendanceMarked?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (alreadyMarked) {
      return (
        <Badge variant="secondary" className="bg-success text-success-foreground">
          <CheckCircle className="w-3 h-3 mr-1" />
          Marked
        </Badge>
      );
    }
    
    if (distance !== null) {
      return canMarkAttendance ? (
        <Badge variant="secondary" className="bg-success text-success-foreground">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Range
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Out of Range
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card className="shadow-card hover:shadow-primary transition-all duration-300 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{location.name}</h3>
              <p className="text-sm text-muted-foreground">{location.description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Allowed Range:</span>
            <span className="font-medium">{location.radius}m</span>
          </div>

          {distance !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Distance:</span>
              <span className={`font-medium ${canMarkAttendance ? 'text-success' : 'text-destructive'}`}>
                {GeolocationService.formatDistance(distance)}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <Button
          variant={alreadyMarked ? "secondary" : "default"}
          size="lg"
          className="w-full mt-4"
          onClick={markAttendance}
          disabled={isLoading || alreadyMarked || !location.isActive}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {alreadyMarked 
            ? "Attendance Already Marked" 
            : canMarkAttendance 
            ? "Mark Attendance" 
            : "Check Location"
          }
        </Button>
      </CardContent>
    </Card>
  );
}