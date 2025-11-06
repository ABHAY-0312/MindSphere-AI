# MindSphere AI - AI-Powered Learning Platform

An intelligent learning management system powered by Google's Gemini AI that creates personalized courses from various sources (YouTube, PDFs, text) and provides an interactive learning experience with quizzes, flashcards, and an AI tutor chatbot.

## Features

- 🤖 **AI-Powered Course Generation**: Create courses from YouTube videos, PDFs, or text using Gemini AI
- 📚 **Course Catalog**: Browse and enroll in pre-made courses
- 📝 **Interactive Learning**: 
  - Structured lessons with progress tracking
  - AI-generated quizzes
  - Flashcards for spaced repetition
  - Comprehensive notes
- 💬 **AI Tutor Chatbot**: Get personalized help and explanations based on your enrolled courses
- 🔐 **User Authentication**: Secure signup/login with JWT tokens
- 📊 **Progress Tracking**: Track your learning progress across all courses
- 🎓 **Certificates**: Earn certificates upon course completion

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini AI** for content generation
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ABHAY-0312/MindSphere.git
   cd MindSphere
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Frontend** - Create `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```

   **Backend** - Create `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env`:
   ```
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/mindsphere
   JWT_SECRET=your_secure_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash-exp
   ```

5. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:4000`

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

## Usage

### Creating an Account
1. Click "Sign Up" in the header
2. Enter your name, email, and password
3. You'll be automatically logged in and redirected to the dashboard

### Creating a Course
1. Navigate to "Create Course" from the header or dashboard
2. Choose your source type:
   - **PDF**: Upload a PDF document
   - **URL**: Enter a YouTube URL or web link
3. Enter a course title
4. Click "Generate Course" and wait for AI to create your personalized course

### Enrolling in Catalog Courses
1. Go to "Catalog" from the header
2. Browse available courses
3. Click on a course to view details
4. Click "Enroll Now" to add it to your dashboard

### Learning with AI Tutor
1. Navigate to "AI Tutor" from the header
2. Ask questions about your courses
3. Get personalized explanations and study guidance

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - Get all user courses (authenticated)
- `POST /api/courses` - Create a new course (authenticated)
- `GET /api/courses/:id` - Get single course (authenticated)
- `PATCH /api/courses/:id` - Update course progress (authenticated)

### Catalog
- `GET /api/catalog` - Get catalog courses
- `POST /api/catalog/:id/enroll` - Enroll in catalog course (authenticated)

### Chat
- `POST /api/chat` - Send message to AI tutor (authenticated)

### Health
- `GET /api/health` - Server health check

## Project Structure

```
MindSphere/
├── src/                          # Frontend source
│   ├── components/               # React components
│   ├── lib/                      # API client and utilities
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # App entry point
├── server/                       # Backend source
│   └── src/
│       ├── models/               # Mongoose models
│       ├── routes/               # Express routes
│       ├── middleware/           # Custom middleware
│       ├── services/             # Business logic (Gemini service)
│       ├── lib/                  # Database connection
│       └── index.js              # Server entry point
├── .env.example                  # Frontend env template
├── server/.env.example           # Backend env template
└── README.md                     # This file
```

## Development

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Keep API keys secure and rotate them regularly
- Use HTTPS in production
- Implement rate limiting for API endpoints in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or building your own applications.

## Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [React](https://react.dev/) and [Express](https://expressjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
