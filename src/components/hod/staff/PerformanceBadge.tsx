// Performance Badge Component
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Star, Award } from "lucide-react";

interface PerformanceBadgeProps {
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'needs_improvement';
  score?: number;
  className?: string;
}

export const PerformanceBadge = ({ performance, score, className }: PerformanceBadgeProps) => {
  const getPerformanceConfig = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return {
          label: 'Excellent',
          variant: 'default' as const,
          icon: Award,
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
        };
      case 'good':
        return {
          label: 'Good',
          variant: 'default' as const,
          icon: TrendingUp,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300'
        };
      case 'average':
        return {
          label: 'Average',
          variant: 'secondary' as const,
          icon: Minus,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
        };
      case 'poor':
        return {
          label: 'Poor',
          variant: 'destructive' as const,
          icon: TrendingDown,
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300'
        };
      case 'needs_improvement':
        return {
          label: 'Needs Improvement',
          variant: 'destructive' as const,
          icon: TrendingDown,
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: Minus,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getPerformanceConfig(performance);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
      {score !== undefined && (
        <span className="ml-1 font-semibold">
          ({score}%)
        </span>
      )}
    </Badge>
  );
};
