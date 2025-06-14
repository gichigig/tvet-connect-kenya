
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Send, Mail, MessageSquare, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ResultsNotification = () => {
  const { examResults, sendResultsNotification } = useAuth();
  const { toast } = useToast();
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [sendToGuardians, setSendToGuardians] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredResults = examResults.filter(result =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => [...prev, resultId]);
    } else {
      setSelectedResults(prev => prev.filter(id => id !== resultId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(filteredResults.map(result => result.id));
    } else {
      setSelectedResults([]);
    }
  };

  const handleSendNotifications = async () => {
    if (selectedResults.length === 0) {
      toast({
        title: "No Results Selected",
        description: "Please select at least one result to send notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendResultsNotification(selectedResults, sendToGuardians);
      
      toast({
        title: "Notifications Sent Successfully",
        description: `Results sent to ${selectedResults.length} student${selectedResults.length > 1 ? 's' : ''}${sendToGuardians ? ' and their guardians' : ''}.`,
      });
      
      setSelectedResults([]);
    } catch (error) {
      toast({
        title: "Failed to Send Notifications",
        description: "There was an error sending the notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'pass' 
      ? <Badge className="bg-green-100 text-green-800">Pass</Badge>
      : <Badge className="bg-red-100 text-red-800">Fail</Badge>;
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    
    return <Badge className={gradeColors[grade] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results Notification</h2>
          <p className="text-gray-600">Send exam results to students and guardians via email and SMS</p>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">Email & SMS</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-blue-600">{examResults.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-orange-600">{selectedResults.length}</p>
              </div>
              <User className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {examResults.length > 0 ? Math.round((examResults.filter(r => r.status === 'pass').length / examResults.length) * 100) : 0}%
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Pass</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
          <CardDescription>
            Select results to send notifications to students and guardians
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, unit code, or unit name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-to-guardians"
                    checked={sendToGuardians}
                    onCheckedChange={setSendToGuardians}
                  />
                  <Label htmlFor="send-to-guardians">Send to Guardians</Label>
                </div>
                <Button
                  onClick={handleSendNotifications}
                  disabled={selectedResults.length === 0 || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Sending..." : `Send Notifications (${selectedResults.length})`}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedResults.includes(result.id)}
                      onCheckedChange={(checked) => handleSelectResult(result.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{result.studentName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.unitCode}</div>
                      <div className="text-sm text-gray-500">{result.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.examType === 'exam' ? 'default' : 'outline'}>
                      {result.examType.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{result.score}</span>
                    <span className="text-gray-500">/{result.maxScore}</span>
                  </TableCell>
                  <TableCell>{getGradeBadge(result.grade)}</TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell>{result.examDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {examResults.length === 0 
                ? "No exam results available"
                : "No results found matching your search"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
