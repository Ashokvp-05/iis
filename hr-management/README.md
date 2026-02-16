# 🚀 Rudratic HR Management System: Production Hub

A comprehensive, enterprise-grade Human Resources Management System designed for high-availability environments. Built with **Next.js 16 (Turbopack)**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Deployment Architecture](#-deployment-architecture)
- [Step-by-Step Production Deployment](#-step-by-step-production-deployment)
- [Critical Production Variables](#-critical-production-variables)
- [Pre-Deployment Checklist](#-pre-deployment-checklist)
- [Running Locally](#-running-locally-dev-mode)

---

## ✨ Features

### **Core Modules**
- ✅ **Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
- ✅ **Employee Management** - Complete employee lifecycle management
- ✅ **Time & Attendance** - Clock in/out, overtime tracking, remote work support
- ✅ **Leave Management** - Leave requests, approvals, balance tracking
- ✅ **Payslip Generation** - Automated payslip creation and distribution via Supabase Storage
- ✅ **Performance Tracking** - Employee performance monitoring and analytics
- ✅ **Ticketing System** - Issue tracking and resolution
- ✅ **Admin Dashboard** - Real-time system monitoring and controls

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16 (Turbopack)** / React 19
- **Tailwind CSS 4** (Modern Design System)
- **Framer Motion 12** (Premium Animations)
- **NextAuth.js 5** (Secure Sessions)

### **Backend**
- **Node.js / Express.js**
- **Prisma ORM** (v5.22.0)
- **PostgreSQL** (Managed)
- **Supabase Storage** (For document persistence)

---

## 🌐 Deployment Architecture

The system is optimized for a distributed architecture:
- **Frontend Layer**: Hosted on **Vercel** or **Render** (Next.js 16 with SSR/ISR support).
- **Service Layer**: Node.js/Express API cluster on **Render** / **Railway**.
- **Data Tier**: Managed PostgreSQL (**Supabase** / **Neon**).
- **Object Storage**: **Supabase Storage** (required for permanent payslip persistence).

---

## 🛠️ Step-by-Step Production Deployment

### 1. Database Provisioning (Managed)
1. Provision a PostgreSQL instance on [Supabase](https://supabase.com).
2. Create a bucket named `hr-documents` in Supabase Storage for payslip persistence.
3. Configure your local machine to target the production DB:
   ```bash
   # From backend/
   sh DATABASE_URL="your_production_url" npx prisma migrate deploy
   ```

### 2. Backend Deployment (Render.com)
1. **New Web Service** -> Connect Repo.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: Production SQL string.
   - `JWT_SECRET`: High-entropy string.
   - `SUPABASE_URL`: For Object Storage.
   - `SUPABASE_ANON_KEY`: Client-side access key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Server-side storage bypass.
   - `CORS_ORIGIN`: Your production frontend URL.

### 3. Frontend Deployment (Vercel/Render)
1. **New Project** -> Connect Repo.
2. **Root Directory**: `frontend`
3. **Framework**: Next.js
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend API URL.
   - `AUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production frontend URL.

---

## ✅ Pre-Deployment Checklist

- [x] **Prisma Client**: Regenerated on build (`npx prisma generate`).
- [x] **TypeScript Build**: All compilation errors solved.
- [x] **Turbopack Compatibility**: `styled-jsx` issues resolved.
- [x] **Privacy Guard**: Dashboard encryption modes verified.
- [x] **Build Verification**: `npm run build` passes for both tiers.

---

## 🚀 Running Locally (Dev Mode)

```bash
# 1. Install & Run Backend
cd backend && npm install && npm run dev

# 2. Install & Run Frontend
cd ../frontend && npm install && npm run dev
```

---

## 🤝 Support & Engineering
**Rudratic Technologies Core Team**  
For technical escalation, contact: `engineering@rudratic.com`  
*Copyright © 2026 Rudratic Technologies. All Rights Reserved.*

---
**Made with ❤️ for HR Professionals.**
