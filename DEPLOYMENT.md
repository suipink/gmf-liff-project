# Deployment Guide - GMF LIFF Project

## Prerequisites

- GitHub account
- Render account (https://render.com)
- LINE Developers account with Channel Access Token

## Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files (.env will be automatically excluded by .gitignore)
git add .

# Verify .env is NOT included
git status

# Commit your code
git commit -m "Initial commit - GMF LIFF project"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Automatic)

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**
6. **IMPORTANT:** Add environment variables:
   - Go to your service dashboard
   - Click **"Environment"** tab
   - Add: `CHANNEL_ACCESS_TOKEN` = `[Your LINE Channel Access Token]`
   - The token is in your local `.env` file
7. Click **"Save Changes"** - Render will redeploy

### Option B: Manual Setup

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** gmf-liff-backend
   - **Region:** Singapore (or closest to you)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Advanced"** → Add Environment Variables:
   - `CHANNEL_ACCESS_TOKEN` = `[Your LINE Channel Access Token]`
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
6. Click **"Create Web Service"**

## Step 3: Get Your Backend URL

After deployment completes:
- Your backend URL will be: `https://gmf-liff-backend.onrender.com`
- Test it: Visit `https://gmf-liff-backend.onrender.com/` (should show "ok")
- Copy this URL for Step 4

## Step 4: Update Frontend Configuration

1. Open `frontend/main.js`
2. Update the configuration:
   ```javascript
   const LIFF_ID = "YOUR_LIFF_ID_HERE";
   const BACKEND_URL = "https://gmf-liff-backend.onrender.com"; // Your Render URL
   ```
3. Commit and push:
   ```bash
   git add frontend/main.js
   git commit -m "Update backend URL for production"
   git push
   ```

## Step 5: Deploy Frontend

You have several options for hosting the static frontend:

### Option 1: GitHub Pages (Free)
```bash
# From your repository settings on GitHub:
# Settings → Pages → Source: Deploy from branch → Select 'main' → /frontend
```

### Option 2: Render Static Site
1. Create new **"Static Site"** on Render
2. Connect same GitHub repo
3. Set **"Publish Directory"** to `frontend`

### Option 3: Netlify / Vercel
- Drag and drop the `frontend` folder

## Step 6: Configure LINE LIFF

1. Go to LINE Developers Console
2. Select your Messaging API Channel
3. Go to **"LIFF"** tab
4. Click **"Add"** to create new LIFF app:
   - **LIFF app name:** GMF Client Form
   - **Size:** Full
   - **Endpoint URL:** `[Your frontend URL]` (from Step 5)
   - **Scope:** `profile` (checked)
5. Click **"Add"**
6. Copy the **LIFF ID** (format: `1234567890-abcdefgh`)
7. Update `frontend/main.js`:
   ```javascript
   const LIFF_ID = "1234567890-abcdefgh"; // Your actual LIFF ID
   ```
8. Commit and push the change

## Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → Logs tab
- Verify environment variables are set correctly
- Test health endpoint: `https://your-backend.onrender.com/`

### Frontend Issues
- Check browser console for errors
- Verify LIFF_ID and BACKEND_URL are correct
- Ensure LIFF endpoint URL matches your deployed frontend

### CORS Issues
- The backend already has CORS enabled (`app.use(cors())`)
- If issues persist, update backend/server.js:
  ```javascript
  app.use(cors({
    origin: 'https://your-frontend-url.com'
  }));
  ```

## Important Notes

- **FREE TIER LIMITATION:** Render free tier may spin down after inactivity
  - First request after inactivity takes ~30 seconds
  - Consider upgrading if you need instant responses
- **Never commit `.env` files** - they're protected by `.gitignore`
- **Environment variables** are set in Render dashboard, not in code
- **Keep your Channel Access Token secret** - never share or commit it

## Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ Environment variables set in Render dashboard
- ✅ No secrets committed to GitHub
- ✅ HTTPS enabled (automatic on Render)
- ✅ CORS configured for your frontend only (optional hardening)
