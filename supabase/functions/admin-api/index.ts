
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the API key from the request headers
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Validate the API key
    const { data: keyData, error: keyError } = await supabase.rpc('validate_api_key', { api_key: apiKey })
    
    if (keyError || !keyData || keyData.length === 0 || !keyData[0].is_valid || !keyData[0].is_admin) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key or insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the URL to get the path parts
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(p => p)
    
    // Remove 'admin-api' from the path if it exists
    const apiPathParts = pathParts[0] === 'admin-api' ? pathParts.slice(1) : pathParts
    
    if (apiPathParts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid API endpoint' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different API endpoints
    const resource = apiPathParts[0]
    
    // GET /stats - Return system statistics
    if (resource === 'stats') {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError
      
      // Get active passes count
      const { count: passesCount, error: passesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('has_pass', true)
      
      if (passesError) throw passesError
      
      // Return statistics
      return new Response(
        JSON.stringify({
          data: {
            total_users: usersCount,
            active_passes: passesCount,
            // Add more statistics as needed
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /users - Return list of users
    else if (resource === 'users') {
      const limit = Number(url.searchParams.get('limit') || '10')
      const offset = Number(url.searchParams.get('offset') || '0')
      
      // Get users with pagination
      const { data: users, error: usersError, count } = await supabase
        .from('profiles')
        .select('id, display_name, has_pass, level, points, created_at', { count: 'exact' })
        .range(offset, offset + limit - 1)
      
      if (usersError) throw usersError
      
      return new Response(
        JSON.stringify({
          data: users,
          total: count
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /passes - Return list of passes
    else if (resource === 'passes') {
      // Check if we're requesting a specific pass
      if (apiPathParts.length > 1) {
        const passId = apiPathParts[1]
        
        const { data: pass, error: passError } = await supabase
          .from('passes')
          .select('*')
          .eq('id', passId)
          .single()
        
        if (passError) {
          if (passError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'Pass not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          throw passError
        }
        
        return new Response(
          JSON.stringify({ data: pass }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Get all passes
      const { data: passes, error: passesError } = await supabase
        .from('passes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (passesError) throw passesError
      
      return new Response(
        JSON.stringify({
          data: passes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Unknown endpoint
    else {
      return new Response(
        JSON.stringify({ error: 'Unknown API endpoint' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Error in admin-api function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
