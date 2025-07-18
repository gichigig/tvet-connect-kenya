import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { AttendanceRecord, AttendanceStats, AttendanceLocation, StudentData } from '@/types/attendance';

interface AttendanceHistoryProps {
  student?: StudentData | null;
}

export function AttendanceHistory({ student }: AttendanceHistoryProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [student]);

  const loadData = () => {
    let studentId: string | undefined;
    if (student && student.id) {
      studentId = student.id;
    } else {
      const user = StorageService.getCurrentUser();
      if (!user || !user.student) return;
      studentId = user.student.id;
    }
    if (!studentId) return;

    const attendanceRecords = StorageService.getStudentAttendanceRecords(studentId);
    const allLocations = StorageService.getLocations();
    setRecords(attendanceRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setLocations(allLocations);
    // Calculate stats
    const totalClasses = 30; // Mock total classes
    const attended = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = Math.max(0, totalClasses - attended - late);
    setStats({
      totalClasses,
      attended,
      late,
      absent,
      attendancePercentage: Math.round((attended / totalClasses) * 100)
    });
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      present: { variant: "secondary", className: "bg-success text-success-foreground", text: "Present" },
      late: { variant: "secondary", className: "bg-warning text-warning-foreground", text: "Late" },
      absent: { variant: "destructive", text: "Absent" }
    };
    
    const config = variants[status] || variants.present;
    return (
      <Badge {...config}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                  <p className="text-2xl font-bold text-primary">{stats.attendancePercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-success">{stats.attended}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-warning">{stats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Attendance History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Records</TabsTrigger>
              <TabsTrigger value="all">All Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-3">
              {records.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <MapPin className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{getLocationName(record.locationId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(record.status)}
                    <span className="text-sm text-muted-foreground">{record.distance}m</span>
                  </div>
                </div>
              ))}
              
              {records.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendance records yet</p>
                  <p className="text-sm text-muted-foreground">Start marking your attendance to see history here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <MapPin className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{getLocationName(record.locationId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(record.status)}
                    <span className="text-sm text-muted-foreground">{record.distance}m</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}