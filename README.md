# Task Management System

A full-stack Task Management System built for the Backend Developer Internship Assignment.

This project demonstrates:

* JWT Authentication
* Role-Based Access Control (RBAC)
* Secure REST APIs
* Admin Dashboard
* User Dashboard
* Full CRUD Operations
* MongoDB Atlas Integration
* React Frontend Integration
* Protected Routes
* Scalable Backend Structure

---

# Live Features

## Authentication

* User Registration
* User Login
* Admin Login
* Password Hashing using bcryptjs
* JWT Token Authentication

---

# Role-Based Access Control

## User

* Register/Login
* Create Tasks
* View Own Tasks
* Update Own Tasks
* Delete Own Tasks

## Admin

* Login as Admin
* View All Users
* Manage Users
* View All Tasks
* Manage User Tasks

---

# Tech Stack

## Frontend

* React.js
* Vite
* React Router DOM
* Axios
* CSS

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT
* bcryptjs
* express-validator

---

# Project Structure

```txt
Task-Management-System/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
```

---

# API Endpoints

# Authentication APIs

## Register User

```http
POST /api/v1/auth/register
```

## Login User

```http
POST /api/v1/auth/login
```

## Get All Users (Admin)

```http
GET /api/v1/auth/users
```

## Update User (Admin)

```http
PUT /api/v1/auth/users/:id
```

## Delete User (Admin)

```http
DELETE /api/v1/auth/users/:id
```

---

# Task APIs

## Create Task

```http
POST /api/v1/tasks
```

## Get Tasks

```http
GET /api/v1/tasks
```

## Get Single Task

```http
GET /api/v1/tasks/:id
```

## Update Task

```http
PUT /api/v1/tasks/:id
```

## Delete Task

```http
DELETE /api/v1/tasks/:id
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI= mongodb+srv://godiselamalathi_db_user:bunny19@cluster0.spysb3x.mongodb.net/taskmanager

JWT_SECRET= mysecretjwtkey

ADMIN_EMAIL = admin@gmail.com
ADMIN_PASSWORD = admin123
```

---

# Installation & Setup

# Clone Repository

```bash
git clone < https://github.com/malathi1945/task-management-system.git >
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# Authentication Flow

1. User/Admin logs in
2. JWT token generated
3. Token stored in localStorage
4. Protected APIs accessed using:

```txt
Authorization: Bearer TOKEN
```

---

# Database Schema

# User Schema

```js
{
  name,
  email,
  password,
  role
}
```

# Task Schema

```js
{
  title,
  description,
  status,
  createdBy
}
```

---

# Security Features

* Password Hashing using bcryptjs
* JWT Authentication
* Protected Routes
* Role-Based Authorization
* Input Validation
* Environment Variables for Secrets

---

# Scalability Notes

This project follows a modular backend architecture using:

* Controllers
* Routes
* Middleware
* Models

Potential future scalability improvements:

* Redis caching
* Docker deployment
* Microservices architecture
* Load balancing
* API rate limiting
* Centralized logging

---

# API Documentation

Postman Collection included:

```txt
Task-Management-API.postman_collection.json
```

---

# Future Improvements

* Task filtering
* Pagination
* Notifications
* File uploads
* Refresh Tokens
* Email Verification

---

# Author

Malathi Godisela

Backend Developer Internship Assignment Submission
I created a complete professional README.md tailored to your actual project structure and features, including:

Authentication
Admin dashboard
RBAC
CRUD APIs
Tech stack
API endpoints
Setup instructions
Environment variables
Security features
Scalability notes
Postman collection section