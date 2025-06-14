
export interface AvailableUnit {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  semester: string;
  year: number;
  course: string;
  prerequisites: string[];
  description: string;
  schedule: string;
  whatsappLink?: string;
  hasDiscussionGroup: boolean;
}

export interface PendingRegistration {
  id: string;
  unitCode: string;
  unitName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}
