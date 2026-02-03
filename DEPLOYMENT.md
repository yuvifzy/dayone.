# 🚀 Deployment Guide: DayOne Workspace

Since **DayOne** is a full-stack application with a **Java Spring Boot** backend and a **React** frontend, it requires a "split deployment" strategy.

- **Frontend (React)**: Deployed on **Vercel**.
- **Backend (Spring Boot) & Database**: Deployed on **Railway** (Recommended) or Render.

---

## 🏗️ Step 1: Deploy Backend & Database (Railway)
*Railway is the easiest way to deploy Spring Boot and PostgreSQL together.*

1.  **Create an Account**: Go to [railway.app](https://railway.app/) and sign up.
2.  **New Project**: Click "New Project" -> "GitHub Repo" -> Select your repo (`aist-dayone`).
3.  **Add Database**:
    - In your project view, click "New" -> "Database" -> "PostgreSQL".
    - Railway will create a cloud database for you.
4.  **Connect Backend to Database**:
    - Click on your Spring Boot service card.
    - Go to **Variables**.
    - Add the following environment variables (using the values from the PostgreSQL card > Connect > Variables):
        - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}`
        - `SPRING_DATASOURCE_USERNAME`: `${PGUSER}`
        - `SPRING_DATASOURCE_PASSWORD`: `${PGPASSWORD}`
5.  **Generate Public Domain**:
    - Go to **Settings** on your backend service.
    - Click **Generate Domain**.
    - Copy this URL (e.g., `https://dayone-backend-production.up.railway.app`).

---

## 🎨 Step 2: Deploy Frontend (Vercel)

1.  **Create an Account**: Go to [vercel.com](https://vercel.com).
2.  **Import Project**: Click "Add New..." -> "Project" -> Select your Git repo.
3.  **Configure Build**:
    - Framework Preset: **Vite**
    - Root Directory: `./` (default)
4.  **Environment Variables**:
    - Add a variable to point the frontend to your new live backend.
    - Name: `VITE_API_BASE_URL`
    - Value: `https://dayone-backend-production.up.railway.app/api` (The URL from Step 1).
    *(Note: You'll need to update your `api.ts` file to use this variable if it's hardcoded to localhost).*
5.  **Deploy**: Click "Deploy".

---

## 🔌 Step 3: Connect TablePlus to Cloud DB

Now you can manage your **Live Production Data** using TablePlus, just like you did locally.

1.  Open **Railway** -> Select **PostgreSQL**.
2.  Click the **Connect** tab.
3.  Copy the values for **Host**, **Port**, **User**, **Password**, and **Database**.
4.  Open **TablePlus** -> New Connection.
5.  Paste these details.
6.  **Success!** You are now viewing your live cloud database.
