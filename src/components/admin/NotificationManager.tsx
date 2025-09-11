import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Trash2, Users, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole: 'all' | 'student' | 'lecturer' | 'admin' | 'finance' | 'hod' | 'registrar';
  priority: 'low' | 'medium' | 'high';
  scheduled: boolean;
  scheduledDate?: string;
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentTo: number;
}

const NotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance',
      message: 'The system will be under maintenance on Sunday from 2:00 AM to 6:00 AM',
      type: 'warning',
      targetRole: 'all',
      priority: 'high',
      scheduled: false,
      status: 'sent',
      createdAt: '2025-09-05',
      sentTo: 245
    },
    {
      id: '2',
      title: 'Assignment Deadline Reminder',
      message: 'Programming Assignment 1 is due in 3 days. Please submit before the deadline.',
      type: 'info',
      targetRole: 'student',
      priority: 'medium',
      scheduled: false,
      status: 'sent',
      createdAt: '2025-09-04',
      sentTo: 128
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    targetRole: 'all' as 'all' | 'student' | 'lecturer' | 'admin' | 'finance' | 'hod' | 'registrar',
    priority: 'medium' as 'low' | 'medium' | 'high',
    scheduled: false,
    scheduledDate: ''
  });

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) return;

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      status: newNotification.scheduled ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      sentTo: 0
    };

    setNotifications([notification, ...notifications]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      targetRole: 'all',
      priority: 'medium',
      scheduled: false,
      scheduledDate: ''
    });
    setShowCreateForm(false);
  };

  const handleSendNotification = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id 
        ? { ...notification, status: 'sent' as const, sentTo: Math.floor(Math.random() * 300) + 50 }
        : notification
    ));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Manager</h2>
          <p className="text-gray-600">Create and manage system notifications</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Bell className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
            <CardDescription>Send notifications to users across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                    setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Role</label>
                <Select
                  value={newNotification.targetRole}
                  onValueChange={(value: 'all' | 'student' | 'lecturer' | 'admin' | 'finance' | 'hod' | 'registrar') => 
                    setNewNotification({ ...newNotification, targetRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="lecturer">Lecturers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hod">HODs</SelectItem>
                    <SelectItem value="registrar">Registrars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewNotification({ ...newNotification, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Notification message"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newNotification.scheduled}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduled: e.target.checked })}
                />
                <span className="text-sm">Schedule for later</span>
              </label>
              {newNotification.scheduled && (
                <Input
                  type="datetime-local"
                  value={newNotification.scheduledDate}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduledDate: e.target.value })}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateNotification}>
                {newNotification.scheduled ? 'Schedule' : 'Create'} Notification
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {notification.title}
                  </CardTitle>
                  <CardDescription>{notification.message}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(notification.status)}>
                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <Badge className={getTypeColor(notification.type)}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </Badge>
                  <Badge className={getPriorityColor(notification.priority)}>
                    {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {notification.targetRole === 'all' ? 'All Users' : 
                     notification.targetRole.charAt(0).toUpperCase() + notification.targetRole.slice(1)}
                  </span>
                  {notification.sentTo > 0 && (
                    <span className="text-gray-600">Sent to {notification.sentTo} users</span>
                  )}
                  <span className="text-gray-500">
                    Created: {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {notification.status === 'draft' && (
                    <Button size="sm" onClick={() => handleSendNotification(notification.id)}>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationManager;
