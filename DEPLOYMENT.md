# 🚀 Deployment Guide - SaaS Agency Manager

SaaS Agency Manager project ko production me host karne ke liye details aur step-by-step setup guide niche di gayi hai.

---

## 📁 1. Frontend Setup (Client)

### Konsi file/folder host karein?
* **Local Folder**: `client`
* **Build Directory**: `client/dist` (Vite build hone ke baad `client/dist` folder generate hota hai).
* **Host sites**: Netlify, Vercel, ya Render (Static Site) par host karein.

### Hosting Steps (Netlify / Vercel):
1. **Repository root** connect karein or subfolder specify karein:
   * **Root Directory**: `client`
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist` (Vite `client/dist` generator use karta hai)
2. **Environment Variable (Crucial)**:
   * Setup a variable named `VITE_API_URL`.
   * Set its value to your hosted backend URL (e.g. `https://saas-agency-backend.onrender.com`).
   * *Aapka local build automatically is URL par API calls routing redirect kar dega.*

---

## ⚙️ 2. Backend Setup (Server)

### Hosting Steps (Render.com Web Service):
1. Render dashboard par **New Web Service** create karein.
2. Git Repository connect karein.
3. Configure settings:
   * **Name**: `saas-agency-backend`
   * **Root Directory**: `server`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/index.js` (Production me nodemon ki zarurat nahi hoti)
4. Add **Environment Variables** in Render:
   * `PORT` = `5000` (Render dynamically assign bhi kar deta hai)
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `aapka_koi_bhi_strong_secret_key`
   * `DB_DIALECT` = `postgres`
   * `DATABASE_URL` = `postgresql://username:password@hostname:port/dbname?sslmode=require` (Supabase ya Neon.tech se database URL paste karein).

---

## 🛢️ 3. Database Setup (PostgreSQL)

Kyunki SQLite server restarts par local changes ko preserve nahi kar pata Render standard instance par, production me PostgreSQL use karna recommended hai.

1. Go to **Neon.tech** ya **Supabase** aur ek free account banakar PostgreSQL database create karein.
2. Database connection string (URI) copy karein.
3. Use connection string in Backend Environment variables under `DATABASE_URL`.
4. Production start hone par, Sequelize automatically tables, indexes aur schemas create kar dega.
5. First execution me empty database paye jane par Super Admin aur Manager accounts automatically seed ho jayenge default credentials ke sath.

---

## ⚡ 4. Render Blueprint (Automated One-Click Deploy)

Maine root directory me ek **`render.yaml`** file banayi hai.
Agar aap chahein toh apne GitHub repository me is code ko push karke Render dashboard me **Blueprints** tab par ja sakte hain. 
Render automatically:
1. Ek secure **PostgreSQL Database** setup kar dega.
2. **Backend Web Service** ko host karke environment variable configuration connect kar dega.
3. **Vite Frontend Static Site** ko build karke link kar dega.
