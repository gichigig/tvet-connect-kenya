
export interface Unit {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  progress: number;
  nextClass: string;
  status: 'active' | 'completed' | 'pending';
  semester: string;
  lecturerEmail?: string;
  whatsappLink?: string;
  hasDiscussionGroup?: boolean;
  // Additional properties for enhanced functionality
  description?: string;
  department?: string;
  enrolled?: number;
  capacity?: number;
  course?: string;
  year?: number;
}
