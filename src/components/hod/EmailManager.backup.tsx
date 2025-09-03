import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Paperclip, Briefcase, Calendar, Eye, Download, Archive, Inbox, RefreshCw, Trash2, Reply, Forward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock inbox emails - In production, this would fetch from your email service
  const [inboxEmails, setInboxEmails] = useState<InboxEmail[]>([]);

  // Generate mock inbox emails based on user's email
  useEffect(() => {
    if (user?.email) {
      const mockInboxEmails: InboxEmail[] = [
        {
          id: "inbox-1",
          from: "dean@tvetconnect.edu",
          to: user.email,
          subject: "Department Budget Review - Q3 2025",
          body: "Dear HOD,\n\nPlease review the attached department budget for Q3 2025. Your approval is needed by the end of this week.\n\nKey points:\n- Equipment procurement budget increased by 15%\n- Research funding allocation for new projects\n- Staff development training budget\n\nPlease let me know if you have any questions.\n\nBest regards,\nDean of Academic Affairs",
          receivedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          status: "unread",
          hasAttachments: true,
          priority: "high",
          labels: ["official", "budget"]
        },
        {
          id: "inbox-2",
          from: "registrar@tvetconnect.edu",
          to: user.email,
          subject: "Student Enrollment Numbers - July 2025",
          body: "Hello,\n\nAttached are the student enrollment numbers for July 2025. Please review the data for your department and confirm the accuracy.\n\nNew enrollments: 47 students\nTransfers: 8 students\nDropouts: 3 students\n\nThe data needs to be verified before the academic board meeting next Tuesday.\n\nThanks,\nRegistrar Office",
          receivedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          status: "unread",
          hasAttachments: true,
          priority: "medium",
          labels: ["academic", "enrollment"]
        },
        {
          id: "inbox-3",
          from: "student.leader@tvetconnect.edu",
          to: user.email,
          subject: "Request for Meeting - Student Concerns",
          body: "Dear HOD,\n\nThe student council would like to request a meeting to discuss some concerns raised by students in our department.\n\nTopics to discuss:\n1. Library resource availability\n2. Lab equipment maintenance\n3. Examination schedule conflicts\n4. Course material updates\n\nWould you be available for a meeting this week? We are flexible with timing.\n\nThank you for your time.\n\nBest regards,\nStudent Council President",
          receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          status: "read",
          hasAttachments: false,
          priority: "medium",
          labels: ["student-affairs", "meeting"]
        },
        {
          id: "inbox-4",
          from: "industry.partner@techcorp.com",
          to: user.email,
          subject: "Internship Partnership Proposal 2025",
          body: "Good morning,\n\nI hope this email finds you well. TechCorp is interested in establishing an internship partnership with your department for 2025.\n\nWe can offer:\n- 20 internship positions for final year students\n- Mentorship programs\n- Potential job opportunities post-graduation\n- Equipment sponsorship for your labs\n\nI would love to schedule a call to discuss this opportunity further. Please let me know your availability.\n\nBest regards,\nSarah Johnson\nHR Director, TechCorp",
          receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          status: "read",
          hasAttachments: true,
          priority: "high",
          labels: ["industry", "partnership"]
        },
        {
          id: "inbox-5",
          from: "lecturer.smith@tvetconnect.edu",
          to: user.email,
          subject: "Equipment Request - Computer Lab Upgrade",
          body: "Dear HOD,\n\nI would like to submit a request for computer lab equipment upgrade. The current machines are becoming outdated and affecting the quality of our programming courses.\n\nRequested items:\n- 25 new desktop computers\n- Updated software licenses\n- Network infrastructure upgrade\n- Additional monitors for coding workshops\n\nEstimated budget: $45,000\n\nPlease let me know if you need additional information or justification for this request.\n\nThank you,\nDr. Smith\nSenior Lecturer",
          receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          status: "archived",
          hasAttachments: true,
          priority: "medium",
          labels: ["equipment", "budget-request"]
        }
      ];
      setInboxEmails(mockInboxEmails);
    }
  }, [user?.email]);

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
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Inbox Refreshed",
        description: "Your inbox has been updated with the latest emails.",
      });
      setIsRefreshing(false);
    }, 1500);
  };

  const handleMarkAsRead = (emailId: string) => {
    setInboxEmails(prev => 
      prev.map(email => 
        email.id === emailId 
          ? { ...email, status: "read" as const }
          : email
      )
    );
    toast({
      title: "Email marked as read",
      description: "Email status updated successfully.",
    });
  };

  const handleArchiveEmail = (emailId: string) => {
    setInboxEmails(prev => 
      prev.map(email => 
        email.id === emailId 
          ? { ...email, status: "archived" as const }
          : email
      )
    );
    toast({
      title: "Email archived",
      description: "Email has been moved to archive.",
    });
  };

  const handleDeleteEmail = (emailId: string) => {
    setInboxEmails(prev => 
      prev.map(email => 
        email.id === emailId 
          ? { ...email, status: "deleted" as const }
          : email
      )
    );
    toast({
      title: "Email deleted",
      description: "Email has been moved to trash.",
    });
  };

  const openEmailDialog = (email: InboxEmail) => {
    setSelectedEmail(email);
    setIsEmailDialogOpen(true);
    // Mark as read when opening
    if (email.status === 'unread') {
      handleMarkAsRead(email.id);
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

  const getFilteredInboxEmails = () => {
    switch (activeTab) {
      case 'inbox':
        return inboxEmails.filter(email => email.status !== 'deleted' && email.status !== 'archived');
      case 'unread':
        return inboxEmails.filter(email => email.status === 'unread');
      case 'archived':
        return inboxEmails.filter(email => email.status === 'archived');
      default:
        return inboxEmails.filter(email => email.status !== 'deleted');
    }
  };

  const unreadCount = inboxEmails.filter(email => email.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Inbox Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inboxEmails.filter(e => e.status !== 'deleted').length}</div>
            <p className="text-xs text-muted-foreground">
              {user?.email}
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
            <CardTitle className="text-sm font-medium">With Attachments</CardTitle>
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{inboxEmails.filter(e => e.hasAttachments).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inboxEmails.filter(e => e.priority === 'high' && e.status !== 'deleted').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Inbox</CardTitle>
              <CardDescription>Manage emails received to your address: {user?.email}</CardDescription>
            </div>
            <Button onClick={handleRefreshInbox} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-800 text-xs">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredInboxEmails().map((email) => (
                      <TableRow 
                        key={email.id} 
                        className={`cursor-pointer hover:bg-gray-50 ${email.status === 'unread' ? 'bg-blue-50' : ''}`}
                        onClick={() => openEmailDialog(email)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {email.status === 'unread' && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                            {email.from}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {email.hasAttachments && <Paperclip className="h-4 w-4 text-gray-400" />}
                            <span className={email.status === 'unread' ? 'font-semibold' : ''}>
                              {email.subject}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(email.receivedDate)}
                        </TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              openEmailDialog(email);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveEmail(email.id);
                            }}>
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmail(email.id);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getFilteredInboxEmails().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emails in your inbox</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredInboxEmails().map((email) => (
                      <TableRow 
                        key={email.id} 
                        className="cursor-pointer hover:bg-gray-50 bg-blue-50"
                        onClick={() => openEmailDialog(email)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            {email.from}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {email.hasAttachments && <Paperclip className="h-4 w-4 text-gray-400" />}
                            <span className="font-semibold">{email.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(email.receivedDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(email.id);
                            }}>
                              Mark as Read
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getFilteredInboxEmails().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No unread emails</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date Archived</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredInboxEmails().map((email) => (
                      <TableRow 
                        key={email.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => openEmailDialog(email)}
                      >
                        <TableCell className="font-medium">{email.from}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {email.hasAttachments && <Paperclip className="h-4 w-4 text-gray-400" />}
                            {email.subject}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(email.receivedDate)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setInboxEmails(prev => 
                              prev.map(e => 
                                e.id === email.id 
                                  ? { ...e, status: "read" as const }
                                  : e
                              )
                            );
                          }}>
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getFilteredInboxEmails().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No archived emails</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedEmail?.subject}</span>
              <div className="flex items-center gap-2">
                {selectedEmail?.priority && getPriorityBadge(selectedEmail.priority)}
                {selectedEmail?.hasAttachments && (
                  <Badge variant="outline">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Attachments
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center justify-between text-sm">
                <span>From: {selectedEmail?.from}</span>
                <span>{selectedEmail && formatDate(selectedEmail.receivedDate)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {selectedEmail.body}
                </pre>
              </div>
              
              {selectedEmail.hasAttachments && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Document.pdf</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (selectedEmail) {
                      handleArchiveEmail(selectedEmail.id);
                      setIsEmailDialogOpen(false);
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
