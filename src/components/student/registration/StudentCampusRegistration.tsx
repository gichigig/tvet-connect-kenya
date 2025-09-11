import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, User, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface CampusRegistration {
  id: string;
  academicYear: string;
  semester: number;
  campusName: string;
  campusLocation: string;
  registrationDate: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  totalCredits: number;
  totalUnits: number;
  fees: {
    tuition: number;
    registration: number;
    facilities: number;
    total: number;
    paid: number;
    balance: number;
  };
  contact: {
    registrar: string;
    phone: string;
    email: string;
  };
}

interface StudentCampusRegistrationProps {
  onRegisterMore?: () => void;
}

export const StudentCampusRegistration: React.FC<StudentCampusRegistrationProps> = ({ onRegisterMore }) => {
  // Mock campus registration data
  const [campusRegistrations] = useState<CampusRegistration[]>([
    {
      id: '1',
      academicYear: '2025/2026',
      semester: 1,
      campusName: 'Main Campus',
      campusLocation: 'Nairobi, Kenya',
      registrationDate: '2025-08-15',
      status: 'active',
      totalCredits: 15,
      totalUnits: 5,
      fees: {
        tuition: 45000,
        registration: 5000,
        facilities: 3000,
        total: 53000,
        paid: 40000,
        balance: 13000
      },
      contact: {
        registrar: 'Dr. Mary Wanjiku',
        phone: '+254-700-123-456',
        email: 'registrar@tvetkenya.ac.ke'
      }
    },
    {
      id: '2',
      academicYear: '2024/2025',
      semester: 2,
      campusName: 'Main Campus',
      campusLocation: 'Nairobi, Kenya',
      registrationDate: '2025-02-10',
      status: 'completed',
      totalCredits: 18,
      totalUnits: 6,
      fees: {
        tuition: 45000,
        registration: 5000,
        facilities: 3000,
        total: 53000,
        paid: 53000,
        balance: 0
      },
      contact: {
        registrar: 'Dr. Mary Wanjiku',
        phone: '+254-700-123-456',
        email: 'registrar@tvetkenya.ac.ke'
      }
    }
  ]);

  const [activeRegistration] = useState(campusRegistrations.find(reg => reg.status === 'active'));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campus Registration</h2>
          <p className="text-gray-600">Manage your campus registration and enrollment details</p>
        </div>
        {onRegisterMore && (
          <Button onClick={onRegisterMore}>
            Register for New Semester
          </Button>
        )}
      </div>

      {activeRegistration && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently registered for <strong>{activeRegistration.academicYear}</strong> - 
            Semester {activeRegistration.semester} at {activeRegistration.campusName}.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Registration</TabsTrigger>
          <TabsTrigger value="history">Registration History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {activeRegistration ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {activeRegistration.campusName}
                      </CardTitle>
                      <CardDescription>{activeRegistration.campusLocation}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(activeRegistration.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(activeRegistration.status)}
                        {activeRegistration.status.charAt(0).toUpperCase() + activeRegistration.status.slice(1)}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Academic Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Academic Year:</span>
                          <span className="font-medium">{activeRegistration.academicYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Semester:</span>
                          <span className="font-medium">{activeRegistration.semester}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Date:</span>
                          <span className="font-medium">{new Date(activeRegistration.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Units:</span>
                          <span className="font-medium">{activeRegistration.totalUnits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Credits:</span>
                          <span className="font-medium">{activeRegistration.totalCredits}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{activeRegistration.contact.registrar}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{activeRegistration.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{activeRegistration.contact.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                  <CardDescription>Current semester fee breakdown and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuition Fee:</span>
                        <span className="font-medium">{formatCurrency(activeRegistration.fees.tuition)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Fee:</span>
                        <span className="font-medium">{formatCurrency(activeRegistration.fees.registration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facilities Fee:</span>
                        <span className="font-medium">{formatCurrency(activeRegistration.fees.facilities)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">{formatCurrency(activeRegistration.fees.total)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-medium text-green-600">{formatCurrency(activeRegistration.fees.paid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className={`font-medium ${activeRegistration.fees.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(activeRegistration.fees.balance)}
                          </span>
                        </div>
                      </div>

                      {activeRegistration.fees.balance > 0 && (
                        <div className="mt-4">
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              You have an outstanding balance of {formatCurrency(activeRegistration.fees.balance)}. 
                              Please make payment to avoid any academic disruptions.
                            </AlertDescription>
                          </Alert>
                          <Button className="mt-3" size="sm">
                            Make Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Registration</h3>
                <p className="text-gray-600 text-center mb-4">
                  You don't have an active campus registration. Register for the current semester to get started.
                </p>
                {onRegisterMore && (
                  <Button onClick={onRegisterMore}>
                    Register Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {campusRegistrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {registration.academicYear} - Semester {registration.semester}
                    </CardTitle>
                    <CardDescription>{registration.campusName}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(registration.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(registration.status)}
                      {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Registration Date:</span>
                    <div className="font-medium">{new Date(registration.registrationDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Units/Credits:</span>
                    <div className="font-medium">{registration.totalUnits} units ({registration.totalCredits} credits)</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fees:</span>
                    <div className="font-medium">{formatCurrency(registration.fees.total)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {campusRegistrations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration History</h3>
                <p className="text-gray-600 text-center">
                  Your registration history will appear here once you complete your first registration.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
