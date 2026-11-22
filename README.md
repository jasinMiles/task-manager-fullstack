# Task Manager – Full-Stack Application

A full-stack task management application that allows users to create accounts, securely log in, and manage their personal tasks.

## Live Application

- **Frontend:** https://task-manager-fullstack-xi-eight.vercel.app/
- **Backend API:** https://task-api-nbe4.onrender.com
- **API Documentation:** https://task-api-nbe4.onrender.com/api-docs
- **GitHub Repository:** https://github.com/jasinMiles/task-manager-fullstack

## Features

- User registration and authentication
- Secure login using JSON Web Tokens (JWT)
- Create new tasks
- View personal tasks
- Edit existing tasks
- Delete tasks
- Update task status
- Task status categories: Pending, In Progress and Completed
- Search and filter tasks
- Responsive user interface
- Protected API routes
- User-specific task management

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Express Validator
- Swagger UI

### Deployment
- Vercel – Frontend hosting
- Render – Backend hosting
- MongoDB Atlas – Database hosting

## Project Structure

```text
task-manager-fullstack/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   ├── server.js
│   ├── swagger.js
│   ├── package.json
│   └── README.md
│
├── src/
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── styles.css
│
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account (for running your own backend)

### 1. Clone the repository

```bash
git clone https://github.com/jasinMiles/task-manager-fullstack.git
cd task-manager-fullstack
```

### 2. Set up the frontend

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=https://task-api-nbe4.onrender.com
```

Start the frontend development server:

```bash
npm run dev
```

Open the local address displayed by Vite, usually:

```text
http://localhost:5173
```

### 3. Set up the backend locally

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Replace the placeholder values with your own MongoDB connection string and JWT secret.

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

## API Endpoints

All task endpoints require a valid JWT access token.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Retrieve user tasks |
| GET | `/api/tasks/:id` | Retrieve one task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/health` | Check API health |

### Authentication

After login, use the returned JWT token in the request header:

```text
Authorization: Bearer YOUR_TOKEN
```

### Task Request Example

```json
{
  "title": "Learn React",
  "description": "Build a full-stack task manager",
  "status": "pending"
}
```

Available task statuses:

- `pending`
- `in-progress`
- `completed`

## Security

- Passwords are handled by the authentication implementation.
- JWT authentication protects task routes.
- Users can only access their own tasks.
- Environment variables are used for sensitive configuration.
- Environment files and dependencies are excluded from Git.

## Deployment

The frontend is deployed on Vercel and the backend is deployed on Render.

The frontend uses the `VITE_API_URL` environment variable to communicate with the backend.

The backend uses `CLIENT_URL` to allow requests from the deployed frontend.

## Author

**Avwerosuo Okeme**

GitHub: https://github.com/jasinMiles

---

Built as a full-stack task management project using React, Node.js, Express and MongoDB.
