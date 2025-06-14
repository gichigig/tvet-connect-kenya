
import { FileText } from "lucide-react";

interface EmptyExamStateProps {
  type: 'cats' | 'exams';
}

export const EmptyExamState = ({ type }: EmptyExamStateProps) => {
  const title = type === 'cats' ? 'No CATs Created' : 'No Exams Created';
  const description = type === 'cats' 
    ? 'Create CATs from your unit management panel by clicking on a unit.'
    : 'Create exams from your unit management panel by clicking on a unit.';

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};
