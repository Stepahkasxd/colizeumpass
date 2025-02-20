
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Проверяем авторизацию
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user: caller },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !caller) {
      throw new Error('Invalid token')
    }

    // Проверяем, является ли пользователь администратором
    const { data: isAdmin } = await supabase
      .rpc('is_admin', { user_id: caller.id })

    if (!isAdmin) {
      throw new Error('Unauthorized')
    }

    // Получаем ID пользователя для удаления из тела запроса
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Удаляем пользователя
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      throw deleteError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
