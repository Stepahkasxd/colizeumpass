
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type LogCategory = Database['public']['Enums']['log_category'];

interface LogData {
  user_id: string;
  category: LogCategory;
  action: string;
  details?: any;
}

export const logActivity = async (data: LogData) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: data.user_id,
        category: data.category,
        action: data.action,
        details: data.details || {},
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
