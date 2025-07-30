/**
 * Supabase Edge Function to serve the Connectouch React App
 * Serves a complete React application with embedded assets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Embedded React App
const REACT_APP_JS = `
import React from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';

const App = () => {
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: 'white',
      padding: '1rem'
    }
  }, [
    React.createElement('div', {
      key: 'container',
      style: {
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '1000px',
        width: '100%'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: { marginBottom: '3rem' }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: {
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #fff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }
        }, '🔗 Connectouch'),
        React.createElement('p', {
          key: 'subtitle',
          style: {
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            fontWeight: '300',
            marginBottom: '1rem',
            opacity: 0.9
          }
        }, 'Comprehensive Blockchain AI Platform'),
        React.createElement('p', {
          key: 'description',
          style: {
            fontSize: '1rem',
            opacity: 0.7,
            maxWidth: '600px',
            margin: '0 auto'
          }
        }, 'Advanced DeFi Analytics • NFT Insights • GameFi Hub • DAO Tools • Web3 Infrastructure')
      ]),
      React.createElement('div', {
        key: 'features',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }
      }, [
        React.createElement('div', {
          key: 'defi',
          style: {
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.3s ease'
          }
        }, [
          React.createElement('div', {
            key: 'icon',
            style: { fontSize: '3rem', marginBottom: '1rem' }
          }, '🏦'),
          React.createElement('h3', {
            key: 'title',
            style: { marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }
          }, 'DeFi Analytics'),
          React.createElement('p', {
            key: 'desc',
            style: { opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }
          }, 'Advanced protocol analysis, yield farming optimization, and liquidity tracking')
        ]),
        React.createElement('div', {
          key: 'nft',
          style: {
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }, [
          React.createElement('div', {
            key: 'icon',
            style: { fontSize: '3rem', marginBottom: '1rem' }
          }, '🎨'),
          React.createElement('h3', {
            key: 'title',
            style: { marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }
          }, 'NFT Insights'),
          React.createElement('p', {
            key: 'desc',
            style: { opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }
          }, 'Comprehensive market data, rarity analysis, and collection tracking')
        ]),
        React.createElement('div', {
          key: 'gamefi',
          style: {
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }, [
          React.createElement('div', {
            key: 'icon',
            style: { fontSize: '3rem', marginBottom: '1rem' }
          }, '🎮'),
          React.createElement('h3', {
            key: 'title',
            style: { marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }
          }, 'GameFi Hub'),
          React.createElement('p', {
            key: 'desc',
            style: { opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }
          }, 'Gaming economics, play-to-earn metrics, and blockchain integration')
        ]),
        React.createElement('div', {
          key: 'dao',
          style: {
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }, [
          React.createElement('div', {
            key: 'icon',
            style: { fontSize: '3rem', marginBottom: '1rem' }
          }, '🏛️'),
          React.createElement('h3', {
            key: 'title',
            style: { marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }
          }, 'DAO Tools'),
          React.createElement('p', {
            key: 'desc',
            style: { opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }
          }, 'Governance analytics, proposal tracking, and voting insights')
        ])
      ]),
      React.createElement('div', {
        key: 'status',
        style: {
          padding: '1.5rem',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          backdropFilter: 'blur(10px)'
        }
      }, [
        React.createElement('p', {
          key: 'text',
          style: {
            margin: 0,
            color: '#22c55e',
            fontWeight: '600',
            fontSize: '1.1rem'
          }
        }, '✅ Platform Successfully Deployed & Running'),
        React.createElement('p', {
          key: 'subtext',
          style: {
            margin: '0.5rem 0 0 0',
            color: '#86efac',
            fontSize: '0.9rem',
            opacity: 0.8
          }
        }, 'All systems operational • Ready for blockchain analysis')
      ])
    ])
  ]);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
`;

const APP_CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#root {
  min-height: 100vh;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/frontend', '') || '/'

    // Serve JavaScript
    if (path === '/app.js') {
      return new Response(REACT_APP_JS, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Serve CSS
    if (path === '/app.css') {
      return new Response(APP_CSS, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Serve HTML for all other routes
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Connectouch - Comprehensive Blockchain AI Platform for DeFi, NFTs, GameFi, DAOs, and Web3 Infrastructure" />
    <meta name="keywords" content="blockchain, AI, DeFi, NFT, GameFi, DAO, Web3, cryptocurrency, analytics" />
    <meta property="og:title" content="Connectouch - Blockchain AI Platform" />
    <meta property="og:description" content="Revolutionary AI-powered platform for comprehensive blockchain analysis and interaction" />
    <meta property="og:type" content="website" />
    <title>Connectouch - Comprehensive Blockchain AI Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./app.css" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
</body>
</html>`

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
