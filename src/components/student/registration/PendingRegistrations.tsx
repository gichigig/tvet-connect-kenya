
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PendingRegistration } from './types';

interface PendingRegistrationsProps {
  registrations: PendingRegistration[];
}

export const PendingRegistrations = ({ registrations }: PendingRegistrationsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (registrations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Registrations</CardTitle>
        <CardDescription>Units waiting for registrar approval</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {registrations.map((registration) => (
            <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-semibold">{registration.unitCode} - {registration.unitName}</h3>
                <p className="text-sm text-gray-600">Submitted: {registration.submittedDate}</p>
              </div>
              <Badge className={getStatusColor(registration.status)}>
                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
