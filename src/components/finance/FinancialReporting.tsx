
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";

export const FinancialReporting = () => {
  const { toast } = useToast();
  const { studentFees, paymentRecords, getAllUsers } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("December 2024");

  const generateFinancialStatement = () => {
    const totalRevenue = studentFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
    const totalReceivables = studentFees.filter(f => f.status !== 'paid').reduce((sum, fee) => sum + (fee.amount - (fee.paidAmount || 0)), 0);
    
    const statement = `
FINANCIAL STATEMENT - ${selectedMonth}
Generated: ${new Date().toLocaleDateString()}

REVENUE SUMMARY
Student Fees Collected: KSh ${totalRevenue.toLocaleString()}
Accounts Receivable: KSh ${totalReceivables.toLocaleString()}
Government Grants: KSh 15,000,000
Other Income: KSh 2,500,000
Total Revenue: KSh ${(totalRevenue + 15000000 + 2500000).toLocaleString()}

EXPENDITURE SUMMARY
Staff Salaries: KSh 35,000,000
Operational Costs: KSh 8,500,000
Infrastructure: KSh 5,200,000
Utilities: KSh 2,800,000
Total Expenditure: KSh 51,500,000

NET POSITION: KSh ${(totalRevenue + 17500000 - 51500000).toLocaleString()}

BALANCE SHEET HIGHLIGHTS
Current Assets: KSh 125,000,000
Fixed Assets: KSh 450,000,000
Current Liabilities: KSh 35,000,000
Long-term Liabilities: KSh 180,000,000
Net Worth: KSh 360,000,000

FINANCIAL RATIOS
Current Ratio: 3.57
Debt-to-Equity: 0.60
Collection Efficiency: ${((totalRevenue / (totalRevenue + totalReceivables)) * 100).toFixed(1)}%
    `;

    downloadReport(statement, `financial_statement_${selectedMonth.replace(' ', '_')}.txt`);
  };

  const generateAuditReport = () => {
    const auditReport = `
INTERNAL AUDIT REPORT - ${selectedMonth}
Generated: ${new Date().toLocaleDateString()}

AUDIT SCOPE
- Revenue Recognition and Collection
- Expenditure Authorization and Control
- Asset Management and Safeguarding
- Compliance with Financial Regulations

KEY FINDINGS
1. REVENUE CONTROLS
   ✓ Proper segregation of duties in fee collection
   ✓ Daily reconciliation of cash receipts
   ⚠ Minor discrepancies in mobile money reconciliation

2. EXPENDITURE CONTROLS
   ✓ All expenditures properly authorized
   ✓ Supporting documentation complete
   ✓ Budget variance analysis conducted

3. ASSET MANAGEMENT
   ✓ Fixed asset register updated
   ✓ Physical verification completed
   ⚠ Need to update depreciation schedules

4. COMPLIANCE
   ✓ VAT returns filed on time
   ✓ PAYE remittances current
   ✓ Statutory deductions properly managed

RECOMMENDATIONS
1. Enhance mobile money reconciliation procedures
2. Update asset depreciation schedules quarterly
3. Implement automated budget variance alerts
4. Strengthen internal control documentation

MANAGEMENT RESPONSE
All recommendations accepted and implementation timeline agreed.

Prepared by: Internal Audit Department
Reviewed by: Chief Finance Officer
Approved by: Principal
    `;

    downloadReport(auditReport, `audit_report_${selectedMonth.replace(' ', '_')}.txt`);
  };

  const generateBoardReport = () => {
    const boardReport = `
BOARD OF GOVERNORS FINANCIAL REPORT
Period: ${selectedMonth}
Prepared: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
The institution's financial position remains stable with steady revenue growth and controlled expenditure. Key performance indicators show improvement in collection efficiency and budget adherence.

FINANCIAL PERFORMANCE
Revenue Growth: +12% compared to previous period
Collection Rate: 78% of billed fees collected
Budget Variance: Within 5% of approved budget
Cash Flow: Positive operational cash flow maintained

STRATEGIC INITIATIVES
1. Digital Payment Integration: 65% of payments now digital
2. Budget Optimization: 8% reduction in operational costs
3. Revenue Diversification: New income streams identified
4. Infrastructure Investment: KSh 15M approved for lab upgrades

RISK MANAGEMENT
- Credit Risk: Managed through enhanced collection procedures
- Liquidity Risk: Adequate cash reserves maintained
- Operational Risk: Internal controls strengthened

FUTURE OUTLOOK
- Projected 15% revenue growth next academic year
- Capital investment plan approved for infrastructure
- Technology upgrade budget allocated
- Staff development fund established

COMPLIANCE STATUS
✓ All regulatory requirements met
✓ Audit recommendations implemented
✓ Financial reporting deadlines adhered to
✓ Board oversight mechanisms functioning

RECOMMENDATIONS FOR BOARD CONSIDERATION
1. Approve revised fee structure for next academic year
2. Authorize capital expenditure for new programs
3. Endorse enhanced financial control procedures
4. Ratify investment policy updates

Respectfully submitted,
Chief Finance Officer
    `;

    downloadReport(boardReport, `board_report_${selectedMonth.replace(' ', '_')}.txt`);
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Financial Reporting & Auditing
          </CardTitle>
          <CardDescription>
            Prepare comprehensive reports, ensure transparency, and make sure no coin goes missing without a paper trail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-blue-800">Monthly Reports</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-green-800">Quarterly Reports</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-purple-800">Annual Report</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-orange-800">Compliance Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="December 2024">December 2024</SelectItem>
                <SelectItem value="November 2024">November 2024</SelectItem>
                <SelectItem value="October 2024">October 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="financial-statements" className="space-y-4">
            <TabsList>
              <TabsTrigger value="financial-statements">Financial Statements</TabsTrigger>
              <TabsTrigger value="audit-reports">Audit Reports</TabsTrigger>
              <TabsTrigger value="board-reports">Board Reports</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="financial-statements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Income Statement</CardTitle>
                    <CardDescription>Revenue and expenditure summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Revenue:</span>
                        <span className="font-medium">KSh 68.5M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Expenses:</span>
                        <span className="font-medium">KSh 51.5M</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t pt-2">
                        <span>Net Income:</span>
                        <span>KSh 17.0M</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={generateFinancialStatement}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Balance Sheet</CardTitle>
                    <CardDescription>Assets, liabilities, and equity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Assets:</span>
                        <span className="font-medium">KSh 575M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Liabilities:</span>
                        <span className="font-medium">KSh 215M</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t pt-2">
                        <span>Net Worth:</span>
                        <span>KSh 360M</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cash Flow Statement</CardTitle>
                    <CardDescription>Cash inflows and outflows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Operating Cash Flow:</span>
                        <span className="font-medium">KSh 22.5M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Investing Cash Flow:</span>
                        <span className="font-medium">(KSh 8.2M)</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t pt-2">
                        <span>Net Cash Flow:</span>
                        <span>KSh 14.3M</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audit-reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Internal Audit Report</CardTitle>
                    <CardDescription>Internal control assessment and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Audit Period:</span>
                        <span>{selectedMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Score:</span>
                        <span className="font-medium text-green-600">92/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Key Findings:</span>
                        <span>3 Minor Issues</span>
                      </div>
                      <Button onClick={generateAuditReport} className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Audit Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>External Audit</CardTitle>
                    <CardDescription>Independent auditor assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Audit Firm:</span>
                        <span>PKF Kenya</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Opinion:</span>
                        <span className="font-medium text-green-600">Unqualified</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recommendations:</span>
                        <span>5 Implemented</span>
                      </div>
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        View External Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="board-reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Board of Governors Reports</CardTitle>
                  <CardDescription>Executive summaries for board oversight</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Monthly Board Report</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Financial performance summary</div>
                        <div>• Budget variance analysis</div>
                        <div>• Key performance indicators</div>
                        <div>• Risk management updates</div>
                        <div>• Strategic initiative progress</div>
                      </div>
                      <Button onClick={generateBoardReport} className="mt-4">
                        <Download className="w-4 h-4 mr-2" />
                        Generate Board Report
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Quarterly Dashboard</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Revenue trends and forecasts</div>
                        <div>• Cost management effectiveness</div>
                        <div>• Capital project updates</div>
                        <div>• Regulatory compliance status</div>
                        <div>• Future outlook and recommendations</div>
                      </div>
                      <Button className="mt-4">
                        <FileBarChart className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>VAT Returns</span>
                        <span className="text-green-600 text-sm">✓ Submitted</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>PAYE Returns</span>
                        <span className="text-green-600 text-sm">✓ Submitted</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Annual Returns</span>
                        <span className="text-green-600 text-sm">✓ Submitted</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>CMA Reports</span>
                        <span className="text-yellow-600 text-sm">⏳ Pending</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Next VAT Return:</span>
                        <span className="text-sm">Jan 20, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PAYE Due:</span>
                        <span className="text-sm">Jan 9, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Board Meeting:</span>
                        <span className="text-sm">Jan 15, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Planning:</span>
                        <span className="text-sm">Feb 1, 2025</span>
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
