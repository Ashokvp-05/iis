# 🚀 Rudratic HR Management System: Enterprise Hub

A high-performance, professional-grade Human Resources Management System. This project is built using a modern decoupled architecture, combining the power of **Next.js 16** and **Express.js** to handle complex HR workflows with ease.

![Project Banner](https://img.shields.io/badge/Status-Fully--Integrated-emerald?style=for-the-badge&logo=rocket)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=nextdotjs)
![Express](https://img.shields.io/badge/Backend-Express.js-blue?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)

---

## 📂 Project Structure

The project is organized into two primary services:

### 1. **Backend API** (`/hr-management/backend`)
The engine of the system.
- **Language**: TypeScript / Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Key Folders**: `controllers`, `routes`, `services`, `prisma`.

### 2. **Frontend UI** (`/hr-management/frontend`)
The premium user interface.
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Key Folders**: `app`, `components`, `lib`.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js (v18+)
- PostgreSQL Database

### 2. Local Installation
```bash
# Clone the repository
git clone https://github.com/Ashokvp-05/hr-management-system.git

# Install & Run Backend
cd hr-management/backend
npm install
npm run dev

# Install & Run Frontend (In a new terminal)
cd hr-management/frontend
npm install
npm run dev
```

### 3. Database Sync
```bash
cd hr-management/backend
npx prisma generate
npx prisma migrate dev
```

---

## 🛡️ Core Features
- 🔐 **Secure RBAC Auth**: Native NextAuth integration with JWT and Role-Based Access Control.
- 🕒 **Live Attendance**: Clock-in/out tracking with real-time timers.
- 📅 **Leave Management**: Full lifecycle from request to multi-level approval.
- 💰 **Payroll System**: Automated PDF payslip generation and employee distribution.
- 📢 **Broadcast Center**: Company-wide announcements and notifications.
- 📊 **Dynamic Dashboards**: Dedicated views for Admins, Managers, and Employees.

---

## 🌐 Production Deployment
This system is designed for **Render.com** deployment.
- **Deployment File**: `hr-management/render.yaml`
- **Database Recommendation**: [Supabase](https://supabase.com) (PostgreSQL)

---

## 🤝 Support
Developed by **Rudratic Technologies Engineering Team**.  
For technical support: `engineering@rudratic.com`  

*Copyright © 2026 Rudratic Technologies. All Rights Reserved.*