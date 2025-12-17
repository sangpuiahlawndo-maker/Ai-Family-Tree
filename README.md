
# AncestryLive Deployment Guide

This project is optimized for deployment on **Netlify** or **Vercel**.

## 1. Prerequisites
- A GitHub repository with this code.
- A Google Gemini API Key.

## 2. Deploying to Netlify
1. Connect your GitHub repo to Netlify.
2. Set the **Build Command** to `npm run build`.
3. Set the **Publish Directory** to `dist`.
4. **CRITICAL**: Go to Site Settings > Environment Variables and add:
   - `API_KEY`: (Your Gemini API Key)

## 3. Local Development
1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://localhost:3000`.
