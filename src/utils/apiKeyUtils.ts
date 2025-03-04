
import { supabase } from "@/integrations/supabase/client";

// Function to validate API key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.error('API key validation error:', error);
      return false;
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    // Check if the key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log('API key expired');
      return false;
    }

    // Log API key usage
    await supabase.from('activity_logs').insert({
      user_id: data.user_id,
      category: 'admin',
      action: 'api_key_used',
      details: {
        key_id: data.id,
        key_name: data.name
      }
    });

    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

// Generate a random API key
export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
