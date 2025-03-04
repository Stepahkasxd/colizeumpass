
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    // Get API key from request headers
    const apiKey = req.headers.get("x-api-key");
    
    // Check if API key is provided
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", apiKey)
      .eq("active", true)
      .single();
    
    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if the key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "API key has expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Update last used timestamp
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id);
    
    // Log API key usage
    await supabase.from("activity_logs").insert({
      user_id: apiKeyData.user_id,
      category: "admin",
      action: "api_key_used",
      details: {
        key_id: apiKeyData.id,
        key_name: apiKeyData.name,
        endpoint: new URL(req.url).pathname,
        method: req.method,
      },
    });
    
    // Parse the URL and get the endpoint path
    const url = new URL(req.url);
    const path = url.pathname.replace("/admin-api", "").replace(/^\/|\/$/g, "");
    
    // Handle different endpoints
    if (req.method === "GET") {
      switch (path) {
        case "users":
          const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("*");
          
          if (usersError) {
            throw usersError;
          }
          
          return new Response(
            JSON.stringify({ data: users }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        
        case "passes":
          const { data: passes, error: passesError } = await supabase
            .from("passes")
            .select("*");
          
          if (passesError) {
            throw passesError;
          }
          
          return new Response(
            JSON.stringify({ data: passes }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        
        default:
          return new Response(
            JSON.stringify({
              message: "Welcome to the Colizeum Admin API",
              endpoints: [
                { method: "GET", path: "/users", description: "Get all users" },
                { method: "GET", path: "/passes", description: "Get all passes" },
              ],
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
      }
    }
    
    // Handle other HTTP methods (POST, PUT, DELETE)
    // Add your implementation here
    
    return new Response(
      JSON.stringify({ error: "Method not supported" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
