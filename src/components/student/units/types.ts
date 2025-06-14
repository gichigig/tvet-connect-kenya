
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
}
