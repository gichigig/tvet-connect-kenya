
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Paperclip, Briefcase, Calendar, Eye, Download, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedDate: string;
  type: "attachment" | "internship";
  status: "unread" | "read" | "archived";
  priority: "high" | "medium" | "low";
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

export const EmailManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      from: "student@university.edu",
      subject: "Internship Application - Summer 2024",
      body: "Dear HOD, I am writing to apply for an internship position in your department...",
      receivedDate: "2024-06-14T10:30:00",
      type: "internship",
      status: "unread",
      priority: "high",
      attachments: [
        { name: "CV.pdf", size: "2.5MB", type: "pdf" },
        { name: "CoverLetter.docx", size: "1.2MB", type: "docx" }
      ]
    },
    {
      id: "2",
      from: "jane.doe@company.com",
      subject: "Project Documentation Submission",
      body: "Please find attached the project documentation for review...",
      receivedDate: "2024-06-14T09:15:00",
      type: "attachment",
      status: "read",
      priority: "medium",
      attachments: [
        { name: "ProjectReport.pdf", size: "5.8MB", type: "pdf" },
        { name: "DataAnalysis.xlsx", size: "3.2MB", type: "xlsx" }
      ]
    },
    {
      id: "3",
      from: "hr@techcorp.com",
      subject: "Internship Partnership Proposal",
      body: "We would like to discuss a potential internship partnership...",
      receivedDate: "2024-06-13T16:45:00",
      type: "internship",
      status: "unread",
      priority: "high"
    },
    {
      id: "4",
      from: "faculty@university.edu",
      subject: "Research Paper Attachments",
      body: "Attached are the research papers for department review...",
      receivedDate: "2024-06-13T14:20:00",
      type: "attachment",
      status: "read",
      priority: "low",
      attachments: [
        { name: "ResearchPaper1.pdf", size: "4.1MB", type: "pdf" },
        { name: "ResearchPaper2.pdf", size: "3.8MB", type: "pdf" }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-red-100 text-red-800">Unread</Badge>;
      case 'read':
        return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'attachment':
        return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          Attachment
        </Badge>;
      case 'internship':
        return <Badge className="bg-indigo-100 text-indigo-800 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          Internship
        </Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const markAsRead = (emailId: string) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === emailId ? { ...email, status: 'read' as const } : email
      )
    );
    toast({
      title: "Email marked as read",
      description: "The email has been marked as read.",
    });
  };

  const archiveEmail = (emailId: string) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === emailId ? { ...email, status: 'archived' as const } : email
      )
    );
    toast({
      title: "Email archived",
      description: "The email has been archived.",
    });
  };

  const downloadAttachment = (attachmentName: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${attachmentName}...`,
    });
  };

  const filteredEmails = emails.filter(email => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return email.status === "unread";
    if (activeTab === "attachments") return email.type === "attachment";
    if (activeTab === "internships") return email.type === "internship";
    return true;
  });

  const unreadCount = emails.filter(email => email.status === "unread").length;
  const attachmentCount = emails.filter(email => email.type === "attachment").length;
  const internshipCount = emails.filter(email => email.type === "internship").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emails.length}</div>
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
            <CardTitle className="text-sm font-medium">Attachments</CardTitle>
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{attachmentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Emails</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{internshipCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            All ({emails.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Attachments ({attachmentCount})
          </TabsTrigger>
          <TabsTrigger value="internships" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Internships ({internshipCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Emails</CardTitle>
              <CardDescription>
                Manage emails related to attachments and internships in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id} className={email.status === 'unread' ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div className="font-medium">{email.from}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate font-medium">{email.subject}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{email.body}</div>
                      </TableCell>
                      <TableCell>{getTypeBadge(email.type)}</TableCell>
                      <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(email.receivedDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(email.receivedDate).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {email.attachments ? (
                          <div className="space-y-1">
                            {email.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-24">{attachment.name}</span>
                                <span className="text-xs text-gray-500">({attachment.size})</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => downloadAttachment(attachment.name)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {email.status === 'unread' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(email.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Read
                            </Button>
                          )}
                          {email.status !== 'archived' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => archiveEmail(email.id)}
                              className="flex items-center gap-1"
                            >
                              <Archive className="w-3 h-3" />
                              Archive
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
