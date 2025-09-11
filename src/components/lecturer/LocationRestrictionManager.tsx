import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface LocationRestriction {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  unitId: string;
  contentType: 'assignment' | 'exam' | 'online-class' | 'quiz' | 'all';
  isActive: boolean;
  createdAt: Date;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export const LocationRestrictionManager = () => {
  const { toast } = useToast();
  const { user, createdUnits } = useAuth();
  const [restrictions, setRestrictions] = useState<LocationRestriction[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [editingRestriction, setEditingRestriction] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    radius: [100], // Default 100 meters
    unitId: '',
    contentType: 'all' as 'assignment' | 'exam' | 'online-class' | 'quiz' | 'all',
    isActive: true
  });

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setIsGettingLocation(false);
        toast({
          title: "Location Found",
          description: `Current location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.latitude || !formData.longitude || !formData.unitId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newRestriction: LocationRestriction = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: formData.radius[0],
      unitId: formData.unitId,
      contentType: formData.contentType,
      isActive: formData.isActive,
      createdAt: new Date()
    };

    if (editingRestriction) {
      setRestrictions(prev => prev.map(r => 
        r.id === editingRestriction ? { ...newRestriction, id: editingRestriction } : r
      ));
      setEditingRestriction(null);
      toast({
        title: "Restriction Updated",
        description: `Location restriction "${formData.name}" has been updated.`,
      });
    } else {
      setRestrictions(prev => [...prev, newRestriction]);
      toast({
        title: "Restriction Created",
        description: `Location restriction "${formData.name}" has been created.`,
      });
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius: [100],
      unitId: '',
      contentType: 'all',
      isActive: true
    });
  };

  const handleEdit = (restriction: LocationRestriction) => {
    setFormData({
      name: restriction.name,
      description: restriction.description,
      latitude: restriction.latitude.toString(),
      longitude: restriction.longitude.toString(),
      radius: [restriction.radius],
      unitId: restriction.unitId,
      contentType: restriction.contentType,
      isActive: restriction.isActive
    });
    setEditingRestriction(restriction.id);
  };

  const handleDelete = (id: string) => {
    setRestrictions(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Restriction Deleted",
      description: "Location restriction has been removed.",
    });
  };

  const toggleRestriction = (id: string) => {
    setRestrictions(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const getUnitName = (unitId: string) => {
    const unit = assignedUnits.find(u => u.id === unitId);
    return unit ? `${unit.code} - ${unit.name}` : 'Unknown Unit';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius: [100],
      unitId: '',
      contentType: 'all',
      isActive: true
    });
    setEditingRestriction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location Restrictions</h2>
          <p className="text-gray-600">Set location-based restrictions for your course content</p>
        </div>
        <MapPin className="w-8 h-8 text-blue-600" />
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Restriction</TabsTrigger>
          <TabsTrigger value="manage">Manage Restrictions ({restrictions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingRestriction ? 'Edit Location Restriction' : 'Create New Location Restriction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restriction Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Campus Only"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unitId} onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.code} - {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this restriction..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Apply To</Label>
                  <Select value={formData.contentType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, contentType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="assignment">Assignments Only</SelectItem>
                      <SelectItem value="exam">Exams Only</SelectItem>
                      <SelectItem value="quiz">Quizzes Only</SelectItem>
                      <SelectItem value="online-class">Online Classes Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="e.g., -1.2921"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="e.g., 36.8219"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
                  </Button>
                  {currentLocation && (
                    <Badge variant="secondary">
                      Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Allowed Radius: {formData.radius[0]} meters</Label>
                  <Slider
                    value={formData.radius}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, radius: value }))}
                    max={2000}
                    min={50}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>50m</span>
                    <span>2000m</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingRestriction ? 'Update Restriction' : 'Create Restriction'}
                  </Button>
                  {editingRestriction && (
                    <Button type="button" variant="outline" onClick={resetForm} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restrictions.map((restriction) => (
              <Card key={restriction.id} className={`${restriction.isActive ? 'border-green-200' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{restriction.name}</h3>
                    <Badge variant={restriction.isActive ? "default" : "secondary"}>
                      {restriction.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{restriction.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Unit:</strong> {getUnitName(restriction.unitId)}</div>
                    <div><strong>Content Type:</strong> {restriction.contentType}</div>
                    <div><strong>Location:</strong> {restriction.latitude.toFixed(6)}, {restriction.longitude.toFixed(6)}</div>
                    <div><strong>Radius:</strong> {restriction.radius}m</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(restriction)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={restriction.isActive ? "secondary" : "default"}
                      onClick={() => toggleRestriction(restriction.id)}
                    >
                      {restriction.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(restriction.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {restrictions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Restrictions</h3>
                <p className="text-gray-500">
                  You haven't created any location restrictions yet. Click on "Create Restriction" to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};