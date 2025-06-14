
interface WorkloadDisplayProps {
  workload: number;
}

export const WorkloadDisplay = ({ workload }: WorkloadDisplayProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{width: `${workload}%`}}
        ></div>
      </div>
      <span className="text-sm">{workload}%</span>
    </div>
  );
};
