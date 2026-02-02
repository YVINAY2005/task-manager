# 🚀 SwiftTask - Full Stack Task Management System

A production-quality Task Management Web Application built for a Full Stack Development Internship assessment. This project demonstrates clean architecture, responsive design, and robust API development.

![SwiftTask Preview](https://via.placeholder.com/1200x600?text=SwiftTask+Dashboard+Preview)

## ✨ Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks.
- **JWT Authentication**: Secure login and registration system.
- **Advanced Filtering**: Filter tasks by status (Pending, In Progress, Completed).
- **Search & Sort**: Real-time search by title/description and sort by date or title.
- **Responsive Design**: Mobile-first approach, works on phones, tablets, and desktops.
- **Pagination**: Efficient loading of tasks with pagination controls.
- **Toast Notifications**: Real-time feedback for user actions.
- **Clean UI**: Modern dashboard with soft shadows, rounded corners, and smooth transitions.

## 🛠️ Tech Stack

- **Frontend**: 
  - HTML5 & Modern CSS3 (Flexbox/Grid)
  - Vanilla JavaScript (ES6+)
  - FontAwesome Icons
- **Backend**:
  - Node.js & Express.js
  - RESTful API Design
- **Database**:
  - MongoDB with Mongoose ODM
- **Security**:
  - JWT (JSON Web Tokens) for Auth
  - BcryptJS for password hashing
  - Express Validator for request validation

## 📁 Folder Structure

```text
task-manager/
├── client/              # Frontend application
│   ├── css/             # Styling (Mobile-first)
│   ├── js/              # Vanilla JS Logic
│   └── index.html       # Main Entry Point
├── server/              # Backend API
│   ├── config/          # Database connection
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth & Error handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Server entry point
│   └── .env             # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Run the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Frontend Setup**
   Since it's Vanilla JS, you can simply open `client/index.html` in your browser or use a Live Server.
   *Note: Ensure the backend is running on port 5000 for the API calls to work.*

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user & get token
- `GET /api/auth/me` - Get current user profile

### Tasks (Protected)
- `GET /api/tasks` - Get all user tasks (Supports search, filter, sort, pagination)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get single task details
- `PUT /api/tasks/:id` - Update task (title, description, status)
- `DELETE /api/tasks/:id` - Delete task

## 🐳 Docker Support

You can also run the application using Docker:

```bash
docker-compose up --build
```

## 🎯 Future Improvements

- [ ] Dark Mode Toggle
- [ ] Drag and Drop task board
- [ ] Email notifications for due dates
- [ ] Multi-user collaboration

## 📄 License

This project is licensed under the MIT License.
