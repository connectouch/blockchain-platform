/**
 * Supabase Edge Function to serve the React frontend
 * This properly handles SPA routing and serves static assets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// HTML content for the React app
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connectouch - Comprehensive Blockchain AI Platform</title>
    <script type="module" crossorigin src="https://aompecyfgnakkmldhidg.supabase.co/storage/v1/object/public/frontend-app/assets/index-CNr7hNtb.js"></script>
    <link rel="stylesheet" crossorigin href="https://aompecyfgnakkmldhidg.supabase.co/storage/v1/object/public/frontend-app/assets/index-DoPNr-30.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Serve static assets from storage
    if (pathname.startsWith('/assets/') || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.svg')) {
      const storageUrl = `https://aompecyfgnakkmldhidg.supabase.co/storage/v1/object/public/frontend-app${pathname}`
      
      try {
        const response = await fetch(storageUrl)
        if (response.ok) {
          const contentType = response.headers.get('content-type') || 'application/octet-stream'
          return new Response(response.body, {
            headers: {
              ...corsHeaders,
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000', // 1 year cache for assets
            },
          })
        }
      } catch (error) {
        console.error('Error fetching asset:', error)
      }
    }

    // For all other routes (SPA routing), serve the index.html
    return new Response(indexHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache', // Don't cache HTML
      },
    })

  } catch (error) {
    console.error('Error serving frontend:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
