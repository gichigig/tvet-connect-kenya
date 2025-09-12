import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CampusBranch {
  id: string;
  name: string;
  code: string;
  location: string;
  whatsapp_group_link: string;
  is_active: boolean;
}

interface UnitRegistration {
  id: string;
  unit_id: string;
  campus_branch_id: string | null;
  registration_status: string;
  can_change_campus: boolean;
  change_deadline: string | null;
  joined_whatsapp: boolean;
  campus_branch?: CampusBranch;
}

interface CampusRegistrationProps {
  unitId: string;
  unitCode: string;
  unitName: string;
  studentId: string;
}

export const CampusRegistration: React.FC<CampusRegistrationProps> = ({
  unitId,
  unitCode,
  unitName,
  studentId
}) => {
  const [campusBranches, setCampusBranches] = useState<CampusBranch[]>([]);
  const [registration, setRegistration] = useState<UnitRegistration | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load campus branches
      const { data: branches, error: branchesError } = await supabase
        .from('campus_branches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (branchesError) throw branchesError;
      setCampusBranches(branches || []);

      // Load existing registration
      const { data: reg, error: regError } = await supabase
        .from('student_unit_registrations')
        .select(`
          *,
          campus_branch:campus_branches(*)
        `)
        .eq('student_id', studentId)
        .eq('unit_id', unitId)
        .single();

      if (regError && regError.code !== 'PGRST116') throw regError;
      
      if (reg) {
        setRegistration(reg);
        setSelectedCampus(reg.campus_branch_id || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load campus information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [unitId, studentId]);

  const handleRegisterCampus = async () => {
    if (!selectedCampus) {
      toast.error('Please select a campus branch');
      return;
    }

    setUpdating(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (registration) {
        // Update existing registration
        const { error } = await supabase
          .from('student_unit_registrations')
          .update({
            campus_branch_id: selectedCampus,
            can_change_campus: true,
            change_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            joined_whatsapp: false
          })
          .eq('id', registration.id);

        if (error) throw error;
      } else {
        // Create new registration
        const { error } = await supabase
          .from('student_unit_registrations')
          .insert([{
            student_id: user.user?.id,
            unit_id: unitId,
            campus_branch_id: selectedCampus,
            registration_status: 'pending',
            can_change_campus: true,
            change_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            joined_whatsapp: false
          }]);

        if (error) throw error;
      }

      toast.success('Campus registration updated successfully!');
      await loadData();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for campus');
    } finally {
      setUpdating(false);
    }
  };

  const handleJoinWhatsApp = async () => {
    if (!registration?.campus_branch?.whatsapp_group_link) return;

    try {
      // Update joined status
      const { error } = await supabase
        .from('student_unit_registrations')
        .update({ joined_whatsapp: true })
        .eq('id', registration.id);

      if (error) throw error;

      // Open WhatsApp link
      window.open(registration.campus_branch.whatsapp_group_link, '_blank');
      toast.success('Joined WhatsApp group!');
      await loadData();
    } catch (error) {
      console.error('WhatsApp join error:', error);
      toast.error('Failed to update WhatsApp status');
    }
  };

  const canChangeCampus = (): boolean => {
    if (!registration) return true;
    if (!registration.can_change_campus) return false;
    if (!registration.change_deadline) return true;
    return new Date(registration.change_deadline) > new Date();
  };

  const getStatusBadge = () => {
    if (!registration) return null;

    switch (registration.registration_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Campus Registration - {unitCode} ({unitName})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {registration && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Registration Status</h3>
              {getStatusBadge()}
            </div>
            
            {registration.campus_branch && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Selected Campus:</strong> {registration.campus_branch.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {registration.campus_branch.location}
                </p>
                
                {registration.change_deadline && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Can change campus until: {new Date(registration.change_deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-medium mb-3">Select Campus Branch</h3>
          
          {!canChangeCampus() && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Campus change period has expired. Contact your HOD for changes.
              </span>
            </div>
          )}

          <Select 
            value={selectedCampus} 
            onValueChange={setSelectedCampus}
            disabled={!canChangeCampus()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a campus branch" />
            </SelectTrigger>
            <SelectContent>
              {campusBranches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-muted-foreground">{branch.location}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCampus && canChangeCampus() && (
          <Button 
            onClick={handleRegisterCampus}
            disabled={updating}
            className="w-full"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {registration ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {registration ? 'Update Campus Selection' : 'Register for Campus'}
              </>
            )}
          </Button>
        )}

        {registration?.campus_branch?.whatsapp_group_link && registration.registration_status === 'approved' && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                WhatsApp Group
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Join the WhatsApp group for {registration.campus_branch.name} to stay updated with announcements and discussions.
              </p>
              
              {registration.joined_whatsapp ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Already joined WhatsApp group</span>
                </div>
              ) : (
                <Button 
                  onClick={handleJoinWhatsApp}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join WhatsApp Group
                </Button>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={loadData}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};