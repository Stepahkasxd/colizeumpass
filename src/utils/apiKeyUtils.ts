
import { supabase } from "@/integrations/supabase/client";

// Import the SUPABASE_URL from the client file
import { createClient } from '@supabase/supabase-js';

// Define the Supabase URL to use in API calls
const SUPABASE_URL = "https://lmgfzqaewmenlmawdrxn.supabase.co";

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
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Then create the API key record
    const { data, error } = await supabase.from('api_keys').insert({
      name,
      description,
      key: randomKey,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      active: true,
      user_id: user.id
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
    
    // Проверяем, истёк ли срок действия ключа
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
    
    // Проверяем, существует и активен ли ключ
    const isValid = !!data && data.active === true && !isExpired;
    
    // Проверяем статус администратора
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
      userId,
      isExpired: isExpired || false
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { success: false, error };
  }
}

// Новые функции для работы с API через Edge Function

export async function fetchApiKeys() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Получить собственный API ключ для авторизации запроса
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No active API key found');
    }
    
    const authApiKey = apiKeys[0].key;
    
    // Вызываем API endpoint для получения ключей
    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys-api/keys`, {
      method: 'GET',
      headers: {
        'x-api-key': authApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch API keys');
    }
    
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error fetching API keys via API:', error);
    return { success: false, error };
  }
}

export async function createApiKeyViaApi(name: string, description?: string, expiresAt?: Date) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Получить собственный API ключ для авторизации запроса
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No active API key found');
    }
    
    const authApiKey = apiKeys[0].key;
    
    // Вызываем API endpoint для создания ключа
    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys-api/keys`, {
      method: 'POST',
      headers: {
        'x-api-key': authApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        expires_at: expiresAt ? expiresAt.toISOString() : null
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create API key');
    }
    
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating API key via API:', error);
    return { success: false, error };
  }
}

export async function revokeApiKeyViaApi(id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Получить собственный API ключ для авторизации запроса
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No active API key found');
    }
    
    const authApiKey = apiKeys[0].key;
    
    // Вызываем API endpoint для отзыва ключа
    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys-api/keys/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': authApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to revoke API key');
    }
    
    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error revoking API key via API:', error);
    return { success: false, error };
  }
}

// Административные функции
export async function fetchAllApiKeysAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Получить собственный API ключ для авторизации запроса
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No active API key found');
    }
    
    const authApiKey = apiKeys[0].key;
    
    // Вызываем API endpoint для получения всех ключей (только для админа)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys-api/admin/keys`, {
      method: 'GET',
      headers: {
        'x-api-key': authApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch API keys');
    }
    
    const result = await response.json();
    return { success: true, data: result.data, total: result.total };
  } catch (error) {
    console.error('Error fetching admin API keys:', error);
    return { success: false, error };
  }
}

export async function toggleApiKeyStatusAdmin(id: string, active: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Получить собственный API ключ для авторизации запроса
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No active API key found');
    }
    
    const authApiKey = apiKeys[0].key;
    
    // Вызываем API endpoint для изменения статуса ключа
    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-keys-api/admin/keys/${id}`, {
      method: 'PUT',
      headers: {
        'x-api-key': authApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update API key status');
    }
    
    const result = await response.json();
    return { success: true, message: result.message, data: result.data };
  } catch (error) {
    console.error('Error updating API key status:', error);
    return { success: false, error };
  }
}
