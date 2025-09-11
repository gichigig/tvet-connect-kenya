import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useGmailAuth } from "@/contexts/GmailAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Paperclip, Briefcase, Calendar, Eye, Download, Archive, Inbox, RefreshCw, Trash2, Reply, Forward, Send, Plus, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GmailMessage } from "@/integrations/gmail/gmailService";

interface InboxEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedDate: string;
  status: "unread" | "read" | "archived" | "deleted";
  hasAttachments: boolean;
  priority: "high" | "medium" | "low";
  labels?: string[];
}

export const EmailManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    isAuthenticated, 
    isLoading, 
    userProfile, 
    emails, 
    authenticate, 
    logout, 
    refreshEmails, 
    sendEmail, 
    markAsRead, 
    archiveEmail, 
    deleteEmail 
  } = useGmailAuth();
  
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | GmailMessage | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    body: ""
  });

  // Mock inbox emails for fallback when not connected to Gmail
  const [mockEmails, setMockEmails] = useState<InboxEmail[]>([]);

  // Generate mock inbox emails as fallback
  useEffect(() => {
    if (user?.email && !isAuthenticated) {
      const mockInboxEmails: InboxEmail[] = [
        {
          id: "mock-1",
          from: "dean@tvetconnect.edu",
          to: user.email,
          subject: "Department Budget Review - Q3 2025",
          body: "Dear HOD,\n\nPlease review the attached department budget for Q3 2025. Your approval is needed by the end of this week.\n\nKey points:\n- Equipment procurement budget increased by 15%\n- Research funding allocation for new projects\n- Staff development training budget\n\nPlease let me know if you have any questions.\n\nBest regards,\nDean of Academic Affairs",
          receivedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "unread",
          hasAttachments: true,
          priority: "high",
          labels: ["official", "budget"]
        },
        {
          id: "mock-2",
          from: "registrar@tvetconnect.edu",
          to: user.email,
          subject: "Student Enrollment Numbers - July 2025",
          body: "Hello,\n\nAttached are the student enrollment numbers for July 2025. Please review the data for your department and confirm the accuracy.\n\nNew enrollments: 47 students\nTransfers: 8 students\nDropouts: 3 students\n\nThe data needs to be verified before the academic board meeting next Tuesday.\n\nThanks,\nRegistrar Office",
          receivedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: "unread",
          hasAttachments: true,
          priority: "medium",
          labels: ["academic", "enrollment"]
        }
      ];
      setMockEmails(mockInboxEmails);
    }
  }, [user?.email, isAuthenticated]);

  // Convert Gmail messages to our interface format
  const convertGmailMessage = (gmailMsg: GmailMessage): InboxEmail => ({
    id: gmailMsg.id,
    from: gmailMsg.from,
    to: gmailMsg.to,
    subject: gmailMsg.subject,
    body: gmailMsg.body,
    receivedDate: gmailMsg.date,
    status: gmailMsg.isRead ? "read" : "unread",
    hasAttachments: gmailMsg.hasAttachments,
    priority: "medium", // Default priority since Gmail doesn't provide this
    labels: gmailMsg.labels
  });

  // Get current emails list (Gmail or mock)
  const getCurrentEmails = (): InboxEmail[] => {
    if (isAuthenticated && emails.length > 0) {
      return emails.map(convertGmailMessage);
    }
    return mockEmails;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-red-100 text-red-800">Unread</Badge>;
      case 'read':
        return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      case 'deleted':
        return <Badge className="bg-gray-100 text-gray-600">Deleted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const handleRefreshInbox = async () => {
    if (isAuthenticated) {
      try {
        await refreshEmails();
        toast({
          title: "Gmail Inbox Refreshed",
          description: "Your Gmail inbox has been updated with the latest emails.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to refresh Gmail inbox. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Mock Inbox Refreshed",
        description: "Connect to Gmail for real email functionality.",
      });
    }
  };

  const handleMarkAsRead = async (emailId: string) => {
    if (isAuthenticated) {
      try {
        await markAsRead(emailId);
        toast({
          title: "Email Marked as Read",
          description: "The email has been marked as read in Gmail.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to mark email as read.",
          variant: "destructive"
        });
      }
    } else {
      // Update mock emails
      setMockEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, status: "read" as const }
            : email
        )
      );
    }
  };

  const handleArchiveEmail = async (emailId: string) => {
    if (isAuthenticated) {
      try {
        await archiveEmail(emailId);
        toast({
          title: "Email Archived",
          description: "The email has been archived in Gmail.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to archive email.",
          variant: "destructive"
        });
      }
    } else {
      // Update mock emails
      setMockEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, status: "archived" as const }
            : email
        )
      );
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (isAuthenticated) {
      try {
        await deleteEmail(emailId);
        toast({
          title: "Email Deleted",
          description: "The email has been moved to trash in Gmail.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete email.",
          variant: "destructive"
        });
      }
    } else {
      // Update mock emails
      setMockEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, status: "deleted" as const }
            : email
        )
      );
    }
  };

  const handleSendEmail = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive"
      });
      return;
    }

    if (isAuthenticated) {
      try {
        await sendEmail(composeForm.to, composeForm.subject, composeForm.body);
        toast({
          title: "Email Sent",
          description: "Your email has been sent successfully via Gmail.",
        });
        setComposeForm({ to: "", subject: "", body: "" });
        setIsComposeDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send email. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Demo Mode",
        description: "Connect to Gmail to send real emails. This is a demo.",
      });
      setComposeForm({ to: "", subject: "", body: "" });
      setIsComposeDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFilteredEmails = () => {
    const currentEmails = getCurrentEmails();
    switch (activeTab) {
      case 'inbox':
        return currentEmails.filter(email => email.status !== 'deleted' && email.status !== 'archived');
      case 'unread':
        return currentEmails.filter(email => email.status === 'unread');
      case 'archived':
        return currentEmails.filter(email => email.status === 'archived');
      default:
        return currentEmails.filter(email => email.status !== 'deleted');
    }
  };

  const currentEmails = getCurrentEmails();
  const unreadCount = currentEmails.filter(email => email.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Gmail Authentication Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gmail Integration</CardTitle>
              <CardDescription>
                {isAuthenticated 
                  ? `Connected to Gmail: ${userProfile?.emailAddress || 'Loading...'}`
                  : "Connect your Gmail account to access real emails"
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isAuthenticated ? (
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect Gmail
                </Button>
              ) : (
                <Button 
                  onClick={authenticate} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Connect Gmail
                </Button>
              )}
              <Button 
                onClick={() => setIsComposeDialogOpen(true)} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Compose
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inbox Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentEmails.filter(e => e.status !== 'deleted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? userProfile?.emailAddress : user?.email}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isAuthenticated ? "Connected" : "Mock Mode"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Management Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Management</CardTitle>
            <Button 
              onClick={handleRefreshInbox}
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">
                Inbox ({currentEmails.filter(e => e.status !== 'deleted' && e.status !== 'archived').length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived ({currentEmails.filter(e => e.status === 'archived').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredEmails().map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.from}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {email.hasAttachments && <Paperclip className="h-4 w-4 text-gray-500" />}
                          {email.subject}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                      <TableCell>{formatDate(email.receivedDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedEmail(email);
                              setIsEmailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(email.id)}
                            disabled={email.status === 'read'}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleArchiveEmail(email.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEmail(email.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getFilteredEmails().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No emails found in this category.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedEmail?.from} Ã¢â‚¬Â¢ To: {selectedEmail?.to} Ã¢â‚¬Â¢ {selectedEmail ? formatDate(selectedEmail && 'receivedDate' in selectedEmail ? selectedEmail.receivedDate : (selectedEmail as GmailMessage)?.date || '') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {selectedEmail && 'status' in selectedEmail && selectedEmail?.status && getStatusBadge(selectedEmail.status)}
              {selectedEmail && 'priority' in selectedEmail && selectedEmail?.priority && getPriorityBadge(selectedEmail.priority)}
              {selectedEmail?.hasAttachments && (
                <Badge className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  Attachments
                </Badge>
              )}
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
              {selectedEmail?.body}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Reply
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Forward className="h-4 w-4" />
                Forward
              </Button>
              {selectedEmail?.hasAttachments && (
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Attachments
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              {isAuthenticated ? "Send an email via Gmail" : "Demo mode - Connect Gmail to send real emails"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <Input
                value={composeForm.to}
                onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject:</label>
              <Input
                value={composeForm.subject}
                onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Type your message here..."
                rows={8}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
