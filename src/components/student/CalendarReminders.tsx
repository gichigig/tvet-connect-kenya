import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Calendar as CalendarIcon, Clock, MapPin, Plus, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/config";
import { checkFirebaseConnectivity } from "@/lib/firebase";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: string;
  related_unit_code: string;
}

interface Reminder {
  id: string;
  event_id: string;
  reminder_time: string;
  is_sent: boolean;
  notification_type: string[];
}

const CalendarReminders = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'assignment',
    location: '',
    related_unit_code: ''
  });

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkFirebaseConnectivity().then(setFirebaseConnected);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setFirebaseConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connectivity check
    checkFirebaseConnectivity().then(setFirebaseConnected);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      if (firebaseConnected) {
        fetchEvents();
        fetchReminders();
      } else {
        // Use mock data when Firebase is not connected
        loadMockData();
      }
    }
    // eslint-disable-next-line
  }, [user, firebaseConnected]);

  const loadMockData = () => {
    // Mock events for offline/connection issues
    const mockEvents: CalendarEvent[] = [
      {
        id: 'mock-1',
        title: 'Programming Assignment Due',
        description: 'Submit your Java programming assignment',
        start_time: new Date().toISOString(),
        end_time: addDays(new Date(), 1).toISOString(),
        event_type: 'assignment',
        location: 'Online Submission',
        related_unit_code: 'CS101'
      },
      {
        id: 'mock-2',
        title: 'Mathematics Quiz',
        description: 'Calculus quiz in classroom',
        start_time: addDays(new Date(), 2).toISOString(),
        end_time: addDays(new Date(), 2).toISOString(),
        event_type: 'exam',
        location: 'Room 201',
        related_unit_code: 'MA101'
      }
    ];
    
    setEvents(mockEvents);
    setReminders([]);
    setLoading(false);
    toast.info('Showing offline data - some features may be limited');
  };

  const fetchEvents = () => {
    try {
      const db = getFirestore(firebaseApp);
      const eventsRef = collection(db, 'calendar_events');
      // Remove orderBy to avoid needing composite index, sort on client side instead
      const q = query(eventsRef, where('user_id', '==', user.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
        // Sort by start_time on the client side
        const sortedData = data.sort((a, b) => {
          const aTime = new Date(a.start_time);
          const bTime = new Date(b.start_time);
          return aTime.getTime() - bTime.getTime();
        });
        setEvents(sortedData);
        setLoading(false);
        setFirebaseConnected(true);
      }, (error) => {
        console.error('Error fetching events:', error);
        
        // Check if it's a network-related error
        if (error.code === 'unavailable' || error.message.includes('Failed to get document')) {
          setFirebaseConnected(false);
          loadMockData();
          toast.warning('Connection issues detected - showing offline data');
        } else {
          toast.error('Failed to load calendar events');
          setLoading(false);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize events query:', error);
      setFirebaseConnected(false);
      loadMockData();
      return () => {};
    }
  };

  const fetchReminders = () => {
    const db = getFirestore(firebaseApp);
    const remindersRef = collection(db, 'reminders');
    const q = query(remindersRef, where('user_id', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reminder[];
      setReminders(data);
    }, (error) => {
      console.error('Error fetching reminders:', error);
    });
    return unsubscribe;
  };

  const createEvent = async () => {
    if (!user || !newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      const eventsRef = collection(db, 'calendar_events');
      const eventDoc = await addDoc(eventsRef, {
        ...newEvent,
        user_id: user.id,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
      });
      // Create default reminder 1 hour before
      const reminderTime = new Date(newEvent.start_time);
      reminderTime.setHours(reminderTime.getHours() - 1);
      const remindersRef = collection(db, 'reminders');
      await addDoc(remindersRef, {
        event_id: eventDoc.id,
        user_id: user.id,
        reminder_time: Timestamp.fromDate(reminderTime),
        notification_type: ['app', 'email'],
        is_sent: false
      });
      toast.success('Event created successfully!');
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        event_type: 'assignment',
        location: '',
        related_unit_code: ''
      });
      // Refetch events and reminders
      fetchEvents();
      fetchReminders();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate >= now && eventDate <= nextWeek;
    }).slice(0, 5);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500';
      case 'assignment':
        return 'bg-blue-500';
      case 'lecture':
        return 'bg-green-500';
      case 'lab':
        return 'bg-purple-500';
      case 'meeting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventPriority = (event: CalendarEvent) => {
    const eventDate = new Date(event.start_time);
    if (isToday(eventDate)) return 'high';
    if (isTomorrow(eventDate)) return 'medium';
    return 'low';
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const upcomingEvents = getUpcomingEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar & Smart Reminders</h2>
          <p className="text-muted-foreground">
            Manage your academic schedule and never miss a deadline
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connectivity indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? (
              firebaseConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600">Limited</span>
                </>
              )
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
        
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar with smart reminders
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
              
              <Textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                  />
                </div>
              </div>

              <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({...newEvent, event_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="lab">Lab Session</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />

              <Input
                placeholder="Related unit code (optional)"
                value={newEvent.related_unit_code}
                onChange={(e) => setNewEvent({...newEvent, related_unit_code: e.target.value})}
              />

              <Button onClick={createEvent} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              
              <div className="flex-1 space-y-4">
                <h3 className="font-semibold">
                  Events for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <Card key={event.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-white ${getEventTypeColor(event.event_type)}`}>
                                {event.event_type}
                              </Badge>
                              <h4 className="font-medium">{event.title}</h4>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No events scheduled for this date
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events & Reminders */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const priority = getEventPriority(event);
                    const eventDate = new Date(event.start_time);
                    
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          priority === 'high' ? 'bg-red-500' : 
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-white text-xs ${getEventTypeColor(event.event_type)}`}>
                              {event.event_type}
                            </Badge>
                            {priority === 'high' && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          
                          <p className="text-xs text-muted-foreground">
                            {isToday(eventDate) ? 'Today' : 
                             isTomorrow(eventDate) ? 'Tomorrow' : 
                             format(eventDate, 'MMM d')} at {format(eventDate, 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No upcoming events
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarReminders;