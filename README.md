# MindDump - AI-Powered Journaling App

MindDump is a full-stack web application that helps users express their thoughts and emotions freely, and then receive feedback, insights, and weekly behavioral summaries using AI.

## Features

- **Secure Authentication**: Sign up, login, and logout functionality
- **Journal Entries (Dumps)**: Create, view, edit, and delete journal entries
- **AI Insights**: Get sentiment analysis and personalized insights for each entry
- **Weekly Summaries**: View mood trends, emotions, and AI-generated suggestions
- **Subscription Model**: 14-day free trial with Stripe integration

## Tech Stack

- **Frontend**: Next.js (React) with TailwindCSS
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI API for sentiment analysis and insights
- **Payments**: Stripe API for subscription handling

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- OpenAI API key
- Stripe account (for payment processing)

### Setup

1. Clone the repository:
```
git clone <repository-url>
cd MindDump
```

2. Install dependencies:
```
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the backend directory using the provided `.env.example` as a template
   - Add your MongoDB connection string, JWT secret, OpenAI API key, and Stripe keys

4. Start the development servers:
```
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd frontend
npm run dev
```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
MindDump/
├── frontend/                 # Next.js frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Next.js pages
│   │   ├── styles/           # CSS and styling
│   │   └── utils/            # Utility functions
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # TailwindCSS configuration
│
├── backend/                  # Express backend
│   ├── config/               # Configuration files
│   ├── middleware/           # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── package.json          # Backend dependencies
│   └── server.js             # Entry point
│
└── README.md                 # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get the current user

### Dumps (Journal Entries)
- `GET /api/dumps` - Get all dumps for a user
- `POST /api/dumps` - Create a new dump
- `GET /api/dumps/:id` - Get a single dump
- `PATCH /api/dumps/:id` - Update a dump
- `DELETE /api/dumps/:id` - Delete a dump
- `GET /api/dumps/summary/weekly` - Get weekly summary

### User Management
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/change-password` - Change user password

### Payments (Stripe)
- `POST /api/stripe/create-checkout-session` - Create a subscription checkout session
- `GET /api/stripe/subscription-status` - Get subscription status
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/resume-subscription` - Resume canceled subscription

### AI Features
- `POST /api/ai/analyze` - Analyze text without saving
- `GET /api/ai/weekly-insights` - Generate weekly insights
- `POST /api/ai/reprocess/:dumpId` - Reprocess a dump with AI
- `GET /api/ai/mood-trends` - Get mood trends over time

## Mobile Support

The application is built with responsive design principles to ensure it works well on mobile devices. The design can be easily converted into a native mobile app using frameworks like React Native or Capacitor in the future.

## License

[MIT License](LICENSE)

---

Created with ❤️ and 🧠 