
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Users, Clock, Shield, Ban, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { allDepartments, allCourses } from "@/data/zetechCourses";

function AdminDashboard() {
  // For undo/restore
  const lastDeletedUser = useRef<any>(null);
  // Backend helpers for user delete/restore
  // Backend update stub (replace with real backend call if available)
  const updateUserInBackend = async (user: any) => {
    // TODO: Implement backend update logic here (e.g., call Firebase or your API)
    return Promise.resolve();
  };

  // Delete (soft delete)
  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, deleted: true } : u));
    const deletedUser = users.find(u => u.id === userId);
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

  // Restore (for any deleted user)
  const handleRestoreUser = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, deleted: false } : u));
    const restoredUser = users.find(u => u.id === userId);
    try {
      await updateUserInBackend({ ...restoredUser, deleted: false });
      toast({ title: "User Restored", description: "User has been restored." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to restore user in backend.", variant: "destructive" });
    }
  };
  // Profile menu/modal state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { getPendingUsers, getAllUsers, approveUser, rejectUser, blockUser, unblockUser, users, setUsers, user, logout, updateProfilePicture, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const { toast } = useToast();

  // State for create user form
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState("admin");
  const [isCreating, setIsCreating] = useState(false);
  // For HOD and Lecturer
  const [newUserDepartment, setNewUserDepartment] = useState("");
  // For Lecturer multi-select
  const [newUserDepartments, setNewUserDepartments] = useState<string[]>([]);
  const [newUserCourses, setNewUserCourses] = useState<string[]>([]);
  const [newUserUnits, setNewUserUnits] = useState<string[]>([]);

  // Course type filter for lecturer
  const [courseType, setCourseType] = useState<string>("");

  // If allCourses is an array of objects: [{ name, department, type }]
  // If not, generate objects by inferring type from course name (simple keyword match)
  let allCoursesObj: { name: string; department: string; type: string }[] = [];
  if (Array.isArray(allCourses) && typeof allCourses[0] === 'object') {
    allCoursesObj = (allCourses as string[]).map((name: string) => {
      let type = '';
      let lower = name.toLowerCase();
      if (lower.includes('bachelor')) type = 'bachelor';
      else if (lower.includes('diploma')) type = 'diploma';
      else if (lower.includes('certificate')) type = 'certificate';
      // Try to infer department by matching department name in course name
      let department = allDepartments.find(dep => name.toLowerCase().includes(dep.toLowerCase().split(' ')[0])) || '';
      return { name, department, type };
    });
  } else {
    // Try to infer type and department from course name (improve as needed)
    allCoursesObj = allCourses.map((name: string) => {
      let type = '';
      let lower = name.toLowerCase();
      if (lower.includes('bachelor')) type = 'bachelor';
      else if (lower.includes('diploma')) type = 'diploma';
      else if (lower.includes('certificate')) type = 'certificate';
      // Try to infer department by matching department name in course name
      let department = allDepartments.find(dep => name.toLowerCase().includes(dep.toLowerCase().split(' ')[0])) || '';
      return { name, department, type };
    });
  }

  // Map department to courses (filtered by type if selected)
  const departmentCourses = allDepartments.reduce((acc, dep) => {
    acc[dep] = allCoursesObj.filter(
      c => (!courseType || c.type === courseType) && (c.department === dep || c.department === '' || dep === '')
    ).map(c => c.name);
    return acc;
  }, {} as Record<string, string[]>);

  // Filtered courses for selected departments and type
  const filteredCourses = Array.from(
    new Set(
      newUserDepartments.flatMap(dep => departmentCourses[dep] || [])
    )
  );

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

  // Allow creation of all roles, with department for HOD, multi-select for lecturer
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    if (users.some(u => u.email === newUserEmail)) {
      toast({ title: "Email Exists", description: "A user with this email already exists.", variant: "destructive" });
      setIsCreating(false);
      return;
    }
    try {
      // Dynamically import to avoid SSR issues
      const { saveAdminToFirebase } = await import("@/integrations/firebase/admin");
      let userData: any = {
        email: newUserEmail,
        firstName: newUserFirstName,
        lastName: newUserLastName,
        password: newUserPassword,
        role: newUserRole
      };
      if (newUserRole === "hod") {
        userData.department = newUserDepartment;
      }
      if (newUserRole === "lecturer") {
        userData.departments = newUserDepartments;
        userData.courses = newUserCourses;
        userData.units = newUserUnits;
      }
      // Add more fields as needed for other roles
      await saveAdminToFirebase(userData);
      setUsers(prev => [...prev, { ...userData, approved: true, blocked: false }]);
      toast({ title: "User Created", description: `${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)} ${newUserEmail} created and saved to database.` });
      setShowAdminForm(false);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage user approvals and system oversight</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAdminForm(v => !v)} variant="outline" className="w-full sm:w-auto">
            {showAdminForm ? "Cancel" : "Create Admin"}
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              onClick={() => setShowProfileMenu(v => !v)}
            >
              <span className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center text-lg font-bold">
                {user?.firstName?.[0] || 'A'}
              </span>
              <span className="hidden sm:inline font-semibold text-gray-800">{user?.firstName || 'Profile'}</span>
            </Button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}>Profile Settings</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenu(false); setShowPictureModal(true); }}>Upload Picture</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenu(false); setShowPasswordModal(true); }}>Change Password</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => { setShowProfileMenu(false); logout(); }}>Log Out</button>
              </div>
            )}
          </div>
          <Shield className="w-8 h-8 text-red-600 hidden sm:inline-block" />
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowProfileModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="mb-2">Name: <span className="font-semibold">{user?.firstName} {user?.lastName}</span></div>
            <div className="mb-2">Email: <span className="font-semibold">{user?.email}</span></div>
            {/* Add more profile fields as needed */}
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
                  await changePassword("", newPassword);
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
                required
              >
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="registrar">Registrar</option>
                <option value="finance">Finance</option>
                <option value="lecturer">Lecturer</option>
              </select>
              {/* Department for HOD */}
              {newUserRole === "hod" && (
                <select
                  className="border p-2 rounded w-full"
                  value={newUserDepartment}
                  onChange={e => setNewUserDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {allDepartments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              )}
              {/* Multi-select for Lecturer with checkboxes and course filtering by type */}
              {newUserRole === "lecturer" && (
                <>
                  <label className="block text-xs font-medium mb-1">Departments (select one or more)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {allDepartments.map(dep => (
                      <label key={dep} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newUserDepartments.includes(dep)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewUserDepartments([...newUserDepartments, dep]);
                            } else {
                              setNewUserDepartments(newUserDepartments.filter(d => d !== dep));
                              // Remove courses from deselected department
                              const coursesToRemove = departmentCourses[dep] || [];
                              setNewUserCourses(prev => prev.filter(c => !coursesToRemove.includes(c)));
                            }
                          }}
                        />
                        <span>{dep}</span>
                      </label>
                    ))}
                  </div>
                  <label className="block text-xs font-medium mb-1 mt-2">Course Type</label>
                  <select
                    className="border p-2 rounded w-full mb-2"
                    value={courseType}
                    onChange={e => {
                      setCourseType(e.target.value);
                      setNewUserCourses([]); // reset courses when type changes
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                  </select>
                  <label className="block text-xs font-medium mb-1 mt-2">Courses (filtered by department/type, select one or more)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {filteredCourses.length === 0 && <span className="text-gray-400">Select department(s) and type first</span>}
                    {filteredCourses.map(course => (
                      <label key={course} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newUserCourses.includes(course)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewUserCourses([...newUserCourses, course]);
                            } else {
                              setNewUserCourses(newUserCourses.filter(c => c !== course));
                            }
                          }}
                        />
                        <span>{course}</span>
                      </label>
                    ))}
                  </div>
                  <label className="block text-xs font-medium mb-1 mt-2">Units (multi-select, type to add)</label>
                  <input
                    className="border p-2 rounded w-full"
                    type="text"
                    placeholder="Enter units separated by commas"
                    value={newUserUnits.join(", ")}
                    onChange={e => setNewUserUnits(e.target.value.split(",").map(u => u.trim()).filter(Boolean))}
                  />
                </>
              )}
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Department/Course</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activeTab === 'pending' ? pendingUsers : allUsers).map((user) => {
                // Add 'deleted' property for type safety
                const userWithDeleted = user as typeof user & { deleted?: boolean };
                return (
                  <TableRow key={user.id} className={userWithDeleted.deleted ? 'opacity-50 bg-red-50' : ''}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'student' 
                      ? (user.course || 'N/A')
                      : (user.department || 'N/A')
                    }
                  </TableCell>
                  <TableCell>
                    {user.role === 'student' && user.admissionNumber ? (
                      <Badge variant="outline">{user.admissionNumber}</Badge>
                    ) : 'N/A'}
                  </TableCell>
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
                          {!userWithDeleted.deleted ? (
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleRestoreUser(user.id)}>Restore</Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
          {/* Undo delete button (shows if there is a last deleted user) */}
          {lastDeletedUser.current && (
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={handleUndoDeleteUser}>Undo Last Delete</Button>
            </div>
          )}
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
}
export default AdminDashboard;