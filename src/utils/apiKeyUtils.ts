
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
    // Generate a random API key (since we can't use generate_api_key RPC)
    const randomKey = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // Then create the API key record
    const { data, error } = await supabase.from('api_keys').insert({
      name,
      description,
      key: randomKey,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      active: true
    }).select().single();
    
    if (error) throw error;
    
    // Transform to match our ApiKey interface
    const apiKey: ApiKey = {
      id: data.id,
      name: data.name,
      description: data.description,
      key: data.key,
      user_id: data.user_id,
      created_at: data.created_at,
      last_used_at: data.last_used_at,
      expires_at: data.expires_at,
      status: data.active ? 'active' : 'revoked'
    };
    
    return { success: true, data: apiKey };
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
    const transformedData: ApiKey[] = data.map(key => ({
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
    // Instead of using the RPC, we'll query the table directly
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, active, expires_at')
      .eq('key', apiKey)
      .single();
    
    if (error) throw error;
    
    // Check if the key exists and is active
    const isValid = !!data && data.active === true;
    
    // Check if we need to validate admin status
    let isAdmin = false;
    let userId = null;
    
    if (isValid && data) {
      userId = data.user_id;
      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase.rpc('is_admin', { user_id: data.user_id });
      if (!adminError) {
        isAdmin = !!adminData;
      }
    }
    
    return { 
      success: true, 
      isValid, 
      isAdmin,
      userId
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { success: false, error };
  }
}
