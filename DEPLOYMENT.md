# Deployment Guide

Get your "Corgi sized meteor" app on the internet! Here are the easiest options:

## Option 1: Render (Recommended - Easiest & Free)

**Steps:**
1. Go to [render.com](https://render.com) and sign up/login (free account)
2. Click "New +" → "Web Service"
3. Connect your GitHub account (or push your code to GitHub first)
4. Select your repository
5. Configure:
   - **Name**: `corgi-sized-meteor` (or whatever you want)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: Free (for testing)
6. Click "Add Environment Variable":
   - Key: `OPENAI_API_KEY`
   - Value: (paste your API key)
7. Click "Create Web Service"
8. Wait ~5 minutes for deployment
9. Your app will be live at: `https://your-app-name.onrender.com`

**Note**: Free tier sleeps after 15 minutes of inactivity, but wakes up automatically when accessed.

---

## Option 2: Railway (Also Easy & Free)

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Python projects
5. Go to "Variables" tab and add:
   - `OPENAI_API_KEY` = (your API key)
6. Railway auto-deploys!
7. Click "Settings" → "Generate Domain" to get your URL
8. Your app is live!

**Note**: Railway free tier gives $5/month credit (plenty for this app).

---

## Option 3: PythonAnywhere (Free Tier Available)

**Steps:**
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com) and sign up (free Beginner account)
2. Go to "Files" tab and upload your project files
3. Go to "Web" tab → "Add a new web app"
4. Choose Flask and Python 3.10
5. Edit the WSGI file to point to your `app.py`:
   ```python
   import sys
   path = '/home/yourusername/PDC-Hackathon'
   if path not in sys.path:
       sys.path.insert(0, path)
   
   from app import app as application
   ```
6. Go to "Web" tab → "Static files" and add:
   - URL: `/static`
   - Directory: `/home/yourusername/PDC-Hackathon/static`
7. Go to "Web" tab → "Environment variables" and add:
   - `OPENAI_API_KEY` = (your API key)
8. Click "Reload" button
9. Your app is live at: `yourusername.pythonanywhere.com`

**Note**: Free tier allows external webhooks but has some limitations.

---

## Option 4: Fly.io (Good for Hackathons)

**Steps:**
1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Run `fly launch` in your project directory
3. Follow prompts (choose a region, app name)
4. Set environment variable:
   ```bash
   fly secrets set OPENAI_API_KEY=your-api-key-here
   ```
5. Deploy:
   ```bash
   fly deploy
   ```
6. Your app is live!

---

## ✅ Pre-Deployment Checklist

1. ✅ **API URLs fixed** - Already using relative paths (`/api/scrape`, `/api/amend`) so it works everywhere
2. ✅ **Production server config** - `app.py` updated to use environment `PORT` variable
3. ✅ **Deployment files created** - `Procfile`, `runtime.txt`, and `render.yaml` ready
4. ⚠️ **Push to GitHub** - Make sure your code is in a GitHub repository (for Render/Railway)
5. ⚠️ **Set environment variable** - Add `OPENAI_API_KEY` in the deployment platform

## 🚀 Quickest Path (Render - ~10 minutes)

1. Push your code to GitHub (if not already)
2. Go to [render.com](https://render.com) → "New Web Service"
3. Connect GitHub → Select repo
4. Set Start Command: `python app.py`
5. Add Environment Variable: `OPENAI_API_KEY`
6. Deploy! 🎉

That's it! Your app will be live in 5-10 minutes.
