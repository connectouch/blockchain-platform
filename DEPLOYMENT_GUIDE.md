# 🚀 Connectouch Blockchain AI Platform - Netlify Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the Connectouch Blockchain AI Platform to production using:
- **Frontend**: Netlify (Static Site Hosting)
- **Backend**: Railway (Backend API Hosting)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Netlify       │    │   Railway       │    │  External APIs  │
│   (Frontend)    │───▶│   (Backend)     │───▶│  CoinMarketCap  │
│                 │    │                 │    │  Alchemy        │
│   React/Vite    │    │   Node.js/TS    │    │  OpenAI         │
│   Static Assets │    │   Express API   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Prerequisites

1. **Netlify Account**: [Sign up at netlify.com](https://netlify.com)
2. **Railway Account**: [Sign up at railway.app](https://railway.app)
3. **GitHub Repository**: Code must be in a GitHub repository
4. **API Keys**: 
   - OpenAI API Key
   - Alchemy API Key  
   - CoinMarketCap API Key

## 📦 Step 1: Backend Deployment (Railway)

### 1.1 Deploy to Railway

1. **Connect GitHub Repository**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose `apps/backend` as the root directory

2. **Configure Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=$PORT
   OPENAI_API_KEY=your_openai_api_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
   JWT_SECRET=your_secure_jwt_secret_here
   ENCRYPTION_KEY=your_secure_encryption_key_here
   CORS_ORIGIN=https://your-netlify-domain.netlify.app
   ```

3. **Deploy Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `apps/backend`

### 1.2 Get Backend URL

After deployment, Railway will provide a URL like:
`https://connectouch-backend-production.up.railway.app`

## 🌐 Step 2: Frontend Deployment (Netlify)

### 2.1 Prepare Frontend Configuration

1. **Update Environment Variables**:
   Edit `apps/frontend/.env.production`:
   ```bash
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_AI_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_BACKEND_URL=https://your-railway-backend-url.railway.app
   VITE_WS_URL=wss://your-railway-backend-url.railway.app
   ```

### 2.2 Deploy to Netlify

1. **Connect GitHub Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Build Settings**:
   ```bash
   Base directory: apps/frontend
   Build command: npm run build:netlify
   Publish directory: apps/frontend/dist
   ```

3. **Environment Variables** (in Netlify dashboard):
   ```bash
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_AI_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_BACKEND_URL=https://your-railway-backend-url.railway.app
   VITE_WS_URL=wss://your-railway-backend-url.railway.app
   VITE_NODE_ENV=production
   VITE_DEBUG=false
   ```

## 🔐 Step 3: Security Configuration

### 3.1 Update CORS Settings

Update Railway backend environment variables:
```bash
CORS_ORIGIN=https://your-netlify-domain.netlify.app,https://main--your-netlify-domain.netlify.app
```

### 3.2 API Key Security

- ✅ **DO**: Store API keys in Railway environment variables
- ❌ **DON'T**: Include API keys in frontend code
- ✅ **DO**: Use HTTPS for all communications
- ✅ **DO**: Enable rate limiting in production

## 🧪 Step 4: Testing Deployment

### 4.1 Health Checks

1. **Backend Health**: `https://your-railway-backend.railway.app/health`
2. **Frontend Access**: `https://your-netlify-domain.netlify.app`

### 4.2 Feature Testing

- [ ] Running Price Ticker displays at top
- [ ] Connection Monitor shows all services healthy
- [ ] Real-time data updates work
- [ ] AI chat functionality works
- [ ] All pages load without errors

## 🔄 Step 5: Continuous Deployment

### 5.1 Automatic Deployments

Both Netlify and Railway will automatically deploy when you push to your main branch.

### 5.2 Environment-Specific Deployments

- **Development**: Local development servers
- **Staging**: Deploy to separate Netlify/Railway instances
- **Production**: Main deployment instances

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Monitoring Tools

- **Netlify**: Built-in analytics and deployment logs
- **Railway**: Application metrics and logs
- **External**: Consider adding Sentry for error tracking

### 6.2 Performance Optimization

- **Frontend**: Netlify CDN automatically optimizes static assets
- **Backend**: Railway provides automatic scaling
- **Database**: Consider adding Redis for caching if needed

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS_ORIGIN in Railway
2. **API Connection Failed**: Check backend URL in frontend env vars
3. **Build Failures**: Check Node.js version compatibility
4. **Rate Limiting**: Adjust rate limits in backend configuration

### Debug Steps

1. Check Netlify deploy logs
2. Check Railway application logs
3. Test API endpoints directly
4. Verify environment variables

## 📝 Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend built successfully
- [ ] Frontend deployed to Netlify
- [ ] CORS configured correctly
- [ ] Health checks passing
- [ ] All features tested
- [ ] Monitoring configured
- [ ] Domain configured (optional)
- [ ] SSL certificates active

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Configure custom domain in Netlify
2. **Analytics**: Set up Google Analytics or similar
3. **Error Monitoring**: Add Sentry or similar service
4. **Performance Monitoring**: Monitor Core Web Vitals
5. **Backup Strategy**: Implement data backup procedures

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review Netlify/Railway documentation
3. Check GitHub Issues
4. Contact support if needed

---

**🎉 Congratulations! Your Connectouch Blockchain AI Platform is now live in production!**
