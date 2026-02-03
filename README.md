# 🚀 DayOne Workspace
### *Next-Gen AI-Powered Task Management System*

DayOne is an enterprise-grade workspace designed to streamline productivity for technical professionals. It combines robust task management with AI intelligence, providing a seamless experience for organizing, executing, and tracking mission-critical objectives.

---

## ✨ Key Features

### 🧠 **AI-Powered Intelligence**
- **Smart Breakdown**: Leverage **Google Gemini AI** to automatically break down complex task titles into actionable, technical steps.
- **Strategic Assistant**: Get instant AI guidance on how to approach your work.

### 📊 **Interactive Kanban Board**
- **Drag & Drop Workflow**: Effortlessly move tasks between *Todo*, *In Progress*, and *Done* columns.
- **Optimistic UI**: Instant visual feedback ensuring a buttery-smooth user experience.
- **Glassmorphism Design**: specific visual style customized for modern aesthetics.

### 📈 **Real-Time Analytics**
- **Visual Metrics**: Interactive charts powered by `recharts` to track priority distribution.
- **Efficiency Tracking**: monitor your completion rates and daily activity at a glance.

### 🛡️ **Enterprise Security**
- **JWT Authentication**: Secure, stateless session management.
- **Role-Based Access**: Granular control over user permissions.
- **Encrypted Data**: Industry-standard BCrypt password hashing.

---

## 🛠️ Technology Stack

| **Area** | **Technology** |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security |
| **Database** | PostgreSQL |
| **AI Engine** | Google Gemini Generative AI |
| **State** | React Context API + LocalStorage |

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** v18+
- **JDK** 17+
- **PostgreSQL** running locally

### 1. Database Setup
Create the dedicated database:
```sql
CREATE DATABASE dayone;
```

### 2. Backend Server
Navigate to the `/backend` directory and configure your DB credentials in `src/main/resources/application.yml`.
```bash
cd backend
mvn spring-boot:run
```
*Server starts at `http://localhost:8080`*

### 3. Client Application
In the project root:
```bash
# Install dependencies
npm install

# Launch the dashboard
npm run dev
```
*Access the app at `http://localhost:5173`*

---

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **401 Unauthorized** | Session expired. Log out and log back in to refresh your JWT token. |
| **Kanban Snap-back** | Ensure `React.StrictMode` is disabled in dev mode for DnD compatibility. |
| **AI Not Responding** | Verify your Google Gemini API key is correctly set in the environment variables. |
| **Database Connection** | Check if PostgreSQL service is active on port `5432`. |

---

*Built with ❤️ by the DayOne Team*
