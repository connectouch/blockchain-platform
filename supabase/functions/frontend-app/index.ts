/**
 * Supabase Edge Function to serve the React frontend
 * This serves the built React application from Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.168.0/http/file_server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Serve static files from the dist directory
    if (pathname.startsWith('/assets/') || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.ico')) {
      return await serveDir(req, {
        fsRoot: './dist',
        urlRoot: '',
        headers: corsHeaders,
      })
    }

    // For all other routes, serve index.html (SPA routing)
    const indexPath = './dist/index.html'
    
    try {
      const indexFile = await Deno.readTextFile(indexPath)
      return new Response(indexFile, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } catch (error) {
      console.error('Error reading index.html:', error)
      return new Response('Frontend not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

  } catch (error) {
    console.error('Error serving frontend:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
