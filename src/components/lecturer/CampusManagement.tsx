import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { CampusAPI } from "@/integrations/api/campusAPI";
import { Campus, CreateCampusData } from "@/types/campus";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Building, Edit, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CampusManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  const [formData, setFormData] = useState<CreateCampusData>({
    name: '',
    code: '',
    description: '',
    location: '',
    address: '',
    phoneNumber: '',
    email: '',
    capacity: 500,
    facilities: [],
    departments: [],
    courses: []
  });

  const [facilitiesInput, setFacilitiesInput] = useState('');
  const [departmentsInput, setDepartmentsInput] = useState('');
  const [coursesInput, setCoursesInput] = useState('');

  useEffect(() => {
    loadCampuses();
  }, [user]);

  const loadCampuses = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await CampusAPI.getCampusesByLecturer(user.id);
      setCampuses(data);
    } catch (error) {
      console.error('Failed to load campuses:', error);
      toast({
        title: "Error",
        description: "Failed to load campuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const campusData: CreateCampusData = {
        ...formData,
        facilities: facilitiesInput.split(',').map(f => f.trim()).filter(Boolean),
        departments: departmentsInput.split(',').map(d => d.trim()).filter(Boolean),
        courses: coursesInput.split(',').map(c => c.trim()).filter(Boolean)
      };

      await CampusAPI.createCampus(user.id, campusData);
      
      toast({
        title: "Success",
        description: "Campus created successfully!",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadCampuses();
    } catch (error) {
      console.error('Failed to create campus:', error);
      toast({
        title: "Error",
        description: "Failed to create campus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;

    try {
      const updates = {
        ...formData,
        facilities: facilitiesInput.split(',').map(f => f.trim()).filter(Boolean),
        departments: departmentsInput.split(',').map(d => d.trim()).filter(Boolean),
        courses: coursesInput.split(',').map(c => c.trim()).filter(Boolean)
      };

      await CampusAPI.updateCampus(editingCampus.id, updates);
      
      toast({
        title: "Success",
        description: "Campus updated successfully!",
      });

      setIsEditDialogOpen(false);
      setEditingCampus(null);
      resetForm();
      loadCampuses();
    } catch (error) {
      console.error('Failed to update campus:', error);
      toast({
        title: "Error",
        description: "Failed to update campus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampus = async (campusId: string) => {
    if (!confirm('Are you sure you want to delete this campus?')) return;

    try {
      await CampusAPI.deleteCampus(campusId);
      
      toast({
        title: "Success",
        description: "Campus deleted successfully!",
      });

      loadCampuses();
    } catch (error) {
      console.error('Failed to delete campus:', error);
      toast({
        title: "Error",
        description: "Failed to delete campus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (campus: Campus) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      code: campus.code,
      description: campus.description,
      location: campus.location,
      address: campus.address,
      phoneNumber: campus.phoneNumber,
      email: campus.email,
      capacity: campus.capacity,
      facilities: campus.facilities,
      departments: campus.departments,
      courses: campus.courses
    });
    setFacilitiesInput(campus.facilities.join(', '));
    setDepartmentsInput(campus.departments.join(', '));
    setCoursesInput(campus.courses.join(', '));
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      location: '',
      address: '',
      phoneNumber: '',
      email: '',
      capacity: 500,
      facilities: [],
      departments: [],
      courses: []
    });
    setFacilitiesInput('');
    setDepartmentsInput('');
    setCoursesInput('');
  };

  const CampusForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campus Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Main Campus"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Campus Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="MC"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Main campus with full facilities"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Nairobi"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            placeholder="500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Education Street, Nairobi"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+254123456789"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="campus@school.ac.ke"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="facilities">Facilities (comma-separated)</Label>
        <Input
          id="facilities"
          value={facilitiesInput}
          onChange={(e) => setFacilitiesInput(e.target.value)}
          placeholder="Library, Computer Lab, Sports Complex"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departments">Departments (comma-separated)</Label>
        <Input
          id="departments"
          value={departmentsInput}
          onChange={(e) => setDepartmentsInput(e.target.value)}
          placeholder="Engineering, Business, IT"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courses">Courses (comma-separated)</Label>
        <Input
          id="courses"
          value={coursesInput}
          onChange={(e) => setCoursesInput(e.target.value)}
          placeholder="Computer Science, Business Administration"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">{isEdit ? 'Update' : 'Create'} Campus</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
              setEditingCampus(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return <div>Loading campuses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campus Management</h2>
          <p className="text-gray-600">Manage your institution's campuses and branches</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campus</DialogTitle>
              <DialogDescription>
                Add a new campus or branch for your institution
              </DialogDescription>
            </DialogHeader>
            <CampusForm onSubmit={handleCreateCampus} />
          </DialogContent>
        </Dialog>
      </div>

      {campuses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campuses created yet</h3>
            <p className="text-gray-600 mb-4">Create your first campus to start managing multiple branches</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Campus
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campuses.map((campus) => (
            <Card key={campus.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {campus.name}
                    </CardTitle>
                    <CardDescription>Code: {campus.code}</CardDescription>
                  </div>
                  <Badge variant={campus.status === 'active' ? 'default' : 'secondary'}>
                    {campus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {campus.location}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {campus.currentEnrollment} / {campus.capacity} students
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{campus.description}</p>

                {campus.facilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {campus.facilities.slice(0, 3).map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {campus.facilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{campus.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(campus)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCampus(campus.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campus</DialogTitle>
            <DialogDescription>
              Update campus information
            </DialogDescription>
          </DialogHeader>
          <CampusForm onSubmit={handleUpdateCampus} isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
