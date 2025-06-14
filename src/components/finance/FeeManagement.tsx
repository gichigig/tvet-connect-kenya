
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FeeForm } from "./fee-management/FeeForm";
import { FeeGuidelines } from "./fee-management/FeeGuidelines";

export const FeeManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-gray-600">Add fees for supplementary exams, special exams, and unit retakes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Student Fee</DialogTitle>
              <DialogDescription>
                Add a fee for supplementary exam, special exam, or unit retake
              </DialogDescription>
            </DialogHeader>
            <FeeForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <FeeGuidelines />
    </div>
  );
};
