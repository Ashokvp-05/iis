# 🚀 Rudratic HR Management System: Enterprise Hub

A high-performance, professional-grade Human Resources Management System (HRMS) built with a modern decoupled architecture. This platform handles complex HR workflows, payroll processing, and employee lifecycle management.

![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=nextdotjs)
![Express](https://img.shields.io/badge/Backend-Express.js-blue?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind--4-06B6D4?style=flat-square&logo=tailwindcss)

---

## �️ Core Features
- 🔐 **Secure RBAC Auth**: Multi-role support (Admin, Manager, Employee, HR) with JWT and optional 2FA.
- 🕒 **Live Attendance**: Real-time clock-in/out tracking with precise location monitoring.
- 📅 **Leave Management**: Full lifecycle management for leaves with multi-level approval workflows.
- 💰 **Payroll Engine**: Automated generation of professional PDF payslips and employee salary distribution.
- 📊 **Dynamic Dashboards**: Role-specific analytical views for tracking team performance and metrics.
- 📢 **Broadcast Center**: Company-wide announcements and internal notification system.
- 🗂️ **Service Management**: Internal ticketing and support system for HR-related queries.

---

## 🛠️ Installation & Setup

### **1. Automated Setup (Recommended)**
If you are on Windows, simply run the All-in-One installer:
- Double-click **`setup.bat`** in the root directory.

### **2. Manual Installation**
```bash
# Install everything
npm run install-all

# Sync Database (from /backend)
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

---

## 📋 System Prerequisites
- **Node.js**: v18.17.0 or higher
- **Postgres Database**: v14.x or higher
- **Hardware**: 4GB RAM minimum (8GB Recommended)

---

## 🛰️ Environment Configuration

### Backend (`/backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/hr_db` |
| `JWT_SECRET` | Secret key for session security | `your_jwt_secret` |
| `PORT` | API listener port | `4000` |

### Frontend (`/frontend/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Endpoint for the Backend API | `http://localhost:4000/api` |
| `AUTH_SECRET` | NextAuth encryption key | `your_auth_secret` |
| `NEXTAUTH_URL` | Canonical URL of the frontend | `http://localhost:3000` |

---

## 🏃 Global Execution Commands
Run these commands from the **Root Folder**:

| Action | Command |
| :--- | :--- |
| **Launch API** | `npm run dev-backend` |
| **Launch UI** | `npm run dev-frontend` |
| **Build System** | `npm run build-all` |

---

## � Project Architecture
- **`/backend`**: Express.js API handling business logic and Prisma ORM.
- **`/frontend`**: Next.js 16 App Router with Tailwind CSS 4 and Framer Motion.
- **`/backend/prisma`**: Database schemas and seeding scripts.
- **`setup.bat`**: Windows-based automated initialization script.

---

## 🔑 Demo Credentials
The system comes pre-seeded with these testing accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@hrms.com` | `Admin@123` |
| **Manager** | `manager@hrms.com` | `Manager@123` |
| **Employee** | `employee@hrms.com` | `Employee@123` |
| **HR Specialist** | `hr@hrms.com` | *(Created via scripts)* |

---

## 🆘 Troubleshooting
- **Database Connection**: Ensure your PostgreSQL service is running before starting the backend.
- **Prisma Issues**: If types are missing, run `npx prisma generate` in the `backend` folder.
- **CORS Errors**: Verify that `FRONTEND_URL` is correctly set in the backend environment.

---
*© 2026 Rudratic Technologies. All rights reserved.*