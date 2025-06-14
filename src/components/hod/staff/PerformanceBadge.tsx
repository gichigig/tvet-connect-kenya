
import { Badge } from "@/components/ui/badge";

interface PerformanceBadgeProps {
  performance: string;
}

export const PerformanceBadge = ({ performance }: PerformanceBadgeProps) => {
  const colors = {
    'excellent': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'average': 'bg-yellow-100 text-yellow-800',
    'needs_improvement': 'bg-red-100 text-red-800'
  };
  
  return (
    <Badge className={colors[performance as keyof typeof colors]}>
      {performance.replace('_', ' ')}
    </Badge>
  );
};
