# MindSphere Backend Server

This is the backend API server for the MindSphere AI learning platform.

## Prerequisites

- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -base64 32`)
   - `GEMINI_API_KEY`: Your Google Gemini API key from https://ai.google.dev/

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:4000` (or the PORT specified in .env).

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/catalog` - Get course catalog

### Protected Endpoints (require JWT token)
All these endpoints require `Authorization: Bearer <token>` header:

- `GET /api/courses` - Get user's courses
- `POST /api/courses` - Create a new course
- `GET /api/courses/:id` - Get single course
- `PATCH /api/courses/:id` - Update course progress
- `POST /api/catalog/:id/enroll` - Enroll in catalog course
- `POST /api/chat` - Send message to AI tutor

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 4000 | No |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 | No |
| MONGODB_URI | MongoDB connection string | - | Yes |
| JWT_SECRET | Secret key for JWT tokens | - | Yes |
| GEMINI_API_KEY | Google Gemini API key | - | Yes |
| GEMINI_MODEL | Gemini model to use | gemini-2.0-flash-exp | No |

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB: https://docs.mongodb.com/manual/installation/
2. Start MongoDB: `mongod`
3. Use connection string: `mongodb://localhost:27017/mindsphere`

### Option 2: MongoDB Atlas (Cloud)
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string and add to .env
4. Whitelist your IP address in Atlas dashboard

## Troubleshooting

### Server won't start
- Check MongoDB is running: `mongod --version`
- Verify .env file exists and has all required variables
- Check port 4000 is not already in use

### Gemini API errors
- Verify GEMINI_API_KEY is correct
- Check API quota at https://ai.google.dev/
- Try switching GEMINI_MODEL to `gemini-2.0-flash-exp`

### CORS errors
- Ensure CORS_ORIGIN in .env matches frontend URL
- Default is `http://localhost:5173` for Vite dev server

## Project Structure

```
server/
├── src/
│   ├── models/          # Mongoose models
│   │   ├── User.js      # User model with auth
│   │   └── Course.js    # Course model
│   ├── routes/          # API routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── courses.js   # Course CRUD routes
│   │   ├── catalog.js   # Catalog routes
│   │   └── chat.js      # AI chat routes
│   ├── middleware/      # Express middleware
│   │   └── auth.js      # JWT authentication
│   ├── services/        # Business logic
│   │   └── geminiService.js  # Gemini AI integration
│   ├── lib/             # Utilities
│   │   └── db.js        # Database connection
│   └── index.js         # Server entry point
├── package.json
└── .env.example
```
