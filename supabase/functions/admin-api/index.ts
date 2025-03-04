
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, active')
      .eq('key', apiKey)
      .single()
    
    if (keyError || !keyData || !keyData.active) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if user is an admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: keyData.user_id })
    
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the last_used_at timestamp for the API key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)

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
    
    // USERS endpoints - Full CRUD operations for users
    else if (resource === 'users') {
      // GET /users - List users
      if (req.method === 'GET') {
        const limit = Number(url.searchParams.get('limit') || '10')
        const offset = Number(url.searchParams.get('offset') || '0')
        const search = url.searchParams.get('search') || ''
        const hasPass = url.searchParams.get('has_pass')
        const status = url.searchParams.get('status')
        
        // Build query
        let query = supabase
          .from('profiles')
          .select('id, display_name, has_pass, level, points, status, created_at, phone_number, is_blocked', { count: 'exact' })
        
        // Apply filters
        if (search) {
          query = query.ilike('display_name', `%${search}%`)
        }
        
        if (hasPass !== null) {
          query = query.eq('has_pass', hasPass === 'true')
        }
        
        if (status) {
          query = query.eq('status', status)
        }
        
        // Apply pagination
        query = query.range(offset, offset + limit - 1)
        
        // Execute query
        const { data: users, error: usersError, count } = await query
        
        if (usersError) throw usersError
        
        // Get admin status for each user
        const usersWithRoles = await Promise.all(users.map(async (user) => {
          const { data: isUserAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
          return {
            ...user,
            is_admin: !!isUserAdmin
          }
        }))
        
        return new Response(
          JSON.stringify({
            data: usersWithRoles,
            total: count
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // GET /users/:id - Get specific user
      else if (req.method === 'GET' && apiPathParts.length > 1) {
        const userId = apiPathParts[1]
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'User not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw profileError
        }
        
        // Check if user is admin
        const { data: isUserAdmin } = await supabase.rpc('is_admin', { user_id: userId })
        
        // Get user auth details
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId)
        
        if (authError) throw authError
        
        return new Response(
          JSON.stringify({ 
            data: {
              ...profile,
              is_admin: !!isUserAdmin,
              email: authData.user?.email,
              last_sign_in_at: authData.user?.last_sign_in_at
            } 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // POST /users - Create user
      else if (req.method === 'POST') {
        const body = await req.json()
        const { email, password, display_name, phone_number, status, is_admin } = body
        
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Create user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name: display_name,
            phone: phone_number
          }
        })
        
        if (authError) throw authError
        
        const userId = authData.user.id
        
        // Update profile with additional data
        if (status) {
          await supabase
            .from('profiles')
            .update({ status })
            .eq('id', userId)
        }
        
        // Add admin role if requested
        if (is_admin) {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' })
        }
        
        // Get the created profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        return new Response(
          JSON.stringify({ 
            data: {
              ...profile,
              is_admin: !!is_admin,
              email
            },
            message: 'User created successfully'
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // PUT /users/:id - Update user
      else if (req.method === 'PUT' && apiPathParts.length > 1) {
        const userId = apiPathParts[1]
        const body = await req.json()
        const { display_name, phone_number, level, points, status, has_pass, is_blocked, is_admin, email } = body
        
        // Check if user exists
        const { data: existingUser, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (userError) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Update profile
        const profileUpdates: any = {}
        
        if (display_name !== undefined) profileUpdates.display_name = display_name
        if (phone_number !== undefined) profileUpdates.phone_number = phone_number
        if (level !== undefined) profileUpdates.level = level
        if (points !== undefined) profileUpdates.points = points
        if (status !== undefined) profileUpdates.status = status
        if (has_pass !== undefined) profileUpdates.has_pass = has_pass
        if (is_blocked !== undefined) profileUpdates.is_blocked = is_blocked
        
        if (Object.keys(profileUpdates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', userId)
          
          if (updateError) throw updateError
        }
        
        // Update email if provided
        if (email !== undefined) {
          const { error: emailError } = await supabase.auth.admin.updateUserById(
            userId,
            { email }
          )
          
          if (emailError) throw emailError
        }
        
        // Handle admin status change
        if (is_admin !== undefined) {
          const { data: currentIsAdmin } = await supabase.rpc('is_admin', { user_id: userId })
          
          if (is_admin && !currentIsAdmin) {
            // Add admin role
            await supabase
              .from('user_roles')
              .insert({ user_id: userId, role: 'admin' })
          } else if (!is_admin && currentIsAdmin) {
            // Remove admin role
            await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', userId)
              .eq('role', 'admin')
          }
        }
        
        // Get updated user data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        const { data: isUserAdmin } = await supabase.rpc('is_admin', { user_id: userId })
        const { data: authData } = await supabase.auth.admin.getUserById(userId)
        
        return new Response(
          JSON.stringify({ 
            data: {
              ...updatedProfile,
              is_admin: !!isUserAdmin,
              email: authData.user?.email,
              last_sign_in_at: authData.user?.last_sign_in_at
            },
            message: 'User updated successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // DELETE /users/:id - Delete user
      else if (req.method === 'DELETE' && apiPathParts.length > 1) {
        const userId = apiPathParts[1]
        
        // Check if user exists
        const { data: existingUser, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (userError) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Delete user from auth (will cascade to profile due to foreign key)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
        
        if (deleteError) throw deleteError
        
        return new Response(
          JSON.stringify({ 
            message: 'User deleted successfully' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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
