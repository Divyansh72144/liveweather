# 🚀 Production Deployment Guide

## Deployment Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐
│                         │         │                          │
│  Frontend (React)       │◄───────►│  Backend (Express.js)    │
│  Vercel / Netlify       │  HTTPS  │  Railway / Render        │
│                         │         │                          │
└─────────────────────────┘         └──────────────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │  Open-Meteo API │
                                        │  (Weather Data) │
                                        └─────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### ✅ Required Changes Before Deploying

1. **Update CORS Origins** in `backend/.env.production`
2. **Update Backend API URL** in `.env.production`
3. **Set NODE_ENV=production**
4. **Test locally with production settings**

---

## Part 1: Backend Deployment (Railway or Render)

### Option A: Railway (Recommended)

#### Step 1: Prepare Railway

1. Go to [railway.app](https://railway.app/)
2. Create account / Sign in
3. Click "New Project" → "Deploy from GitHub repo"

#### Step 2: Configure Backend

1. **Select your GitHub repository**
2. **Root Directory:** `backend`
3. **Build Command:** (leave empty - it's JavaScript)
4. **Start Command:** `node index.js`

#### Step 3: Set Environment Variables

In Railway Dashboard → Settings → Variables:

```env
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
OPENMETEO_API=https://api.open-meteo.com/v1/forecast
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000
INTERNAL_API_URL=https://your-backend.railway.app
```

**IMPORTANT:** After deployment, replace:
- `your-frontend.vercel.app` with your actual Vercel URL
- `your-backend.railway.app` with your actual Railway URL

#### Step 4: Deploy

Click "Deploy" and wait for it to finish.

#### Step 5: Get Your Backend URL

Your backend URL will be: `https://your-project-name.up.railway.app`

---

### Option B: Render

#### Step 1: Prepare Render

1. Go to [render.com](https://render.com/)
2. Create account / Sign in
3. Click "New" → "Web Service"

#### Step 2: Configure Backend

1. **Connect GitHub repository**
2. **Name:** hazard-map-backend
3. **Root Directory:** `backend`
4. **Runtime:** Node
5. **Build Command:** (leave empty)
6. **Start Command:** `node index.js`

#### Step 3: Set Environment Variables

In Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
OPENMETEO_API=https://api.open-meteo.com/v1/forecast
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000
INTERNAL_API_URL=https://your-backend.onrender.com
```

#### Step 4: Deploy

Click "Create Web Service" and wait for deployment.

#### Step 5: Get Your Backend URL

Your backend URL will be: `https://hazard-map-backend.onrender.com`

---

## Part 2: Frontend Deployment (Vercel or Netlify)

### Option A: Vercel (Recommended)

#### Step 1: Prepare Frontend

1. Go to [vercel.com](https://vercel.com/)
2. Create account / Sign in
3. Click "Add New..." → "Project"

#### Step 2: Import Repository

1. **Connect your GitHub repository**
2. **Framework Preset:** Vite
3. **Root Directory:** `./` (root of project)

#### Step 3: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
VITE_BACKEND_API_URL=https://your-backend.railway.app
```

#### Step 4: Deploy

Click "Deploy" and wait for it to finish.

#### Step 5: Get Your Frontend URL

Your frontend URL will be: `https://your-project-name.vercel.app`

---

### Option B: Netlify

#### Step 1: Prepare Frontend

1. Go to [netlify.com](https://www.netlify.com/)
2. Create account / Sign in
3. Click "Add new site" → "Import an existing project"

#### Step 2: Configure Build Settings

1. **Build command:** `npm run build`
2. **Publish directory:** `dist`
3. **Root directory:** `./`

#### Step 3: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

```env
VITE_BACKEND_API_URL=https://your-backend.railway.app
```

#### Step 4: Deploy

Click "Deploy site"

#### Step 5: Get Your Frontend URL

Your frontend URL will be: `https://your-site-name.netlify.app`

---

## Part 3: Post-Deployment Configuration

### ⚠️ CRITICAL: Update CORS Origins

After BOTH frontend and backend are deployed:

1. **Copy your frontend URL** (e.g., `https://hazard-map.vercel.app`)
2. **Go to Backend (Railway/Render) → Settings → Environment Variables**
3. **Update `ALLOWED_ORIGINS`:**

```env
ALLOWED_ORIGINS=https://hazard-map.vercel.app,https://www.hazard-map.vercel.app
```

4. **Update `INTERNAL_API_URL`:**

```env
INTERNAL_API_URL=https://hazard-map-backend.up.railway.app
```

5. **Redeploy backend** (Railway/Render will auto-redeploy on env var change)

---

## Part 4: Update Frontend Environment

### Go to Frontend (Vercel/Netlify) → Settings → Environment Variables

```env
VITE_BACKEND_API_URL=https://hazard-map-backend.up.railway.app
```

Redeploy frontend if needed.

---

## 🔍 Testing Your Production Deployment

### 1. Test Backend Health

```bash
curl https://your-backend.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "cache": {
    "totalCities": 496,
    "fresh": 496,
    "stale": 0
  }
}
```

### 2. Test Weather Endpoint

```bash
curl https://your-backend.railway.app/weather
```

**Expected:** JSON with weather data for all cities

### 3. Test Frontend

Open your frontend URL in browser:
- Check console for errors
- Verify weather data loads
- Check map displays correctly

### 4. Test CORS

Open browser console on your frontend:
- Check for CORS errors
- Verify weather data loads successfully

---

## ⚠️ Common Issues & Solutions

### Issue 1: CORS Errors

**Symptoms:** Browser console shows CORS policy errors

**Solution:**
1. Check backend `ALLOWED_ORIGINS` includes your frontend domain
2. Ensure both HTTP and HTTPS are handled (prefer HTTPS only)
3. Redeploy backend after updating env vars

### Issue 2: Rate Limit Errors

**Symptoms:** "Too many requests" error

**Solution:**
1. Increase `RATE_LIMIT_MAX` in backend env vars
2. Or reduce `RATE_LIMIT_WINDOW`
3. Monitor traffic and adjust accordingly

### Issue 3: Backend Returns 404

**Symptoms:** Frontend can't reach `/weather` endpoint

**Solution:**
1. Check `VITE_BACKEND_API_URL` in frontend env vars
2. Verify backend is deployed and running
3. Check backend logs for errors

### Issue 4: No Weather Data Loading

**Symptoms:** App loads but shows no weather data

**Solution:**
1. Check browser console for errors
2. Verify backend `/health` endpoint works
3. Check if cache has warmed up (wait ~30 seconds after deployment)

---

## 📊 Production Monitoring

### Backend Health Checks

Add these URLs to your monitoring:

```bash
# Health check
https://your-backend.railway.app/health

# Cache status
https://your-backend.railway.app/weather
```

### What to Monitor

1. **Backend Uptime** - Use UptimeRobot or similar
2. **Response Times** - Should be < 2 seconds
3. **Error Rates** - Monitor 4xx/5xx responses
4. **Rate Limit Hits** - Adjust if users are blocked

---

## 🔒 Production Security Checklist

- [ ] NODE_ENV=production
- [ ] CORS restricted to frontend domain only
- [ ] HTTPS enabled on both frontend and backend
- [ ] Rate limiting enabled
- [ ] No .env files committed to git
- [ ] Backend health endpoint is public (for monitoring)
- [ ] Error messages don't leak sensitive info
- [ ] Security headers are present

---

## 💰 Cost Estimates (Free Tier)

### Railway
- **Free:** $5/month credit (enough for this project)
- **Paid:** $5/month after free credit expires

### Render
- **Free:** Available with limits (spins down after 15min inactivity)
- **Paid:** $7/month for continuous service

### Vercel
- **Free:** Generous free tier (perfect for this project)
- **Paid:** $20/month for Pro features

### Netlify
- **Free:** Generous free tier (perfect for this project)
- **Paid:** $19/month for Pro features

**Total Cost:** **$0-7/month** depending on platform choices

---

## 🚀 Quick Start Commands

### Railway + Vercel (Recommended)

```bash
# 1. Deploy backend to Railway
# Go to railway.app → New Project → Select repo
# Configure settings as above

# 2. Get backend URL
# https://your-project.up.railway.app

# 3. Deploy frontend to Vercel
# Go to vercel.com → New Project → Select repo
# Set VITE_BACKEND_API_URL

# 4. Get frontend URL
# https://your-project.vercel.app

# 5. Update backend ALLOWED_ORIGINS
# In Railway settings, add your Vercel URL

# 6. Redeploy backend (automatic)
```

---

## 📝 Environment Variables Summary

### Backend (Railway/Render)

```env
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
OPENMETEO_API=https://api.open-meteo.com/v1/forecast
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000
INTERNAL_API_URL=https://your-backend.railway.app
```

### Frontend (Vercel/Netlify)

```env
VITE_BACKEND_API_URL=https://your-backend.railway.app
```

---

## ✅ Final Verification

Before announcing your app is live:

1. [ ] Frontend loads without errors
2. [ ] Map displays correctly
3. [ ] Weather data loads for cities
4. [ ] No CORS errors in console
5. [ ] Backend health endpoint returns 200
6. [ ] Rate limiting is working (try rapid refresh)
7. [ ] HTTPS is enabled everywhere
8. [ ] Cache refreshes every 2 hours

---

## 🆘 Need Help?

If you encounter issues:

1. **Check logs:** Railway/Render/Vercel dashboards have detailed logs
2. **Test locally:** Use production env vars locally to test
3. **Verify URLs:** Make sure all URLs are correct and HTTPS
4. **Check CORS:** Most common issue - double-check origins

---

## 🎉 You're Live!

Once deployed, your users can access your app at:
**https://your-frontend.vercel.app**

**IMPORTANT:** After first deployment, wait ~30 seconds for the cache to pre-warm before testing.
