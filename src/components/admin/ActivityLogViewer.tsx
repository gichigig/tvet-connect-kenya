
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Search, User, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ActivityLogViewer = () => {
  const { getActivityLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const allLogs = getActivityLogs();

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetStudentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || log.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentBadge = (department: string) => {
    const colors = {
      finance: 'bg-green-100 text-green-800',
      admin: 'bg-blue-100 text-blue-800',
      registrar: 'bg-purple-100 text-purple-800',
      hod: 'bg-orange-100 text-orange-800',
      lecturer: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {department.toUpperCase()}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            System Activity Logs
          </CardTitle>
          <CardDescription>
            Monitor all system activities across departments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity logs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>{getDepartmentBadge(log.department)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.targetStudentName || '-'}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm">{log.details}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
