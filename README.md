# 🌟 PMO_EZ – Project Management Office Made Easy  

> 🧑‍💻 **The easiest way to manage projects, people, and progress — all in one place 🚀**  

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)  
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)  
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)  
[![PostgreSQL](https://img.shields.io/badge/Postgres-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)  
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)  
[![Clerk](https://img.shields.io/badge/Clerk-512BF2?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)  

---

A **modern project management platform** that makes collaboration simple, visual, and powerful.  
With **Next.js, Node.js, Clerk, NeonDB, TailwindCSS, and Dockerized Microservices**, PMO_EZ is your go-to tool for managing organizations, projects, and tasks seamlessly.  

✨ Create organizations, invite people via email, assign roles, track issues with a Kanban board, and collaborate in real time.  

---

## 🔥 Features  

### 🔐 Authentication & Roles  
- Secure **Clerk Authentication** 🔑  
- Roles: **Admin 👑**, **Member 👥**, **Project Manager 🧑‍💼**  
- Admins can **promote, demote, or assign rights** dynamically  

### 🏢 Organizations & Projects  
- Create and manage **organizations 🏛️**  
- Upload icons/photos for branding 🖼️  
- Invite members with **email invites 📧**  
- Admin powers:  
  ✅ Assign roles (Admin / Member)  
  ✅ Create projects (members can’t 🚫)  
  ✅ Manage collaborators  

### 📋 Issues & Kanban Board  
- Create issues/tasks 📝  
- Assign to members with ease 👥  
- Interactive **Kanban board 🗂️** with drag & drop:  
  - 🔴 Started  
  - 🟡 In Progress  
  - 🟢 Completed  
- Track **who worked on what** 👨‍💻👩‍💻  

### 📎 File & Media Support  
- Upload **organization icons & files** dynamically 📤  
- Multer-powered secure file handling ⚡  

### 📧 Email Invites  
- Automatic invites sent straight to **user inbox** 📬  
- Accept → Join instantly 🚀  

---

## 🛠️ Tech Stack  

### 🎨 Frontend  
- ⚛️ Next.js  
- 🎀 Tailwind CSS  
- 🧩 State Management  

### ⚙️ Backend  
- 🟢 Node.js + Express  
- 📦 RESTful APIs  
- 📤 Multer for file uploads  
- 🗄️ NeonDB (Postgres serverless)  
- 🐳 Docker Microservices  

### 🔒 Security  
- Clerk Authentication 🔐  
- JWT-based sessions 🛡️  

---

## 📂 Project Structure  

/pmo_ez
├── frontend/ # Next.js + TailwindCSS UI
├── backend/ # Node.js + Express REST APIs
├── docker/ # Microservices setup
└── README.md

---

## ⚡ Getting Started  

### 1️⃣ Clone Repo  
```bash
git clone https://github.com/yourusername/pmo_ez.git
cd pmo_ez
2️⃣ Setup Environment Variables
Create .env files in frontend & backend:

env
# Clerk
CLERK_API_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Database
DATABASE_URL=postgresql://user:password@neon-host/dbname

# Server
PORT=8000
JWT_SECRET=your_secret_key
3️⃣ Run with Docker 🐳
bash
Copy code
docker-compose up --build
4️⃣ Run Locally (Dev Mode)
Backend

cd backend
npm install
npm run dev
Frontend

cd frontend
npm install
npm run dev
🌱 Future Enhancements
🔔 Real-time notifications (WebSockets)

🤝 Slack/Teams integrations

📊 Analytics dashboard

💡 Inspiration
PMO_EZ is built to make teamwork effortless, task tracking visual, and organization management simple yet powerful ✨

⚡ Next.js Boilerplate Info
This is a Next.js project bootstrapped with create-next-app.

▶️ Development Server
Run the dev server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Open http://localhost:3000 in your browser to see the result.

Edit the app by modifying app/page.js — the page auto-updates as you save changes ✨.

This project uses next/font to automatically optimize and load Geist.

📚 Learn More
Next.js Documentation — learn Next.js features & API

Learn Next.js — an interactive tutorial

Next.js GitHub Repo — contribute & give feedback

🚀 Deploy on Vercel
The easiest way to deploy is via Vercel Platform from the creators of Next.js.

Check out Next.js deployment docs for more.
