import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface SemesterReport {
  studentId: string;
  course: string;
  year: number;
  semester: string;
  reportedAt: Date;
  status: 'active' | 'completed';
}

export function SyncUnitsButton({ 
  onSync, 
  semesterReport 
}: { 
  onSync: () => void;
  semesterReport: SemesterReport;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  // Auto-sync on mount if semester report is present
  useEffect(() => {
    if (semesterReport && !synced) {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterReport]);

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      onSync();
      setLoading(false);
      setSynced(true);
      toast({
        title: "Units Synced",
        description: `Units for ${semesterReport.course} Year ${semesterReport.year} Semester ${semesterReport.semester} have been loaded.`,
        variant: "default",
      });
    }, 800); // Simulate async
  };

  return (
    <Button
      variant={synced ? "default" : "outline"}
      className="flex items-center gap-2"
      onClick={() => {
        if (!semesterReport) {
          toast({
            title: "Missing Semester Report",
            description: "Please report your semester first before syncing units.",
            variant: "destructive",
          });
          return;
        }
        handleSync();
      }}
      title={`Sync units for ${semesterReport.course} Year ${semesterReport.year} Semester ${semesterReport.semester}`}
      disabled={loading || synced}
    >
      {synced ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />}
      {synced ? "Synced" : loading ? "Syncing..." : "Sync Units"}
    </Button>
  );
}
