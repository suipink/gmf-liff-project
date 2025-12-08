# 📋 GMF LIFF Client Form

A complete LINE Front-end Framework (LIFF) application that enables clients to submit orders directly from LINE Official Account, with automatic notification back to the same chat.

---

## 📚 Table of Contents

1. [What is This Project?](#what-is-this-project)
2. [How Does LIFF Work?](#how-does-liff-work)
3. [Why Two Different LINE Channels?](#why-two-different-line-channels)
4. [Project Architecture](#project-architecture)
5. [Prerequisites](#prerequisites)
6. [LINE Developer Setup](#line-developer-setup)
7. [Backend Setup](#backend-setup)
8. [Frontend Setup](#frontend-setup)
9. [Deployment Guide](#deployment-guide)
10. [Testing the Application](#testing-the-application)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## 🎯 What is This Project?

This project creates a seamless order submission experience for your clients through LINE:

**The User Flow:**
1. Your sales representative sends a special link (LIFF URL) in your LINE Official Account chat
2. Client clicks the link and a form opens **inside LINE** (not in a browser)
3. Client fills out the order form (company, contact, product, quantity, etc.)
4. Client submits the form
5. The backend server processes the submission
6. A beautifully formatted confirmation message is automatically sent **back to the same LINE chat**

**Why is this useful?**
- Clients never leave LINE - seamless experience
- No need for separate apps or complex forms
- Automatic confirmation in the chat history
- Sales team can easily track submissions
- All data is captured with the client's LINE User ID

---

## 🔍 How Does LIFF Work?

**LIFF (LINE Front-end Framework)** is a special technology from LINE that allows you to run web applications inside the LINE app.

### The Magic Behind LIFF

1. **It's a Web App**: Your LIFF form is just HTML, CSS, and JavaScript (like any website)
2. **Runs Inside LINE**: When users click a LIFF link, it opens inside the LINE app (not Safari or Chrome)
3. **Access to LINE Data**: LIFF can access user information like:
   - User ID (unique identifier)
   - Display name
   - Profile picture
   - Email (if user grants permission)

4. **Seamless Experience**: Users don't realize they're using a web app - it feels native to LINE

### Simple Analogy
Think of LIFF like an "iframe inside LINE":
- Regular website: Opens in a browser
- LIFF website: Opens in LINE's built-in browser with special powers

---

## 🔐 Why Two Different LINE Channels?

This is one of the most confusing parts for beginners. You need **TWO** separate channels in LINE Developers:

### 1. LINE Login Channel (for LIFF)
**Purpose**: Lets users authenticate and allows your app to identify them

**What it does:**
- Provides the LIFF platform
- Handles user login
- Gives you access to user profiles
- Returns the user's LINE User ID

**Think of it as**: The "identity checker" that tells you who's using your form

### 2. Messaging API Channel (for sending messages)
**Purpose**: Allows your backend server to send messages to users

**What it does:**
- Gives you a Channel Access Token
- Lets your server call LINE's API
- Enables push messages to users
- Powers the confirmation message

**Think of it as**: The "messenger" that sends the confirmation back to the chat

### Why Can't We Use Just One?
- **LIFF** (LOGIN channel) can only **receive** information (read user profile)
- **Messaging API** can only **send** information (send messages)
- They serve different purposes and must work together

### The Flow with Both Channels:
```
User clicks LIFF link
    ↓
[LOGIN Channel] identifies user and gets User ID
    ↓
Form submits to backend with User ID
    ↓
[MESSAGING API Channel] sends confirmation message back
    ↓
User sees message in LINE chat
```

---

## 🏗️ Project Architecture

```
Client (LINE App)
    ↓
    ↓ (1) Clicks LIFF link
    ↓
LIFF Frontend (hosted on Vercel/Netlify)
    ↓
    ↓ (2) Gets user profile via LIFF SDK
    ↓
    ↓ (3) Submits form + userId
    ↓
Backend Server (hosted on Render/Railway)
    ↓
    ↓ (4) Formats message
    ↓
    ↓ (5) Calls LINE Messaging API
    ↓
LINE Messaging API
    ↓
    ↓ (6) Delivers message to user
    ↓
Client sees confirmation in LINE chat
```

### Technology Stack

**Frontend (LIFF):**
- HTML5
- JavaScript (ES6+)
- LIFF SDK v2
- CSS3

**Backend:**
- Node.js
- Express.js
- Axios (for HTTP requests)
- dotenv (for environment variables)

**APIs:**
- LINE LIFF API (for user authentication)
- LINE Messaging API (for push messages)

---

## ✅ Prerequisites

Before starting, make sure you have:

### Required Accounts
- [ ] A LINE account (download LINE app on your phone)
- [ ] A LINE Official Account (create at: https://manager.line.biz/)
- [ ] A LINE Developers account (create at: https://developers.line.biz/)

### Required Software (for backend development)
- [ ] Node.js installed (version 14 or higher)
  - Check by running: `node --version`
  - Download from: https://nodejs.org/

- [ ] A code editor (VS Code recommended)
  - Download from: https://code.visualstudio.com/

- [ ] Git (optional, but helpful)
  - Check by running: `git --version`
  - Download from: https://git-scm.com/

### Required for Deployment
- [ ] GitHub account (for hosting code)
- [ ] Vercel or Netlify account (for frontend hosting)
- [ ] Render or Railway account (for backend hosting)

---

## 🚀 LINE Developer Setup

This is the most important part. Follow these steps carefully.

### Step 1: Create a LINE Login Channel (for LIFF)

1. **Go to LINE Developers Console**
   - Visit: https://developers.line.biz/console/
   - Log in with your LINE account

2. **Create a Provider**
   - Click **"Create a new provider"**
   - Enter a provider name (e.g., "GMF Company")
   - Click **"Create"**

3. **Create a LINE Login Channel**
   - Click on your provider name
   - Click **"Create a new channel"**
   - Select **"LINE Login"** (NOT Messaging API yet!)
   - Fill in the required information:
     - **Channel name**: "GMF Client Form"
     - **Channel description**: "LIFF form for client orders"
     - **App types**: Check "Web app"
   - Agree to terms and click **"Create"**

4. **Add LIFF App**
   - Go to your LINE Login channel
   - Click the **"LIFF"** tab
   - Click **"Add"**
   - Fill in LIFF settings:
     - **LIFF app name**: "Client Order Form"
     - **Size**: Full
     - **Endpoint URL**: `https://YOUR-FRONTEND-URL.vercel.app/` (you'll update this later)
     - **Scope**: Check "profile" and "openid"
     - **Bot link feature**: OFF (for now)
   - Click **"Add"**

5. **Save Your LIFF ID**
   - After creating, you'll see your **LIFF ID**
   - It looks like: `1234567890-AbCdEfGh`
   - **COPY THIS** - you'll need it later!

### Step 2: Create a Messaging API Channel (for Push Messages)

1. **Go Back to Provider**
   - Return to your provider page
   - Click **"Create a new channel"** again

2. **Create Messaging API Channel**
   - This time, select **"Messaging API"**
   - Fill in the information:
     - **Channel name**: "GMF OA Messenger" (or any name)
     - **Channel description**: "For sending order confirmations"
     - **Category**: Choose appropriate category
     - **Subcategory**: Choose appropriate subcategory
   - Agree to terms and click **"Create"**

3. **Get Your Channel Access Token**
   - Go to your Messaging API channel
   - Click the **"Messaging API"** tab
   - Scroll down to **"Channel access token"**
   - Click **"Issue"** button
   - **COPY THIS TOKEN** - you'll need it for the backend!
   - It's a long string like: `xyz123abc456...`

4. **Disable Auto-Reply (Important!)**
   - In the same page, find **"Auto-reply messages"**
   - Click the link to LINE Official Account Manager
   - Turn OFF auto-reply messages
   - This prevents duplicate messages

### Step 3: Link Your Channels (Optional but Recommended)

If you want the LIFF form to be associated with your Official Account:

1. Go back to your **LINE Login Channel**
2. Click **"LIFF"** tab
3. Click on your LIFF app
4. Enable **"Bot link feature"**
5. Select your **Messaging API channel**
6. Save

This makes the user experience more seamless.

### ⚠️ Important Notes

- **Keep your tokens SECRET**: Never share them publicly or commit to GitHub
- **Channel Access Token**: Used by backend to send messages
- **LIFF ID**: Used by frontend to initialize LIFF
- These are two different things for two different purposes!

---

## 🖥️ Backend Setup

Now let's set up the backend server that will process form submissions.

### Step 1: Navigate to Backend Folder

Open your terminal (or command prompt) and navigate to the backend folder:

```bash
cd gmf-liff-project/backend
```

### Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Allow cross-origin requests from LIFF
- `dotenv` - Load environment variables
- `axios` - Make HTTP requests to LINE API

### Step 3: Create Environment File

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file:**
   Open `.env` in your code editor and replace the placeholder:

   ```env
   CHANNEL_ACCESS_TOKEN=YOUR_ACTUAL_TOKEN_HERE
   PORT=3000
   ```

   Replace `YOUR_ACTUAL_TOKEN_HERE` with the **Channel Access Token** you copied from the Messaging API channel.

   Example:
   ```env
   CHANNEL_ACCESS_TOKEN=xyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890
   PORT=3000
   ```

### Step 4: Test Locally

Start the server:

```bash
npm start
```

You should see:
```
🚀 GMF LIFF Backend Server started
📍 Running on port: 3000
🌐 Health check: http://localhost:3000/
✅ Ready to receive form submissions
```

Open your browser and visit: `http://localhost:3000/`

You should see:
```json
{
  "status": "ok",
  "message": "GMF LIFF Backend is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

If you see this, your backend is working! ✅

Press `Ctrl+C` to stop the server.

---

## 🎨 Frontend Setup

Now let's prepare the frontend LIFF form.

### Step 1: Update Configuration

Navigate to the frontend folder and open `main.js`:

```bash
cd ../frontend
```

Open `frontend/main.js` in your code editor.

### Step 2: Replace Placeholders

Find these lines at the top of `main.js`:

```javascript
const LIFF_ID = "YOUR_LIFF_ID_HERE";
const BACKEND_URL = "https://YOUR_BACKEND_DOMAIN";
```

Replace them with your actual values:

```javascript
const LIFF_ID = "1234567890-AbCdEfGh";  // Your LIFF ID from Step 1
const BACKEND_URL = "https://your-backend.onrender.com";  // Your deployed backend URL
```

**Note**: You'll need to deploy the backend first to get the `BACKEND_URL`. We'll do that in the next section.

### Step 3: Test Locally (Optional)

You can test the frontend locally using any simple HTTP server:

**Option A: Using Python 3:**
```bash
python3 -m http.server 8000
```

**Option B: Using Node.js `http-server`:**
```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000/index.html`

**Note**: LIFF won't fully work locally because it needs to be accessed via a LIFF link. But you can check if the page loads correctly.

---

## 🌐 Deployment Guide

Time to make your application live on the internet!

---

### 🔴 Backend Deployment

You need to deploy the backend first so you have a URL to use in the frontend.

#### Option A: Deploy to Render (Recommended for Beginners)

1. **Create Render Account**
   - Visit: https://render.com/
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository (or upload the backend folder)
   - Configure:
     - **Name**: `gmf-liff-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables**
   - Scroll down to **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Add:
     ```
     Key: CHANNEL_ACCESS_TOKEN
     Value: [Your Messaging API Channel Access Token]
     ```
   - The `PORT` variable is automatically set by Render

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait 2-3 minutes for deployment
   - Your backend URL will be: `https://gmf-liff-backend.onrender.com`
   - **COPY THIS URL** - you need it for the frontend!

5. **Test Your Backend**
   - Visit: `https://gmf-liff-backend.onrender.com/`
   - You should see the health check JSON response

#### Option B: Deploy to Railway

1. **Create Railway Account**
   - Visit: https://railway.app/
   - Sign up with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Select your repository
   - Railway will auto-detect it's a Node.js app

3. **Add Environment Variables**
   - Click on your service
   - Go to **"Variables"** tab
   - Click **"New Variable"**
   - Add:
     ```
     CHANNEL_ACCESS_TOKEN=[Your token]
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Click on your service to get the public URL
   - **COPY THIS URL** for the frontend

5. **Test**
   - Visit your Railway URL
   - Check the health endpoint

---

### 🟢 Frontend Deployment

#### Option A: Deploy to Vercel (Easiest)

1. **Update Configuration First**
   - Open `frontend/main.js`
   - Replace `BACKEND_URL` with your deployed backend URL:
     ```javascript
     const BACKEND_URL = "https://gmf-liff-backend.onrender.com";
     ```
   - Replace `LIFF_ID` with your actual LIFF ID

2. **Create Vercel Account**
   - Visit: https://vercel.com/
   - Sign up with GitHub

3. **Deploy Frontend**
   - Click **"Add New..."** → **"Project"**
   - Import your repository
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: `frontend`
     - Leave other settings as default
   - Click **"Deploy"**

4. **Get Your Frontend URL**
   - After deployment, you'll get a URL like:
     ```
     https://gmf-liff-project.vercel.app
     ```
   - **COPY THIS URL** - you need it for the LIFF endpoint!

#### Option B: Deploy to Netlify

1. **Update Configuration**
   - Same as Vercel - update `LIFF_ID` and `BACKEND_URL`

2. **Create Netlify Account**
   - Visit: https://www.netlify.com/
   - Sign up with GitHub

3. **Deploy**
   - Drag and drop the entire `frontend` folder into Netlify
   - Or connect via GitHub
   - Netlify will automatically deploy

4. **Get Your URL**
   - You'll get: `https://gmf-liff-project.netlify.app`
   - **COPY THIS URL**

---

### 🔧 Update LIFF Endpoint URL

**VERY IMPORTANT**: After deploying the frontend, you must update the LIFF endpoint URL!

1. **Go to LINE Developers Console**
   - Visit: https://developers.line.biz/console/

2. **Open Your LINE Login Channel**
   - Select your provider
   - Click on your LINE Login channel

3. **Edit LIFF Endpoint**
   - Go to **"LIFF"** tab
   - Click on your LIFF app
   - Click **"Edit"**
   - Update **"Endpoint URL"** to your deployed frontend URL:
     ```
     https://gmf-liff-project.vercel.app
     ```
   - Click **"Update"**

4. **Done!**
   - Your LIFF app now points to your deployed frontend

---

## 🧪 Testing the Application

Now the moment of truth - let's test everything!

### Step 1: Get Your LIFF URL

Your LIFF URL format is:
```
https://liff.line.me/[LIFF_ID]
```

For example:
```
https://liff.line.me/1234567890-AbCdEfGh
```

### Step 2: Send LIFF Link in LINE OA

1. **Open LINE Official Account Manager**
   - Visit: https://manager.line.biz/
   - Select your Official Account

2. **Send Message to Yourself**
   - Go to **"Chat"** section
   - Add yourself as a friend (scan your OA QR code)
   - In the chat, type the LIFF URL:
     ```
     https://liff.line.me/1234567890-AbCdEfGh
     ```
   - Send the message

### Step 3: Click the LIFF Link

1. **In LINE App** (on your phone)
   - Go to the chat with your Official Account
   - Click on the LIFF link you just sent
   - The form should open **inside LINE**

2. **If prompted to login**
   - Click "Agree" to let the app access your profile
   - This only happens the first time

### Step 4: Fill Out the Form

Fill in the form with test data:
- **Company**: Test Company Ltd.
- **Contact**: John Doe
- **Product**: Widget Pro
- **Quantity**: 100
- **Target Delivery**: (select a date)
- **Notes**: This is a test order

Click **"Submit Order"**

### Step 5: Check for Confirmation Message

Within a few seconds, you should receive a message in **the same LINE chat** that looks like:

```
📌 New Client Submission

🏢 Company: Test Company Ltd.
👤 Contact: John Doe
📦 Product: Widget Pro
🔢 Quantity: 100
📅 Target Delivery: February 15, 2025
📝 Notes:
This is a test order

(From LINE user: U1234567890abcdef...)
```

### ✅ Success Criteria

- [ ] LIFF link opens the form inside LINE (not external browser)
- [ ] Form fields are visible and editable
- [ ] Submit button works
- [ ] You see "Sending..." loading state
- [ ] Success alert appears
- [ ] LIFF window closes automatically
- [ ] Confirmation message appears in LINE chat
- [ ] Message is properly formatted

### ❌ If Something Doesn't Work

See the **Troubleshooting** section below.

---

## 🔧 Troubleshooting

### Problem: LIFF link opens in external browser

**Solution:**
- Make sure you're opening the link from the LINE app (not from Safari or Chrome)
- The LIFF URL must start with `https://liff.line.me/`
- Try copying the link and pasting it in a LINE chat to yourself

### Problem: "LIFF initialization failed"

**Possible causes:**
1. **Wrong LIFF ID**
   - Check `main.js` → Make sure `LIFF_ID` matches your actual LIFF ID
   - LIFF ID format: `1234567890-AbCdEfGh`

2. **Wrong Endpoint URL**
   - Go to LINE Developers Console
   - Check your LIFF endpoint URL matches your deployed frontend

3. **HTTPS required**
   - LIFF only works with HTTPS (not HTTP)
   - Make sure your frontend is deployed with HTTPS

### Problem: Form submits but no message received

**Possible causes:**
1. **Wrong Channel Access Token**
   - Check your backend `.env` file
   - Make sure `CHANNEL_ACCESS_TOKEN` is from your **Messaging API channel**
   - Token should be very long (100+ characters)

2. **Backend not running**
   - Visit your backend health check URL
   - Should return JSON with `"status": "ok"`
   - If not, check deployment logs

3. **Wrong Backend URL**
   - Check `main.js` → Make sure `BACKEND_URL` points to your deployed backend
   - Should be `https://` (not `http://`)
   - Should NOT have trailing slash

4. **User ID not sent**
   - Check browser console for errors (Developer Tools → Console)
   - Make sure LIFF successfully got user profile

### Problem: "Failed to send message via LINE API"

**Check backend logs:**
- On Render: Go to your service → Logs
- On Railway: Click your service → View logs

**Common errors:**
- `401 Unauthorized`: Wrong or expired Channel Access Token
- `400 Bad Request`: Invalid message format or user ID
- `403 Forbidden`: Bot not added as friend (for some LINE accounts)

**Solutions:**
- Re-issue Channel Access Token
- Check if Messaging API channel is properly set up
- Make sure user has added your OA as friend

### Problem: CORS errors

**Error message:**
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS
```

**Solution:**
- This shouldn't happen if you deployed correctly
- Check backend `server.js` has `app.use(cors())`
- Redeploy backend

### Problem: Form doesn't close after submission

**Possible cause:**
- `liff.closeWindow()` only works in LIFF environment (not in regular browser)

**Solution:**
- Make sure you're testing inside LINE app
- If testing in browser, this is expected behavior

---

## ❓ FAQ

### Q: Can I customize the form fields?

**A:** Yes! Edit `frontend/index.html` to add/remove fields. Also update:
- `main.js` → Form data collection logic
- `backend/server.js` → Message formatter function

### Q: Can I send messages to my sales team instead of the client?

**A:** Yes! Instead of sending to `userId` from LIFF, you can:
1. Get your sales team's LINE User IDs
2. Store them in the backend
3. Loop through and send messages to all of them

Example in `server.js`:
```javascript
const SALES_TEAM_IDS = [
    "U1234567890abcdef",  // Sales Rep 1
    "U0987654321fedcba"   // Sales Rep 2
];

for (const salesUserId of SALES_TEAM_IDS) {
    await axios.post(LINE_MESSAGING_API_URL, {
        to: salesUserId,
        messages: [{ type: "text", text: message }]
    }, { headers: { /* ... */ } });
}
```

### Q: How do I get someone's LINE User ID?

**A:** Multiple ways:
1. Use the LIFF form itself - the User ID is in the confirmation message
2. Use LINE OA chat webhook (requires webhook setup)
3. Ask them to use the form once

### Q: Can I save form data to a database?

**A:** Absolutely! In `backend/server.js`, before sending the LINE message, add database insert logic:

```javascript
// Example with MongoDB
await db.collection('orders').insertOne({
    company,
    contact,
    product,
    quantity,
    deadline,
    notes,
    userId,
    createdAt: new Date()
});
```

### Q: Is this free?

**A:** Yes! All components can be run for free:
- LINE API: Free (with limits)
- Vercel/Netlify: Free tier available
- Render/Railway: Free tier available (with limitations)

Free tier limits:
- LINE: 500 messages/month (push messages)
- Vercel: Unlimited bandwidth for personal use
- Render: 750 hours/month (always-on), sleeps after inactivity

### Q: What happens when Render free tier "sleeps"?

**A:** After 15 minutes of inactivity, the backend goes to sleep. The first request after waking takes ~30 seconds. Upgrade to paid plan ($7/month) to prevent sleeping.

### Q: Can I use this for other purposes?

**A:** Yes! This is a flexible template. You can adapt it for:
- Survey forms
- Registration forms
- Feedback collection
- Appointment booking
- Event RSVP
- Any data collection inside LINE

### Q: How secure is this?

**A:** Reasonably secure for basic use:
- HTTPS encryption
- LINE authentication
- User ID verification
- Server-side validation

**For production**, consider adding:
- Input sanitization
- Rate limiting
- Request signing
- Database encryption

### Q: Can I style the form differently?

**A:** Yes! Edit `frontend/liff.css`. The current design is mobile-first and clean, but you can customize:
- Colors
- Fonts
- Layout
- Animations
- Branding

### Q: What if I want to add file uploads?

**A:** You'll need to:
1. Add a file input in the form
2. Upload files to cloud storage (AWS S3, Cloudinary, etc.)
3. Send the file URL in the LINE message
4. Consider using LINE's image message type

This requires more advanced setup.

### Q: Can I test this without LINE OA?

**A:** No. LIFF requires:
- A LINE account
- A LINE Login channel (for LIFF)
- A Messaging API channel (for messages)

You can't fully test LIFF outside the LINE environment.

### Q: How do I update the LIFF app after deployment?

**A:** Just update your code and redeploy:
1. Make changes to `frontend/` or `backend/`
2. Push to GitHub (if using Git)
3. Vercel/Netlify will auto-deploy (if connected to GitHub)
4. Or manually redeploy

**No need to update LINE Developers Console** unless you're changing the LIFF endpoint URL.

---

## 📱 Additional Resources

### Official Documentation
- **LIFF Documentation**: https://developers.line.biz/en/docs/liff/overview/
- **LINE Messaging API**: https://developers.line.biz/en/docs/messaging-api/
- **LINE Developers Console**: https://developers.line.biz/console/

### Helpful Guides
- **LIFF Starter App**: https://github.com/line/line-liff-v2-starter
- **LINE Bot SDK**: https://github.com/line/line-bot-sdk-nodejs
- **Vercel Deployment**: https://vercel.com/docs
- **Render Deployment**: https://render.com/docs

### Community
- **LINE Developer Community**: https://www.line-community.me/
- **Stack Overflow**: Search for `[line-api]` or `[liff]` tags

---

## 🎉 Conclusion

Congratulations! You now have a fully functional LIFF application integrated with LINE Official Account.

**What you've built:**
- ✅ A mobile-friendly form that runs inside LINE
- ✅ User authentication via LIFF
- ✅ Backend API that processes submissions
- ✅ Automatic confirmation messages via LINE Messaging API
- ✅ Full deployment to production

**Next steps:**
- Customize the form for your business needs
- Add a database to store submissions
- Create an admin dashboard to view orders
- Add more LINE features (rich menus, flex messages)
- Scale your infrastructure as needed

**Need help?**
- Check the Troubleshooting section
- Read the official LINE documentation
- Search for similar issues online
- Reach out to the LINE Developer Community

Happy building! 🚀

---

## 📄 License

This project is provided as-is for educational and commercial use. Feel free to modify and adapt it for your needs.

---

## 🙏 Credits

Created for GMF as a complete LIFF implementation guide.

Built with:
- LINE LIFF SDK
- Express.js
- Node.js
- Love and patience ❤️

---

**Last Updated**: January 2025
**Version**: 1.0.0
