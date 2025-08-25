import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Building, MapPin } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment?: string;
  faculty: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

interface InstitutionBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

export const DepartmentManagement: React.FC = () => {
  const { toast } = useToast();
  
  // Mock data - in real app, this would come from context/database
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science and Information Technology',
      headOfDepartment: 'Dr. John Mwangi',
      faculty: 'Engineering and Technology',
      status: 'active',
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Business Studies',
      code: 'BS',
      description: 'Department of Business and Management Studies',
      headOfDepartment: 'Prof. Mary Wanjiku',
      faculty: 'Business and Economics',
      status: 'active',
      createdDate: '2024-01-15'
    }
  ]);

  const [branches, setBranches] = useState<InstitutionBranch[]>([
    {
      id: '1',
      name: 'Main Campus',
      code: 'MAIN',
      address: 'University Way, Nairobi',
      city: 'Nairobi',
      region: 'Central',
      phone: '+254-20-1234567',
      email: 'main@tvet.ac.ke',
      status: 'active',
      createdDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Mombasa Branch',
      code: 'MSA',
      address: 'Moi Avenue, Mombasa',
      city: 'Mombasa',
      region: 'Coast',
      phone: '+254-41-1234567',
      email: 'mombasa@tvet.ac.ke',
      status: 'active',
      createdDate: '2024-02-01'
    }
  ]);

  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'departments' | 'branches'>('departments');

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    faculty: ''
  });

  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: ''
  });

  const handleCreateDepartment = () => {
    if (!newDepartment.name || !newDepartment.code || !newDepartment.faculty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const department: Department = {
      id: Date.now().toString(),
      ...newDepartment,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setDepartments(prev => [...prev, department]);
    setNewDepartment({
      name: '',
      code: '',
      description: '',
      headOfDepartment: '',
      faculty: ''
    });
    setIsCreateDeptOpen(false);

    toast({
      title: "Department Created",
      description: `${department.name} has been created successfully.`
    });
  };

  const handleCreateBranch = () => {
    if (!newBranch.name || !newBranch.code || !newBranch.address || !newBranch.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const branch: InstitutionBranch = {
      id: Date.now().toString(),
      ...newBranch,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setBranches(prev => [...prev, branch]);
    setNewBranch({
      name: '',
      code: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      email: ''
    });
    setIsCreateBranchOpen(false);

    toast({
      title: "Branch Created",
      description: `${branch.name} has been created successfully.`
    });
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
    toast({
      title: "Department Deleted",
      description: "Department has been removed successfully."
    });
  };

  const handleDeleteBranch = (id: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== id));
    toast({
      title: "Branch Deleted",
      description: "Branch has been removed successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Institution Management</h2>
          <p className="text-gray-600">Manage departments and institution branches</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-4 border-b">
        <Button
          variant={activeTab === 'departments' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('departments')}
          className="flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          Departments
        </Button>
        <Button
          variant={activeTab === 'branches' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('branches')}
          className="flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Institution Branches
        </Button>
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Departments ({departments.length})</h3>
            
            <Dialog open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                    Add a new department to the institution
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deptName">Department Name *</Label>
                      <Input
                        id="deptName"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deptCode">Department Code *</Label>
                      <Input
                        id="deptCode"
                        value={newDepartment.code}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., CS"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faculty">Faculty *</Label>
                      <Input
                        id="faculty"
                        value={newDepartment.faculty}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, faculty: e.target.value }))}
                        placeholder="e.g., Engineering and Technology"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hod">Head of Department</Label>
                      <Input
                        id="hod"
                        value={newDepartment.headOfDepartment}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, headOfDepartment: e.target.value }))}
                        placeholder="e.g., Dr. John Mwangi"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deptDesc">Description</Label>
                    <Textarea
                      id="deptDesc"
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the department"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDeptOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDepartment}>
                    Create Department
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-gray-500">Code: {dept.code}</div>
                          {dept.description && (
                            <div className="text-xs text-gray-400 mt-1">{dept.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{dept.faculty}</TableCell>
                      <TableCell>{dept.headOfDepartment || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Institution Branches ({branches.length})</h3>
            
            <Dialog open={isCreateBranchOpen} onOpenChange={setIsCreateBranchOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Institution Branch</DialogTitle>
                  <DialogDescription>
                    Add a new branch location for the institution
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <Input
                        id="branchName"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Mombasa Branch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchCode">Branch Code *</Label>
                      <Input
                        id="branchCode"
                        value={newBranch.code}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., MSA"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="branchAddress">Address *</Label>
                    <Input
                      id="branchAddress"
                      value={newBranch.address}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branchCity">City *</Label>
                      <Input
                        id="branchCity"
                        value={newBranch.city}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Mombasa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchRegion">Region</Label>
                      <Input
                        id="branchRegion"
                        value={newBranch.region}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, region: e.target.value }))}
                        placeholder="e.g., Coast"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branchPhone">Phone</Label>
                      <Input
                        id="branchPhone"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+254-XX-XXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branchEmail">Email</Label>
                      <Input
                        id="branchEmail"
                        type="email"
                        value={newBranch.email}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="branch@tvet.ac.ke"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateBranchOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBranch}>
                    Create Branch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-gray-500">Code: {branch.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.city}</div>
                          <div className="text-sm text-gray-500">{branch.address}</div>
                          {branch.region && (
                            <div className="text-xs text-gray-400">{branch.region} Region</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {branch.phone && <div className="text-sm">{branch.phone}</div>}
                          {branch.email && <div className="text-sm text-gray-500">{branch.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
