
import { supabase } from "@/integrations/supabase/client";

export interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  key: string;
  user_id: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  status: 'active' | 'revoked' | 'expired';
}

export async function generateApiKey(name: string, description?: string, expiresAt?: Date) {
  try {
    // First generate a key using the database function
    const { data: keyData, error: keyError } = await supabase.rpc('generate_api_key');
    
    if (keyError) throw keyError;
    
    // Then create the API key record
    const { data, error } = await supabase.from('api_keys').insert({
      name,
      description,
      key: keyData,
      expires_at: expiresAt ? expiresAt.toISOString() : null
    }).select().single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error generating API key:', error);
    return { success: false, error };
  }
}

export async function getUserApiKeys() {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our ApiKey interface
    const transformedData = data.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      key: key.key,
      user_id: key.user_id,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at,
      status: key.active ? 'active' : 'revoked' as 'active' | 'revoked' | 'expired'
    }));
    
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return { success: false, error };
  }
}

export async function revokeApiKey(id: string) {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { success: false, error };
  }
}

export async function validateApiKey(apiKey: string) {
  try {
    const { data, error } = await supabase.rpc('validate_api_key', { api_key: apiKey });
    
    if (error) throw error;
    
    return { 
      success: true, 
      isValid: data && data.length > 0 && !!data[0].is_valid, 
      isAdmin: data && data.length > 0 && !!data[0].is_admin,
      userId: data && data.length > 0 ? data[0].user_id : null
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { success: false, error };
  }
}
