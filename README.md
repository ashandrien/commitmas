# Commitmas

Your Year in Code, Wrapped - A GitHub Wrapped-style application that reviews your GitHub contributions for the year.

## Features

- **GitHub OAuth Authentication** - Secure sign-in with GitHub
- **Contribution Stats** - Total commits, PRs, issues, and reviews
- **Top Repositories** - Your most active repos of the year
- **Language Breakdown** - Programming languages you used
- **Activity Patterns** - When you code (time of day, day of week)
- **Emoji Analysis** - Your favorite emojis in comments
- **Achievements** - Badges earned based on your activity
- **Redis Caching** - Fast data retrieval with cached results

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Tailwind CSS
- **Cache**: Redis
- **Auth**: GitHub OAuth (Passport.js)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for Redis)
- GitHub OAuth App credentials

### Setup

1. **Start Redis**:
   ```bash
   docker run -d --name commitmas-redis -p 6379:6379 redis:7-alpine
   ```

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your GitHub OAuth credentials
   npm install
   npm run dev
   ```

3. **Configure Frontend**:
   ```bash
   cd commitmas-frontend
   npm install
   npm run dev
   ```

4. **Open the app**: Navigate to http://localhost:5173

### Docker Compose (Alternative)

```bash
# Copy your .env file to backend/.env first
docker-compose up
```

## Environment Variables

### Backend (.env)

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=random_secret_string
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
CALLBACK_URL=http://localhost:8000/auth/callback
PORT=8000
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /api/user` - Get authenticated user
- `GET /api/wrapped` - Get wrapped data (cached)
- `GET /health` - Health check

## License

MIT
ASHANDRIEN