# 📝 Memora

> Your personal companion for notes & daily reflections — a modern, production-ready app built with the MERN stack. Create, organize, and manage your notes and diary with rich features like categories, tags, favorites, archiving, reminders, and attachments.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

---

## ✨ Features

### Core Features

| Feature | Status |
|---------|--------|
| User Registration & Login | ✅ |
| JWT Authentication | ✅ |
| Dashboard with Notes Grid/List | ✅ |
| Create, Read, Update, Delete Notes | ✅ |
| Rich Text Editor (Bold, Italic, Underline, Lists, Headings, Code, Quotes, Links) | ✅ |
| Categories CRUD (Create, Edit, Delete, Filter) | ✅ |
| Tags System | ✅ |
| Search Notes (title, content, tags) | ✅ |
| Advanced Filters (Pinned, Favorites, Archived, Trash, Color, Category) | ✅ |
| Multiple Sorting (Newest, Oldest, Last Edited, A-Z, Z-A, Pinned First) | ✅ |
| Pin Notes (Pinned notes appear first) | ✅ |
| Favorite Notes | ✅ |
| Archive Notes | ✅ |
| Trash & Restore | ✅ |
| Note Colors | ✅ |
| Dark/Light Mode | ✅ |
| Auto Save with Status Indicator (Saving.../Saved/Unsaved) | ✅ |
| Keyboard Shortcuts (Ctrl+N, Ctrl+S, Ctrl+F, Ctrl+D) | ✅ |
| Export Notes (TXT, Markdown, JSON) | ✅ |
| Dashboard Statistics (Total, Favorites, Archived, Trash, Categories) | ✅ |
| User Profile & Settings | ✅ |
| Change Password | ✅ |
| Delete Account | ✅ |
| Default Note Color Preference | ✅ |
| Loading Skeletons (Cards, Dashboard) | ✅ |
| Better Empty States with Contextual Icons & Messages | ✅ |
| 404 Not Found Page | ✅ |
| Toast Notifications (Success, Error) | ✅ |
| Responsive Design (Mobile, Tablet, Desktop) | ✅ |
| Reminder Date & Time Picker | ✅ |

### Upcoming Features

- Note History / Versioning
- File Attachments (PDF, DOCX, Images, ZIP)
- Import Notes (TXT, Markdown, JSON)
- Security improvements (Rate limiting, XSS Protection, JWT Refresh)
- Performance improvements (Infinite scrolling, Lazy loading)

---

## 🏗️ Project Structure

```
memora/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # Authentication logic
│   │   ├── noteController.js         # Notes CRUD & actions
│   │   └── categoryController.js     # Categories CRUD
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js           # Global error handling
│   │   └── upload.js                 # Multer file upload
│   ├── models/
│   │   ├── User.js                   # User schema
│   │   ├── Note.js                   # Note schema
│   │   └── Category.js              # Category schema
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── noteRoutes.js            # Notes endpoints
│   │   └── categoryRoutes.js        # Categories endpoints
│   ├── utils/
│   │   └── validators.js            # Input validation rules
│   ├── uploads/                      # Uploaded files
│   ├── server.js                     # Express entry point
│   ├── package.json
│   └── .env                          # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js              # Axios instance with interceptors
│   │   │   ├── authApi.js            # Auth API service
│   │   │   ├── notesApi.js           # Notes API service
│   │   │   └── categoriesApi.js      # Categories API service
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx    # Auth guard
│   │   │   ├── PublicRoute.jsx       # Public route wrapper
│   │   │   ├── FullPageLoader.jsx    # Loading screen
│   │   │   ├── Header.jsx            # Top navigation bar
│   │   │   ├── Sidebar.jsx           # Side navigation with stats
│   │   │   ├── NoteCard.jsx          # Note card component
│   │   │   ├── NoteEditor.jsx        # Note create/edit modal
│   │   │   ├── RichTextEditor.jsx    # TipTap rich text editor
│   │   │   ├── CategoryModal.jsx     # Category create/edit/delete modal
│   │   │   └── LoadingSkeleton.jsx   # Skeleton loading components
│   │   ├── hooks/
│   │   │   └── useKeyboardShortcuts.js  # Keyboard shortcut handler
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state management
│   │   │   └── ThemeContext.jsx      # Dark/light mode
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Dashboard.jsx         # Main workspace
│   │   │   ├── Profile.jsx           # Profile & settings page
│   │   │   └── NotFound.jsx          # 404 page
│   │   ├── App.jsx                   # Router setup
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Tailwind & global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── package.json                      # Root-level scripts
├── README.md
└── .gitignore
```

---

## 🛠️ Technologies Used

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Rich Text Editor**: TipTap (ProseMirror)
- **Icons**: React Icons (Feather)
- **Notifications**: React Hot Toast
- **State Management**: Context API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)

### Quick Start (Root)

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Start both servers
npm run dev
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure your environment:
```bash
cp .env.example .env
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

#### 3. Run the Application

**Both servers** (from root):
```bash
npm run dev
```

**Backend** (from `backend/`):
```bash
npm run dev
```

**Frontend** (from `frontend/`):
```bash
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new note |
| `Ctrl+S` | Save current note (in editor) |
| `Ctrl+F` | Focus search bar |
| `Ctrl+D` | Show delete hint |
| `Ctrl+B` | Bold text (in editor) |
| `Ctrl+I` | Italic text (in editor) |
| `Ctrl+U` | Underline text (in editor) |
| `Escape` | Close editor / modals |

---

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/password` | Change password | ✅ |
| POST | `/avatar` | Upload avatar | ✅ |
| DELETE | `/account` | Delete account | ✅ |

### Notes Routes (`/api/notes`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all notes (with filters) | ✅ |
| GET | `/tags` | Get all user tags | ✅ |
| GET | `/:id` | Get single note | ✅ |
| POST | `/` | Create note | ✅ |
| PUT | `/:id` | Update note | ✅ |
| DELETE | `/:id` | Delete note permanently | ✅ |
| PUT | `/:id/pin` | Toggle pin | ✅ |
| PUT | `/:id/favorite` | Toggle favorite | ✅ |
| PUT | `/:id/trash` | Move to trash | ✅ |
| PUT | `/:id/restore` | Restore from trash | ✅ |

### Categories Routes (`/api/categories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all categories | ✅ |
| POST | `/` | Create category | ✅ |
| PUT | `/:id` | Update category | ✅ |
| DELETE | `/:id` | Delete category | ✅ |

---

## 📋 Changelog

### v1.1.0 - Feature Release
**Date**: July 14, 2026

**New Features:**
- ✅ Rich Text Editor (TipTap) with bold, italic, underline, lists, headings, code blocks, quotes, and hyperlinks
- ✅ Categories CRUD (create, edit, delete) with color picker
- ✅ Auto Save status indicator (Saving... / Saved / Unsaved changes)
- ✅ Keyboard shortcuts (Ctrl+N, Ctrl+S, Ctrl+F, Ctrl+D)
- ✅ Export notes as TXT, Markdown, or JSON
- ✅ Export all notes as JSON
- ✅ Dashboard statistics (Total notes, Favorites, Archived, Trash, Categories)
- ✅ Improved empty states with contextual icons and helpful messages
- ✅ Loading skeleton placeholders for notes grid
- ✅ 404 Not Found page with navigation help
- ✅ Title Z-A and Pinned First sorting options
- ✅ Default note color preference from user settings applied to new notes
- ✅ Error handling improvements with better server connection messages

### v1.0.0 - Initial Release
**Date**: July 14, 2026

**Backend:**
- ✅ Express server with MVC architecture
- ✅ MongoDB connection with Mongoose
- ✅ User model with password hashing (bcrypt)
- ✅ Note model with full feature set
- ✅ Category model
- ✅ JWT authentication & authorization
- ✅ Input validation (express-validator)
- ✅ Global error handling middleware
- ✅ File upload setup (Multer)
- ✅ Security middleware (Helmet, CORS)

**Frontend:**
- ✅ Vite + React 18 setup
- ✅ Tailwind CSS configuration with custom theme
- ✅ React Router v6 with protected routes
- ✅ Auth Context API
- ✅ Theme Context (dark/light mode)
- ✅ Axios instance with interceptors
- ✅ Login & Registration pages
- ✅ Dashboard with sidebar, header, notes grid/list
- ✅ Note card with all actions
- ✅ Note editor modal with color picker
- ✅ Search, filters, sorting
- ✅ Pin, favorite, archive, trash/restore
- ✅ Loading states & animations
- ✅ Toast notifications
- ✅ Fully responsive layout

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT © Memora
