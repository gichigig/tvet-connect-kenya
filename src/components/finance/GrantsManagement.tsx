
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Gift, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GrantsManagement = () => {
  const { toast } = useToast();
  const [grants, setGrants] = useState([
    { 
      id: 'G001', 
      name: 'TVET Capitation Grant', 
      donor: 'Ministry of Education', 
      amount: 25000000, 
      received: 15000000, 
      startDate: '2024-01-01', 
      endDate: '2024-12-31',
      status: 'active',
      compliance: 85
    },
    { 
      id: 'G002', 
      name: 'Equipment Modernization Fund', 
      donor: 'World Bank', 
      amount: 50000000, 
      received: 20000000, 
      startDate: '2024-03-01', 
      endDate: '2025-02-28',
      status: 'active',
      compliance: 92
    },
    { 
      id: 'G003', 
      name: 'Scholarship Program', 
      donor: 'Mastercard Foundation', 
      amount: 15000000, 
      received: 15000000, 
      startDate: '2023-09-01', 
      endDate: '2024-08-31',
      status: 'completed',
      compliance: 98
    }
  ]);

  const [scholarships, setScholarships] = useState([
    { id: 'S001', studentId: 'ST001', studentName: 'Alice Nyambura', amount: 45000, semester: 1, year: 2024, status: 'active' },
    { id: 'S002', studentId: 'ST002', studentName: 'Brian Kipchoge', amount: 35000, semester: 1, year: 2024, status: 'active' },
    { id: 'S003', studentId: 'ST003', studentName: 'Grace Wanjiru', amount: 40000, semester: 1, year: 2024, status: 'pending' }
  ]);

  const addScholarship = () => {
    const newScholarship = {
      id: `S${Date.now()}`,
      studentId: 'ST004',
      studentName: 'New Student',
      amount: 50000,
      semester: 1,
      year: 2024,
      status: 'pending' as const
    };

    setScholarships(prev => [...prev, newScholarship]);
    toast({
      title: "Scholarship Added",
      description: "New scholarship record has been created.",
    });
  };

  const generateComplianceReport = (grantId: string) => {
    const grant = grants.find(g => g.id === grantId);
    if (!grant) return;

    const report = `
GRANT COMPLIANCE REPORT
Grant: ${grant.name} (${grant.id})
Donor: ${grant.donor}
Reporting Period: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
Total Grant Amount: KSh ${grant.amount.toLocaleString()}
Amount Received: KSh ${grant.received.toLocaleString()}
Amount Utilized: KSh ${(grant.received * 0.8).toLocaleString()}
Remaining Balance: KSh ${(grant.received * 0.2).toLocaleString()}

COMPLIANCE STATUS
Overall Compliance Score: ${grant.compliance}%
Financial Management: 95%
Procurement Compliance: 90%
Reporting Timeliness: 88%
Beneficiary Targeting: 92%

FUND UTILIZATION
Personnel Costs: 40%
Equipment & Supplies: 35%
Training & Capacity Building: 15%
Administrative Costs: 8%
Monitoring & Evaluation: 2%

KEY ACHIEVEMENTS
• 150 students benefited from scholarship program
• 5 new laboratories equipped with modern equipment
• 25 staff members trained in new technologies
• 95% completion rate for funded projects

CHALLENGES & MITIGATION
• Procurement delays - Streamlined approval process
• Exchange rate fluctuations - Fixed rate agreements
• Capacity constraints - Additional staff recruited

NEXT STEPS
• Submit quarterly financial report
• Conduct mid-term project review
• Update beneficiary database
• Prepare for donor visit

Prepared by: Grants Management Office
Reviewed by: Chief Finance Officer
Approved by: Principal
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${grant.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Compliance Report Generated",
      description: `Report for ${grant.name} has been downloaded.`,
    });
  };

  const totalGrantAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);
  const totalReceived = grants.reduce((sum, grant) => sum + grant.received, 0);
  const utilizationRate = totalReceived > 0 ? ((totalReceived * 0.8) / totalReceived * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Funding & Grants Management
          </CardTitle>
          <CardDescription>
            Manage donor funds, scholarships, and government capitation - If there's grant money flying in, finance knows where it landed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalGrantAmount.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Grant Value</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalReceived.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Amount Received</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{utilizationRate}%</div>
              <div className="text-sm text-purple-800">Utilization Rate</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {grants.filter(g => g.status === 'active').length}
              </div>
              <div className="text-sm text-orange-800">Active Grants</div>
            </div>
          </div>

          <Tabs defaultValue="grants" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grants">Grant Portfolio</TabsTrigger>
              <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              <TabsTrigger value="capitation">TVET Capitation</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="grants" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grant ID</TableHead>
                    <TableHead>Grant Name</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell className="font-medium">{grant.id}</TableCell>
                      <TableCell>{grant.name}</TableCell>
                      <TableCell>{grant.donor}</TableCell>
                      <TableCell>KSh {grant.amount.toLocaleString()}</TableCell>
                      <TableCell>KSh {grant.received.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{grant.startDate}</div>
                          <div className="text-gray-500">to {grant.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grant.status === 'active' ? 'default' : 'secondary'}>
                          {grant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            grant.compliance >= 90 ? 'bg-green-500' : 
                            grant.compliance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {grant.compliance}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => generateComplianceReport(grant.id)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="scholarships" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Scholarship Recipients</h3>
                <Button onClick={addScholarship}>Add Scholarship</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scholarship ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Academic Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{scholarship.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scholarship.studentName}</div>
                          <div className="text-sm text-gray-500">{scholarship.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>KSh {scholarship.amount.toLocaleString()}</TableCell>
                      <TableCell>Semester {scholarship.semester}, {scholarship.year}</TableCell>
                      <TableCell>
                        <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="capitation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>TVET Capitation Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Academic Year 2024/2025:</span>
                        <span className="font-medium">KSh 25,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Received (Q1-Q2):</span>
                        <span className="font-medium text-green-600">KSh 15,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending (Q3-Q4):</span>
                        <span className="font-medium text-orange-600">KSh 10,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student Enrollment:</span>
                        <span className="font-medium">2,500 students</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per Student Capitation:</span>
                        <span className="font-medium">KSh 10,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Capitation Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Teaching & Learning (40%):</span>
                        <span>KSh 6,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Infrastructure (30%):</span>
                        <span>KSh 4,500,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment (20%):</span>
                        <span>KSh 3,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Administration (10%):</span>
                        <span>KSh 1,500,000</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-4">
                        *Allocation as per Ministry guidelines
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Financial Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Financial Reports</span>
                        <Badge variant="default">✓ Current</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Budget Adherence</span>
                        <Badge variant="default">95%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Audit Compliance</span>
                        <Badge variant="default">✓ Clean</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Procurement Rules</span>
                        <Badge variant="secondary">⚠ Minor</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Reporting Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Quarterly Reports</span>
                        <Badge variant="default">Q1-Q2 Submitted</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Beneficiary Updates</span>
                        <Badge variant="default">✓ Current</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Progress Reports</span>
                        <Badge variant="secondary">Q3 Due</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Financial Statements</span>
                        <Badge variant="default">✓ Audited</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Fund Security</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Compliance Risk</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Operational Risk</span>
                        <Badge variant="secondary">Medium Risk</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Reputational Risk</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
