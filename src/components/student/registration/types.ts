
export interface PendingRegistration {
  id: string;
  unitCode: string;
  unitName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export interface AvailableUnit {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  department: string;
  course: string;
  year: number;
  semester: number;
  prerequisites: string[];
  capacity: number;
  enrolled: number;
  schedule?: string;
  whatsappLink?: string;
  hasDiscussionGroup: boolean;
  createdBy: string;
  createdDate: string;
  status: 'active' | 'inactive';
  lecturer?: {
    id: string;
    name: string;
    email: string;
  };
}
