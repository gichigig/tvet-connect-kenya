import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Save, 
  Eye, 
  Edit,
  Trash2,
  Video,
  BookOpen,
  PenTool,
  FileQuestion
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  week_number: number;
  day_of_week: number;
  activity_type: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  venue: string;
  online_class_link: string;
  meeting_platform: string;
  meeting_id: string;
  passcode: string;
  required_materials: string[];
  is_mandatory: boolean;
}

interface SemesterPlan {
  id: string;
  unit_id: string;
  semester: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface SemesterPlanCreatorProps {
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId: string;
}

export const SemesterPlanCreator: React.FC<SemesterPlanCreatorProps> = ({
  unitId,
  unitCode,
  unitName,
  lecturerId
}) => {
  const [semesterPlan, setSemesterPlan] = useState<SemesterPlan | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [planForm, setPlanForm] = useState({
    semester: '',
    academic_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    start_date: '',
    end_date: ''
  });

  const [activityForm, setActivityForm] = useState({
    week_number: 1,
    day_of_week: 1,
    activity_type: 'lecture',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    venue: '',
    online_class_link: '',
    meeting_platform: '',
    meeting_id: '',
    passcode: '',
    required_materials: '',
    is_mandatory: true
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const activityTypeIcons = {
    'lecture': <BookOpen className="h-4 w-4" />,
    'assignment': <PenTool className="h-4 w-4" />,
    'exam': <FileQuestion className="h-4 w-4" />,
    'lab': <BookOpen className="h-4 w-4" />,
    'online_class': <Video className="h-4 w-4" />,
    'review': <Eye className="h-4 w-4" />,
    'break': <Clock className="h-4 w-4" />
  };

  const loadSemesterPlan = async () => {
    try {
      setLoading(true);

      // Load existing semester plan
      const { data: plan, error: planError } = await supabase
        .from('semester_plans')
        .select('*')
        .eq('unit_id', unitId)
        .eq('lecturer_id', lecturerId)
        .eq('is_active', true)
        .single();

      if (planError && planError.code !== 'PGRST116') throw planError;

      if (plan) {
        setSemesterPlan(plan);
        setPlanForm({
          semester: plan.semester,
          academic_year: plan.academic_year,
          start_date: plan.start_date,
          end_date: plan.end_date
        });

        // Load activities for this plan
        const { data: activities, error: activitiesError } = await supabase
          .from('semester_plan_activities')
          .select('*')
          .eq('semester_plan_id', plan.id)
          .order('week_number', { ascending: true })
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });

        if (activitiesError) throw activitiesError;
        setActivities(activities || []);
      }
    } catch (error) {
      console.error('Error loading semester plan:', error);
      toast.error('Failed to load semester plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesterPlan();
  }, [unitId, lecturerId]);

  const createSemesterPlan = async () => {
    if (!planForm.semester || !planForm.start_date || !planForm.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('semester_plans')
        .insert([{
          unit_id: unitId,
          lecturer_id: lecturerId,
          semester: planForm.semester,
          academic_year: planForm.academic_year,
          start_date: planForm.start_date,
          end_date: planForm.end_date,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setSemesterPlan(data);
      toast.success('Semester plan created successfully!');
    } catch (error) {
      console.error('Error creating semester plan:', error);
      toast.error('Failed to create semester plan');
    } finally {
      setIsCreating(false);
    }
  };

  const addActivity = async () => {
    if (!semesterPlan) return;
    if (!activityForm.title || !activityForm.start_time || !activityForm.end_time) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('semester_plan_activities')
        .insert([{
          semester_plan_id: semesterPlan.id,
          week_number: activityForm.week_number,
          day_of_week: activityForm.day_of_week,
          activity_type: activityForm.activity_type,
          title: activityForm.title,
          description: activityForm.description,
          start_time: activityForm.start_time,
          end_time: activityForm.end_time,
          venue: activityForm.venue,
          online_class_link: activityForm.online_class_link,
          meeting_platform: activityForm.meeting_platform,
          meeting_id: activityForm.meeting_id,
          passcode: activityForm.passcode,
          required_materials: activityForm.required_materials ? activityForm.required_materials.split(',').map(m => m.trim()) : [],
          is_mandatory: activityForm.is_mandatory
        }])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [...prev, data]);
      setActivityForm({
        week_number: 1,
        day_of_week: 1,
        activity_type: 'lecture',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        venue: '',
        online_class_link: '',
        meeting_platform: '',
        meeting_id: '',
        passcode: '',
        required_materials: '',
        is_mandatory: true
      });

      toast.success('Activity added successfully!');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('semester_plan_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== activityId));
      toast.success('Activity deleted successfully!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const getWeekNumber = (activities: Activity[]): number => {
    const maxWeek = Math.max(...activities.map(a => a.week_number), 0);
    return maxWeek + 1;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Semester Plan - {unitCode} ({unitName})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!semesterPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    value={planForm.semester}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="e.g., 1, 2"
                  />
                </div>
                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Input
                    id="academic-year"
                    value={planForm.academic_year}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, academic_year: e.target.value }))}
                    placeholder="e.g., 2024/2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={planForm.start_date}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={planForm.end_date}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={createSemesterPlan} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Semester Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Semester Plan Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Semester:</strong> {semesterPlan.semester}</p>
                <p><strong>Academic Year:</strong> {semesterPlan.academic_year}</p>
                <p><strong>Start Date:</strong> {new Date(semesterPlan.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(semesterPlan.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {semesterPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Week Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={activityForm.week_number}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, week_number: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label>Day of Week</Label>
                <Select
                  value={activityForm.day_of_week.toString()}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Activity Type</Label>
                <Select
                  value={activityForm.activity_type}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, activity_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="lab">Lab Session</SelectItem>
                    <SelectItem value="online_class">Online Class</SelectItem>
                    <SelectItem value="review">Review Session</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={activityForm.title}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Activity title"
                />
              </div>
              <div>
                <Label>Venue</Label>
                <Input
                  value={activityForm.venue}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Room/Location"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Activity description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={activityForm.start_time}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={activityForm.end_time}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            {activityForm.activity_type === 'online_class' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Online Class Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meeting Platform</Label>
                    <Select
                      value={activityForm.meeting_platform}
                      onValueChange={(value) => setActivityForm(prev => ({ ...prev, meeting_platform: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="google_meet">Google Meet</SelectItem>
                        <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Meeting ID</Label>
                    <Input
                      value={activityForm.meeting_id}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, meeting_id: e.target.value }))}
                      placeholder="Meeting ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meeting Link</Label>
                    <Input
                      value={activityForm.online_class_link}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, online_class_link: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Passcode (Optional)</Label>
                    <Input
                      value={activityForm.passcode}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, passcode: e.target.value }))}
                      placeholder="Meeting passcode"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Required Materials (comma-separated)</Label>
              <Input
                value={activityForm.required_materials}
                onChange={(e) => setActivityForm(prev => ({ ...prev, required_materials: e.target.value }))}
                placeholder="Textbook, Calculator, Notes"
              />
            </div>

            <Button onClick={addActivity} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </CardContent>
        </Card>
      )}

      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Semester Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {activityTypeIcons[activity.activity_type as keyof typeof activityTypeIcons]}
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            Week {activity.week_number} - {dayNames[activity.day_of_week - 1]}
                          </span>
                        </div>
                        
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.start_time} - {activity.end_time}
                          </span>
                          {activity.venue && (
                            <span>{activity.venue}</span>
                          )}
                          {activity.online_class_link && (
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Online Class
                            </span>
                          )}
                        </div>

                        {activity.online_class_link && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(activity.online_class_link, '_blank')}
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join Class
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => deleteActivity(activity.id)}
                        size="sm"
                        variant="destructive"
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};