# Trakio

Trakio is a beautiful, intuitive, and AI-powered project management SaaS designed to help teams collaborate, track tasks, and boost productivity with a premium user experience.

## Features

- **Intuitive Dashboard:** A central hub to track all projects, tasks, and team progress in one unified view.
- **Activity Audit Log:** A real-time timeline tracking every action taken by your team for full transparency.
- **Task Comments:** Communicate directly on tasks with a built-in chat system to keep context where it belongs.
- **Role-based Access Control (RBAC):** Securely manage your workspace with Admin and Member roles.
- **AI Task Generation:** Instantly auto-generate actionable sub-tasks for any project using powerful AI models.
- **Executive Summary & Enhancement:** Get instant AI summaries of team performance and one-click professional task descriptions.
- **Modern UI/UX:** Built with a glassmorphism aesthetic, smooth Framer Motion animations, and clean layouts.

## Tech Stack

- **Frontend:** React (Vite), React Router, Framer Motion, Lucide React, CSS Variables (Custom styling)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Groq SDK (Llama 3.1)
- **Authentication:** JWT (JSON Web Tokens)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [<repository-url>](https://github.com/AnshuTanwar/Trakio)
   cd Trakio
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5050
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

```
Trakio/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route controllers (auth, projects, tasks, ai, activities, comments)
│   ├── middleware/     # Auth & Workspace guards
│   ├── models/         # Mongoose schemas (User, Workspace, Project, Task, Activity, Comment)
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Layout, etc.)
    │   ├── context/    # React Context (AuthContext)
    │   ├── pages/      # Views (Landing, Login, Register, Dashboard, Projects, ProjectDetail)
    │   ├── App.jsx     # App routing
    │   └── main.jsx    # Entry point
    └── vite.config.js  # Vite configuration & proxy settings
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
