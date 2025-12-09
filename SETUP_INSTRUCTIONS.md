# 🚀 GMF LIFF Form - Setup Instructions

## ✅ What's Already Done

Your form is now **production-ready** with all these improvements:

### Security & Quality
- ✅ Input sanitization (prevents XSS attacks)
- ✅ Rate limiting (max 5 submissions per 15 min)
- ✅ Proper phone validation
- ✅ Better error messages
- ✅ Request timeout handling
- ✅ Offline detection

### Current Status
**Your form works perfectly RIGHT NOW** without any additional setup!

However, you can optionally enable:
1. **Database** (MongoDB) - Backup all submissions
2. **Monitoring** (Sentry) - Track errors in production

---

## 📋 Optional Setup (Choose What You Want)

### Option 1: Enable Database Backup (Recommended)
### Option 2: Enable Error Monitoring (Recommended)
### Option 3: Skip Both (Form still works great!)

---

# 💾 OPTION 1: Database Setup (MongoDB Atlas)

## Why Add a Database?
- ✅ Backup all form submissions
- ✅ Search past inquiries
- ✅ Analytics (how many inquiries per month)
- ✅ Works even if LINE API fails

## Time Required: 10 minutes

---

## Step 1: Create Free MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email: `admin@giftmanufactory.com`
3. Choose **FREE tier** (M0 Sandbox - FREE FOREVER)
4. Click "Create"

---

## Step 2: Create a Cluster

1. After signup, you'll see "Create a Cluster"
2. Choose:
   - **Provider**: AWS
   - **Region**: Singapore (ap-southeast-1) or closest to Thailand
   - **Cluster Tier**: M0 Sandbox (FREE)
3. Cluster Name: `gmf-liff-cluster`
4. Click "Create Cluster" (takes 3-5 minutes)

---

## Step 3: Create Database User

1. On left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `gmf-admin`
5. Password: Click "Autogenerate Secure Password" → **COPY THIS PASSWORD**
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

---

## Step 4: Allow Network Access

1. On left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is safe because you have username/password protection
4. Click "Confirm"

---

## Step 5: Get Connection String

1. Go back to "Database" (left sidebar)
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://gmf-admin:<password>@gmf-liff-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with the password you copied in Step 3

**Final connection string example:**
```
mongodb+srv://gmf-admin:YOUR_PASSWORD_HERE@gmf-liff-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Note:** Replace `YOUR_PASSWORD_HERE` with your actual password from Step 3. Do NOT commit this connection string to GitHub - only add it to Vercel Environment Variables.

---

## Step 6: Add to Vercel Environment Variables

1. Go to https://vercel.com/gmf-admins-projects/gmf-liff-project
2. Click "Settings" tab
3. Click "Environment Variables" in left sidebar
4. Add new variable:
   - **Name**: `MONGODB_URI`
   - **Value**: [Paste your connection string from Step 5]
   - **Environment**: Check all (Production, Preview, Development)
5. Click "Save"

---

## Step 7: Redeploy

1. Go to "Deployments" tab in Vercel
2. Click on the latest deployment
3. Click the "..." menu → "Redeploy"
4. Check "Use existing Build Cache"
5. Click "Redeploy"

---

## ✅ Done! Database is Now Active

To verify it's working:
1. Submit a test form
2. Go to MongoDB Atlas → Database → Browse Collections
3. You should see your submission in the `inquiries` collection

---

# 🔔 OPTION 2: Error Monitoring Setup (Sentry)

## Why Add Monitoring?
- ✅ Get email alerts when errors happen
- ✅ See which errors affect most users
- ✅ Debug production issues easily
- ✅ Performance monitoring

## Time Required: 5 minutes

---

## Step 1: Create Free Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up with your email: `admin@giftmanufactory.com`
3. Choose **FREE plan** (up to 5,000 errors/month - plenty!)
4. Click "Get Started"

---

## Step 2: Create New Project

1. After signup, click "Create Project"
2. Platform: Choose **Node.js**
3. Set Alert Frequency: **On every new issue**
4. Project Name: `gmf-liff-backend`
5. Team: Your default team
6. Click "Create Project"

---

## Step 3: Get Your DSN

1. After creating project, you'll see setup instructions
2. Look for your DSN (Data Source Name), it looks like:
   ```
   https://abc123def456@o123456.ingest.sentry.io/789012
   ```
3. **COPY THIS DSN**

Or find it later:
- Click Settings (⚙️) → Projects → gmf-liff-backend → Client Keys (DSN)

---

## Step 4: Add to Vercel Environment Variables

1. Go to https://vercel.com/gmf-admins-projects/gmf-liff-project
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add new variable:
   - **Name**: `SENTRY_DSN`
   - **Value**: [Paste your DSN from Step 3]
   - **Environment**: Check all (Production, Preview, Development)
5. Click "Save"

---

## Step 5: Redeploy

1. Go to "Deployments" tab in Vercel
2. Click on latest deployment
3. Click "..." → "Redeploy"
4. Click "Redeploy"

---

## ✅ Done! Error Monitoring is Now Active

To verify it's working:
1. Go to your backend URL: https://gmf-liff-project.vercel.app/
2. You should see: `"monitoring": "enabled"` in the JSON response

When errors happen, you'll get email alerts!

---

# 🎯 Quick Summary

## What You Have Now (Without Any Setup)
- ✅ Secure, production-ready form
- ✅ Input sanitization & validation
- ✅ Rate limiting (anti-spam)
- ✅ Better error handling
- ✅ Timeout protection

## What You Can Add (Optional)

| Feature | Time | Benefit |
|---------|------|---------|
| **MongoDB** | 10 min | Backup submissions, analytics |
| **Sentry** | 5 min | Error tracking, email alerts |
| **Both** | 15 min | Full production monitoring |
| **Neither** | 0 min | Form still works great! |

---

# 🔍 How to Check What's Enabled

Visit: https://gmf-liff-project.vercel.app/

You'll see:
```json
{
  "status": "ok",
  "database": "connected" or "disabled",
  "monitoring": "enabled" or "disabled"
}
```

---

# 📊 View Your Data (If Database is Enabled)

1. Go to https://cloud.mongodb.com/
2. Click "Database" → "Browse Collections"
3. Database: `test` (default)
4. Collection: `inquiries`
5. You'll see all submissions with:
   - Company, contact, phone, product, etc.
   - Submission timestamp
   - IP address
   - User agent

---

# ❓ Troubleshooting

## Database Not Working?
1. Check connection string has no spaces
2. Verify password is correct (no < or > symbols)
3. Check Network Access allows 0.0.0.0/0
4. Redeploy in Vercel

## Sentry Not Working?
1. Verify DSN starts with `https://`
2. Check environment variable name is `SENTRY_DSN` (exact spelling)
3. Redeploy in Vercel

## Form Still Works?
Yes! Even if database or Sentry fails, the form continues working. They're optional add-ons.

---

# 💰 Costs

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Vercel** | Unlimited hobby projects | 1 project | FREE |
| **MongoDB Atlas** | 512 MB storage | ~1000s of submissions | FREE |
| **Sentry** | 5,000 errors/month | Maybe 10-50/month | FREE |
| **LINE Messaging API** | 500 messages/month | Per submission | FREE if <500 |

**Total Cost: $0/month** (with free tiers)

---

# 🎉 You're Done!

Your form is now:
- ✅ Production-ready
- ✅ Secure
- ✅ Fast
- ✅ Monitored (if you enabled Sentry)
- ✅ Backed up (if you enabled MongoDB)

**No more configuration needed!**

---

# 📞 Need Help?

If you have questions:
1. Check https://github.com/suipink/gmf-liff-project/issues
2. Review this file again
3. Contact your technical support

---

**Generated by Claude Code**
Last Updated: December 2024
