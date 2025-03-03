
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItem } from "./ActivityLogItem";
import { RotateCw } from "lucide-react";

interface UserActivityProps {
  userId: string;
}

export type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  category: string;
  created_at: string;
  details: any;
};

export function UserActivity({ userId }: UserActivityProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setLogs(data as ActivityLog[]);
      } catch (error) {
        console.error("Error fetching user logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [userId]);

  return (
    <Card className="bg-black/40 backdrop-blur-md border border-[#e4d079]/20 rounded-lg transition-all duration-300 hover:shadow-[0_8px_20px_rgba(228,208,121,0.07)]">
      <CardHeader>
        <CardTitle className="text-[#e4d079]">Активность пользователя</CardTitle>
        <CardDescription>История действий пользователя в системе</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RotateCw className="h-6 w-6 text-[#e4d079] animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Нет данных об активности пользователя
          </div>
        )}
      </CardContent>
    </Card>
  );
}
