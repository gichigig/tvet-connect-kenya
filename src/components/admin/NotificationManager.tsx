import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Users } from 'lucide-react';
import { createNotification, CreateNotificationData } from '@/utils/notificationUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationManagerProps {
  users?: any[]; // Array of users for sending notifications to specific users
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ users = [] }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as CreateNotificationData['type'],
    actionUrl: '',
    targetUser: 'all' // 'all' or specific userId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const notificationData: Omit<CreateNotificationData, 'userId'> = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        actionUrl: formData.actionUrl.trim() || undefined
      };

      if (formData.targetUser === 'all') {
        // Send to all users
        const userPromises = users.map(user => 
          createNotification({ ...notificationData, userId: user.id })
        );
        await Promise.all(userPromises);
        toast({
          title: "Success",
          description: `Notification sent to ${users.length} users`
        });
      } else {
        // Send to specific user
        await createNotification({ ...notificationData, userId: formData.targetUser });
        toast({
          title: "Success",
          description: "Notification sent successfully"
        });
      }

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        actionUrl: '',
        targetUser: 'all'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target User Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Send To</label>
            <Select value={formData.targetUser} onValueChange={(value) => handleInputChange('targetUser', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Users ({users.length})
                  </div>
                </SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="result">Result</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notification title"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Action URL (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Action URL (Optional)</label>
            <Input
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              placeholder="e.g., /courses, /assignments"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
