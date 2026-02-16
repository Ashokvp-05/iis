# 🚀 How to Deploy on Render.com (Step-by-Step)

This guide will help you deploy your **Frontend (Next.js)** and **Backend (Node.js)** to Render.com for free.

---

## ⚠️ Important Prerequisites
1. **Push your code to GitHub**: Your project must be in a GitHub repository.
2. **Database**: You need a PostgreSQL database.
   - **Recommendation**: Create a **Free Database on [Supabase.com](https://supabase.com)** (it never expires).
   - *Get the connection string (DATABASE_URL) from Supabase.*

---

## Part 1: Deploy the Backend (API)

1. **Log in to [Render.com](https://render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the details:
   - **Name**: `hr-backend` (or similar)
   - **Root Directory**: `backend` (Important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Environment Variables** (Scroll down to "Environment Variables"):
   Add these keys and values (copy from your `.env` file):
   - `DATABASE_URL`: (Your Supabase/Render DB connection string)
   - `JWT_SECRET`: (Your secret key)
   - `PORT`: `10000` (Render creates this automatically, but good to know)
   - `accessKeyId`, `secretAccessKey`, etc. (If you added S3)

6. Click **Create Web Service**.
   - *Wait for it to deploy. Once done, copy the URL (e.g., `https://hr-backend.onrender.com`).*

---

## Part 2: Deploy the Frontend (Next.js)

1. Go to **Dashboard** -> **New +** -> **Web Service**.
2. Connect the **Same Repository** again.
3. Fill in the details:
   - **Name**: `hr-frontend`
   - **Root Directory**: `frontend` (Important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: **Paste your Backend URL here** (e.g., `https://hr-backend.onrender.com/api`)
   - `AUTH_SECRET`: (Your generated auth secret)
   - `NEXTAUTH_URL`: (The URL of *this* frontend service, e.g., `https://hr-frontend.onrender.com`)
   - `AUTH_TRUST_HOST`: `true`

5. Click **Create Web Service**.

---

## 🚨 Critical Warning: File Uploads
Since you are using Render's free tier (or standard tier) without S3:
1. **Payslips uploaded will disappear** every time the server restarts (approx every 15 mins on free tier).
2. **Fix**: To keep files permanently, you **must** update your code to upload files to **Supabase Storage** or **AWS S3** instead of the local `uploads/` folder.

---

## ✅ Deployment Checklist
- [ ] Database is connected & migrated (Run `npx prisma db push` from your local machine using the cloud connection string).
- [ ] Backend is "Live".
- [ ] Frontend can login (Check console for CORS errors if it fails; you might need to update CORS in backend).
