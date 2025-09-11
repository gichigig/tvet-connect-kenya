
export interface Unit {
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
  lecturerId?: string;
  lecturerName?: string;
  lecturerEmail?: string;
  capacity: number;
  enrolled: number;
  schedule?: string;
  whatsappLink?: string;
  hasDiscussionGroup: boolean;
  createdBy: string;
  createdDate: string;
  status: 'active' | 'inactive';
  campusId?: string; // Campus where this unit is offered
  campusName?: string;
  availableCampuses?: string[]; // Multiple campuses where this unit is available
}

export interface CreateUnitData {
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
  schedule?: string;
  whatsappLink?: string;
  hasDiscussionGroup: boolean;
  lecturerId?: string;
  lecturerName?: string;
  lecturerEmail?: string;
  
}
