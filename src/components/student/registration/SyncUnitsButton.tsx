import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function SyncUnitsButton({ onSync }: { onSync: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  // Auto-sync on mount if user info is present
  useEffect(() => {
    if (user?.course && user?.year && user?.semester && !synced) {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.course, user?.year, user?.semester]);

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      onSync();
      setLoading(false);
      setSynced(true);
      toast({
        title: "Units Synced",
        description: "Units for your course, year, and semester have been loaded.",
        variant: "default",
      });
    }, 800); // Simulate async
  };

  return (
    <Button
      variant={synced ? "default" : "outline"}
      className="flex items-center gap-2"
      onClick={() => {
        if (!user?.course || !user?.year || !user?.semester) {
          toast({
            title: "Missing Info",
            description: "Your course, year, or semester info is missing. Please contact the registrar.",
            variant: "destructive",
          });
          return;
        }
        handleSync();
      }}
      title="Sync units for your course/year/semester"
      disabled={loading || synced}
    >
      {synced ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />}
      {synced ? "Synced" : loading ? "Syncing..." : "Sync Units"}
    </Button>
  );
}
