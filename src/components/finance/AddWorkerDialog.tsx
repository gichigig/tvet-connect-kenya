
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AddWorkerDialogProps {
  onAdd: (worker: {
    name: string;
    email: string;
    position: string;
    department: string;
    basicSalary: number;
    allowances: number;
    bankAccount?: string;
    taxPin?: string;
  }) => void;
}

export const AddWorkerDialog = ({ onAdd }: AddWorkerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    basicSalary: "",
    allowances: "",
    bankAccount: "",
    taxPin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.position || !form.department || !form.basicSalary) return;
    onAdd({
      name: form.name,
      email: form.email,
      position: form.position,
      department: form.department,
      basicSalary: Number(form.basicSalary),
      allowances: Number(form.allowances) || 0,
      bankAccount: form.bankAccount,
      taxPin: form.taxPin,
    });
    setOpen(false);
    setForm({
      name: "",
      email: "",
      position: "",
      department: "",
      basicSalary: "",
      allowances: "",
      bankAccount: "",
      taxPin: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Worker</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Other Worker</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} type="email" />
          <Input name="position" placeholder="Position" value={form.position} onChange={handleChange} />
          <Input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
          <Input name="basicSalary" placeholder="Basic Salary" value={form.basicSalary} onChange={handleChange} type="number" min="0" />
          <Input name="allowances" placeholder="Allowances" value={form.allowances} onChange={handleChange} type="number" min="0" />
          <Input name="bankAccount" placeholder="Bank Account (optional)" value={form.bankAccount} onChange={handleChange} />
          <Input name="taxPin" placeholder="Tax PIN (optional)" value={form.taxPin} onChange={handleChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} type="button">Add Worker</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

