
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Users, Clock, Shield, Ban, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminDashboard = () => {
  const { getPendingUsers, getAllUsers, approveUser, rejectUser, blockUser, unblockUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const { toast } = useToast();

  const pendingUsers = getPendingUsers();
  const allUsers = getAllUsers();
  const blockedUsers = allUsers.filter(u => u.blocked);

  const handleApprove = (userId: string, userName: string) => {
    approveUser(userId);
    toast({
      title: "User Approved",
      description: `${userName} has been approved and can now access the system.`,
    });
  };

  const handleReject = (userId: string, userName: string) => {
    rejectUser(userId);
    toast({
      title: "User Rejected",
      description: `${userName}'s application has been rejected.`,
      variant: "destructive",
    });
  };

  const handleBlock = (userId: string, userName: string) => {
    blockUser(userId);
    toast({
      title: "User Blocked",
      description: `${userName} has been blocked from accessing the system.`,
      variant: "destructive",
    });
  };

  const handleUnblock = (userId: string, userName: string) => {
    unblockUser(userId);
    toast({
      title: "User Unblocked",
      description: `${userName} can now access the system again.`,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'hod': return 'bg-purple-100 text-purple-800';
      case 'registrar': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'lecturer': return 'bg-yellow-100 text-yellow-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage user approvals and system oversight</p>
        </div>
        <Shield className="w-8 h-8 text-red-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users waiting for approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter(u => u.role !== 'student' && u.role !== 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              HODs, Registrars, Finance, Lecturers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users blocked from access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingUsers.length})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All Users ({allUsers.length})
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' ? 'Pending User Approvals' : 'All Users'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'pending' 
              ? 'Review and approve new user registrations'
              : 'View all registered users in the system and manage their access'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activeTab === 'pending' ? pendingUsers : allUsers).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={user.approved ? 'default' : 'secondary'}>
                        {user.approved ? 'Approved' : 'Pending'}
                      </Badge>
                      {user.blocked && (
                        <Badge variant="destructive">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {activeTab === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.id, `${user.firstName} ${user.lastName}`)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.id, `${user.firstName} ${user.lastName}`)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {activeTab === 'all' && user.role !== 'admin' && (
                        <>
                          {!user.blocked ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBlock(user.id, `${user.firstName} ${user.lastName}`)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Block
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblock(user.id, `${user.firstName} ${user.lastName}`)}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Unblock
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(activeTab === 'pending' ? pendingUsers : allUsers).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'pending' ? 'No pending approvals' : 'No users found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
