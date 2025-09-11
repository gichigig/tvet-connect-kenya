import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Users, Clock, Shield, Ban, Unlock, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createAdmin, AdminData } from "@/integrations/supabase/users";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

// Predefined departments for staff
const departments = [
  'Computer Science',
  'Engineering', 
  'Business Studies',
  'Health Sciences',
  'Agriculture',
  'Hospitality',
  'Automotive',
  'Construction',
  'Fashion & Design',
  'Arts & Media'
];

function AdminDashboard() {
  // Temporary mock for courses
  const courses = [
    { id: '1', name: 'Computer Science', department: 'Computer Science', level: 'diploma' },
    { id: '2', name: 'Engineering', department: 'Engineering', level: 'certificate' },
    { id: '3', name: 'Business Studies', department: 'Business Studies', level: 'diploma' },
  ];
  
  // For undo/restore
  const lastDeletedUser = useRef<any>(null);
  const updateUserInBackend = async (user: any) => {
    return Promise.resolve();
  };

  // Delete (soft delete)
  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, deleted: true } : u));
    const deletedUser = usersList.find(u => u.id === userId);
    lastDeletedUser.current = deletedUser;
    try {
      await updateUserInBackend({ ...deletedUser, deleted: true });
      toast({ title: "User Deleted", description: "User marked as deleted. You can undo." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete user in backend.", variant: "destructive" });
    }
  };

  // Undo delete
  const handleUndoDeleteUser = async () => {
    if (!lastDeletedUser.current) return;
    setUsers(prev => prev.map(u => u.id === lastDeletedUser.current.id ? { ...u, deleted: false } : u));
    try {
      await updateUserInBackend({ ...lastDeletedUser.current, deleted: false });
      toast({ title: "Undo Delete", description: "User restored." });
      lastDeletedUser.current = null;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to restore user in backend.", variant: "destructive" });
    }
  };

  // Restore user
  const handleRestoreUser = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, deleted: false } : u));
    const restoredUser = usersList.find(u => u.id === userId);
    try {
      await updateUserInBackend({ ...restoredUser, deleted: false });
      toast({ title: "User Restored", description: "User has been restored." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to restore user in backend.", variant: "destructive" });
    }
  };

  // State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { getAllUsers, approveUser, users, user, logout, updateProfilePicture } = useAuth();
  
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsersList(fetchedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsersList(users || []);
      }
    };
    loadUsers();
  }, [getAllUsers, users]);
  
  // Mock implementations for missing methods
  const getPendingUsers = () => usersList.filter(u => !u.approved);
  const rejectUser = async (userId: string) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
  };
  const blockUser = async (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, blocked: true } : u));
  };
  const unblockUser = async (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, blocked: false } : u));
  };
  const setUsers = setUsersList;
  const changePassword = async (password: string) => {
    console.log('Password change not implemented');
  };
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'notifications'>('pending');
  const { toast } = useToast();

  // State for create user form
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState("admin");
  const [isCreating, setIsCreating] = useState(false);
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserDepartments, setNewUserDepartments] = useState<string[]>([]);
  const [newUserCourses, setNewUserCourses] = useState<string[]>([]);
  const [newUserUnits, setNewUserUnits] = useState<string[]>([]);

  // Course type filter for lecturer
  const [courseType, setCourseType] = useState<string>("");

  // Get course names and organize by department
  const courseNames = courses.map(course => course.name);
  
  // Map department to courses
  const departmentCourses = departments.reduce((acc, dep) => {
    acc[dep] = courses
      .filter(c => c.department === dep && (!courseType || c.level === courseType))
      .map(c => c.name);
    return acc;
  }, {} as Record<string, string[]>);

  // Filtered courses for selected departments and type
  const filteredCourses = Array.from(
    new Set(
      newUserDepartments.flatMap(dep => departmentCourses[dep] || [])
    )
  );

  const pendingUsers = getPendingUsers();
  const allUsers = usersList;
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    // Check if username already exists
    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUserUsername)
      .single();
    
    if (existingUser) {
      toast({ title: "Username Exists", description: "A user with this username already exists.", variant: "destructive" });
      setIsCreating(false);
      return;
    }

    // Check if email already exists
    if (usersList.some(u => u.email === newUserEmail)) {
      toast({ title: "Email Exists", description: "A user with this email already exists.", variant: "destructive" });
      setIsCreating(false);
      return;
    }
    try {
      // Create admin user using Supabase
      const adminData: AdminData = {
        username: newUserUsername,
        email: newUserEmail,
        firstName: newUserFirstName,
        lastName: newUserLastName,
        employeeId: newUserUsername,
        role: newUserRole as AdminData['role'],
        department: newUserRole === "hod" ? newUserDepartment : undefined
      };
      
      await createAdmin(adminData, newUserPassword);
      setUsers(prev => [...prev, { ...adminData, approved: true, blocked: false }]);
      toast({ title: "User Created", description: `${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)} ${newUserUsername} created and saved to database.` });
      setShowAdminForm(false);
      setNewUserUsername("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserRole("admin");
      setNewUserDepartment("");
      setNewUserDepartments([]);
      setNewUserCourses([]);
      setNewUserUnits([]);
    } catch (err: any) {
      toast({ title: "Error Creating User", description: err.message || "Failed to create user in database.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Admin Dashboard"
        subtitle="Manage user approvals and system oversight"
        notificationCount={pendingUsers.length}
        additionalActions={
          <Button onClick={() => setShowAdminForm(v => !v)} variant="outline">
            {showAdminForm ? "Cancel" : "Create Admin"}
          </Button>
        }
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
               <button 
                 className="absolute top-2 right-2 text-gray-500" 
                 onClick={() => setShowProfileModal(false)}
               >
                 &times;
               </button>
              <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
              <div className="mb-2">Name: <span className="font-semibold">{user?.firstName} {user?.lastName}</span></div>
              <div className="mb-2">Email: <span className="font-semibold">{user?.email}</span></div>
            </div>
          </div>
        )}

        {/* Picture Modal */}
        {showPictureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowPictureModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Upload Profile Picture</h2>
              <input type="file" className="mb-4" accept="image/*" onChange={e => setProfilePictureFile(e.target.files?.[0] || null)} />
              <Button
                onClick={async () => {
                  if (profilePictureFile && updateProfilePicture) {
                    await updateProfilePicture(profilePictureFile);
                  }
                  setShowPictureModal(false);
                  setProfilePictureFile(null);
                }}
                className="w-full"
                disabled={!profilePictureFile}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowPasswordModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <input
                type="password"
                className="border p-2 rounded w-full mb-2"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <Button
                onClick={async () => {
                  if (newPassword && changePassword) {
                    await changePassword(newPassword);
                  }
                  setShowPasswordModal(false);
                  setNewPassword("");
                }}
                className="w-full"
                disabled={!newPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        )}

        {/* Create User Form */}
        {showAdminForm && (
          <Card className="mb-6 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Create User</CardTitle>
              <CardDescription>Fill in details to create a new user. The password can be changed later.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    className="border p-2 rounded w-1/2"
                    type="text"
                    placeholder="First Name"
                    value={newUserFirstName}
                    onChange={e => setNewUserFirstName(e.target.value)}
                    required
                  />
                  <input
                    className="border p-2 rounded w-1/2"
                    type="text"
                    placeholder="Last Name"
                    value={newUserLastName}
                    onChange={e => setNewUserLastName(e.target.value)}
                    required
                  />
                </div>
                <input
                  className="border p-2 rounded w-full"
                  type="text"
                  placeholder="Username"
                  value={newUserUsername}
                  onChange={e => setNewUserUsername(e.target.value)}
                  required
                />
                <input
                  className="border p-2 rounded w-full"
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                />
                <input
                  className="border p-2 rounded w-full"
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  required
                />
                <select
                  className="border p-2 rounded w-full"
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="hod">Head of Department</option>
                  <option value="registrar">Registrar</option>
                  <option value="finance">Finance</option>
                  <option value="lecturer">Lecturer</option>
                </select>
                
                {newUserRole === "hod" && (
                  <select
                    className="border p-2 rounded w-full"
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                )}
                
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : `Create ${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending Approvals ({pendingUsers.length})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            All Users ({allUsers.length})
          </Button>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === 'pending' ? (
                <>
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pending User Approvals
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-blue-600" />
                  All System Users
                </>
              )}
            </CardTitle>
            <CardDescription>
              {activeTab === 'pending' 
                ? 'Review and approve new user registrations' 
                : 'Manage all users in the system'
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === 'pending' ? pendingUsers : allUsers).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!user.approved ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Pending
                        </Badge>
                      ) : user.blocked ? (
                        <Badge variant="destructive">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {!user.approved && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user.id, `${user.firstName} ${user.lastName}`)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(user.id, `${user.firstName} ${user.lastName}`)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {user.approved && (
                          user.blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblock(user.id, `${user.firstName} ${user.lastName}`)}
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBlock(user.id, `${user.firstName} ${user.lastName}`)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )
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
    </div>
  );
}

const AdminDashboardWithProvider = () => <AdminDashboard />;

export default AdminDashboardWithProvider;