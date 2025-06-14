
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProcurementRequest } from "./types";
import { formatCurrency, getStatusBadge } from "./utils";

interface ProcurementTableProps {
  procurementRequests: ProcurementRequest[];
}

export const ProcurementTable = ({ procurementRequests }: ProcurementTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Procurement Requests
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </CardTitle>
        <CardDescription>
          Manage equipment and material procurement requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procurementRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.item}</div>
                    <div className="text-sm text-gray-500">{request.description}</div>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(request.amount)}</TableCell>
                <TableCell>{request.requestDate}</TableCell>
                <TableCell>
                  <Badge variant={request.urgency === "urgent" ? "destructive" : "outline"}>
                    {request.urgency}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  {request.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline">Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
