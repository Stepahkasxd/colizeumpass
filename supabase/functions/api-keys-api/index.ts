
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Получаем API ключ из заголовков запроса
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Создаём Supabase клиент с использованием service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Проверяем валидность API ключа
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, active, expires_at')
      .eq('key', apiKey)
      .single()
    
    if (keyError || !keyData || !keyData.active) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Проверяем срок действия ключа
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      // Обновляем статус ключа на expired
      await supabase
        .from('api_keys')
        .update({ active: false })
        .eq('key', apiKey)
      
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Проверяем, является ли пользователь администратором
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: keyData.user_id })
    
    if (adminError) {
      console.error('Error checking admin status:', adminError)
    }

    // Обновляем last_used_at для API ключа
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)

    // Разбор URL для получения частей пути
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(p => p)
    
    // Удаляем 'api-keys-api' из пути, если он присутствует
    const apiPathParts = pathParts[0] === 'api-keys-api' ? pathParts.slice(1) : pathParts
    
    if (apiPathParts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'API Keys API',
          endpoints: [
            '/keys - GET: List all keys for current user (auth required)',
            '/keys/:id - GET: Get key details (auth required)',
            '/keys - POST: Create new key (auth required)',
            '/keys/:id - DELETE: Revoke key (auth required)',
            '/admin/keys - GET: List all keys (admin only)'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Обработка разных эндпоинтов
    const resource = apiPathParts[0]
    
    // API Keys endpoints
    if (resource === 'keys') {
      // GET /keys - Получить список всех ключей текущего пользователя
      if (req.method === 'GET' && apiPathParts.length === 1) {
        // Запрашивать ключи может только их владелец
        const { data: keys, error: keysError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', keyData.user_id)
          .order('created_at', { ascending: false });
        
        if (keysError) throw keysError;
        
        // Преобразуем данные для сопоставления с нашим интерфейсом
        const transformedKeys = keys.map(key => ({
          id: key.id,
          name: key.name,
          description: key.description,
          key: key.key,
          user_id: key.user_id,
          created_at: key.created_at,
          last_used_at: key.last_used_at,
          expires_at: key.expires_at,
          status: key.active ? 'active' : 'revoked'
        }));
        
        return new Response(
          JSON.stringify({ data: transformedKeys }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // GET /keys/:id - Получить информацию о конкретном ключе
      else if (req.method === 'GET' && apiPathParts.length > 1) {
        const keyId = apiPathParts[1];

        // Только владелец ключа может получать информацию о нём
        const { data: key, error: keyError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('id', keyId)
          .eq('user_id', keyData.user_id)
          .single();
        
        if (keyError) {
          if (keyError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'API key not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw keyError;
        }
        
        // Преобразуем данные для сопоставления с интерфейсом
        const transformedKey = {
          id: key.id,
          name: key.name,
          description: key.description,
          key: key.key,
          user_id: key.user_id,
          created_at: key.created_at,
          last_used_at: key.last_used_at,
          expires_at: key.expires_at,
          status: key.active ? 'active' : 'revoked'
        };
        
        return new Response(
          JSON.stringify({ data: transformedKey }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // POST /keys - Создать новый ключ
      else if (req.method === 'POST' && apiPathParts.length === 1) {
        const body = await req.json();
        const { name, description, expires_at } = body;
        
        if (!name || name.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'API key name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Генерируем случайный API ключ
        const randomKey = Array.from({ length: 32 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        // Создаём запись API ключа
        const { data: newKey, error: createError } = await supabase
          .from('api_keys')
          .insert({
            name,
            description,
            key: randomKey,
            expires_at: expires_at ? new Date(expires_at).toISOString() : null,
            user_id: keyData.user_id
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Преобразуем данные для сопоставления с интерфейсом
        const transformedKey = {
          id: newKey.id,
          name: newKey.name,
          description: newKey.description,
          key: newKey.key,
          user_id: newKey.user_id,
          created_at: newKey.created_at,
          last_used_at: newKey.last_used_at,
          expires_at: newKey.expires_at,
          status: newKey.active ? 'active' : 'revoked'
        };
        
        return new Response(
          JSON.stringify({ 
            data: transformedKey,
            message: 'API key created successfully'
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // DELETE /keys/:id - Отозвать API ключ
      else if (req.method === 'DELETE' && apiPathParts.length > 1) {
        const keyId = apiPathParts[1];
        
        // Проверяем, существует ли ключ и принадлежит ли он пользователю
        const { data: existingKey, error: keyError } = await supabase
          .from('api_keys')
          .select('id, user_id')
          .eq('id', keyId)
          .single();
        
        if (keyError) {
          return new Response(
            JSON.stringify({ error: 'API key not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Только владелец может отозвать ключ
        if (existingKey.user_id !== keyData.user_id && !isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Отзываем ключ (устанавливаем active=false)
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({ active: false })
          .eq('id', keyId);
        
        if (updateError) throw updateError;
        
        return new Response(
          JSON.stringify({ 
            message: 'API key revoked successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Admin API Keys endpoints (только для администраторов)
    else if (resource === 'admin' && apiPathParts[1] === 'keys') {
      // Проверяем, является ли пользователь администратором
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // GET /admin/keys - Получить список всех ключей (для админов)
      if (req.method === 'GET' && apiPathParts.length === 2) {
        const limit = Number(url.searchParams.get('limit') || '50')
        const offset = Number(url.searchParams.get('offset') || '0')
        const search = url.searchParams.get('search')
        const active = url.searchParams.get('active')
        
        let query = supabase
          .from('api_keys')
          .select('*, profiles!api_keys_user_id_fkey(display_name)', { count: 'exact' })
        
        // Применяем фильтры
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
        
        if (active !== null) {
          query = query.eq('active', active === 'true')
        }
        
        // Применяем пагинацию
        query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
        
        const { data: keys, error: keysError, count } = await query
        
        if (keysError) throw keysError
        
        // Преобразуем данные
        const transformedKeys = keys.map(key => ({
          id: key.id,
          name: key.name,
          description: key.description,
          key: key.key,
          user_id: key.user_id,
          user_name: key.profiles?.display_name,
          created_at: key.created_at,
          last_used_at: key.last_used_at,
          expires_at: key.expires_at,
          status: key.active ? 'active' : 'revoked'
        }))
        
        return new Response(
          JSON.stringify({
            data: transformedKeys,
            total: count
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // GET /admin/keys/:id - Получить информацию о конкретном ключе (для админов)
      else if (req.method === 'GET' && apiPathParts.length > 2) {
        const keyId = apiPathParts[2]
        
        const { data: key, error: keyError } = await supabase
          .from('api_keys')
          .select('*, profiles!api_keys_user_id_fkey(display_name)')
          .eq('id', keyId)
          .single()
        
        if (keyError) {
          if (keyError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'API key not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw keyError
        }
        
        const transformedKey = {
          id: key.id,
          name: key.name,
          description: key.description,
          key: key.key,
          user_id: key.user_id,
          user_name: key.profiles?.display_name,
          created_at: key.created_at,
          last_used_at: key.last_used_at,
          expires_at: key.expires_at,
          status: key.active ? 'active' : 'revoked'
        }
        
        return new Response(
          JSON.stringify({ data: transformedKey }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // PUT /admin/keys/:id - Обновить статус ключа (для админов)
      else if (req.method === 'PUT' && apiPathParts.length > 2) {
        const keyId = apiPathParts[2]
        const body = await req.json()
        const { active } = body
        
        if (active === undefined) {
          return new Response(
            JSON.stringify({ error: 'Active status is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const { data: updatedKey, error: updateError } = await supabase
          .from('api_keys')
          .update({ active })
          .eq('id', keyId)
          .select()
          .single()
        
        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'API key not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw updateError
        }
        
        return new Response(
          JSON.stringify({ 
            message: `API key ${active ? 'activated' : 'revoked'} successfully`,
            data: {
              id: updatedKey.id,
              name: updatedKey.name,
              status: updatedKey.active ? 'active' : 'revoked'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Неизвестный эндпоинт
    return new Response(
      JSON.stringify({ error: 'Unknown API endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in api-keys-api function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
