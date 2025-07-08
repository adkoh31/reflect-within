# ReflectWithin

**A fitness and mental well-being journaling companion that asks empathetic, progress-aware questions.**

ReflectWithin is your friend-like companion for tracking workouts, daily life, and mental state. Record reflections via speech or text, and receive supportive, progress-aware questions based on your recent entries. Premium users unlock Journal Mode and an Insights Dashboard for deeper self-discovery.

## Features

- 🏃‍♂️ **Fitness & Mental Health Journal**: Log workouts, daily life, and mental state
- 🗣️ **Speech-to-Text**: Use your voice for post-workout or daily reflections (react-speech-recognition)
- 🤖 **Progress-Aware AI Questions**: AI references your last 5 entries for personalized, empathetic prompts
- 📒 **Journal Mode (Premium)**: View all past reflections (user input + AI question) as cards, export as PDF
- 📊 **Insights Dashboard (Premium)**: Bar charts for reflection themes and mood trends (Chart.js)
- ☁️ **Premium Storage**: Toggle to store reflections in MongoDB Atlas (free users use localStorage)
- 🎨 **Calming, Mobile-First UI**: Waffle-inspired, blue gradients, rounded corners, Inter font

## Sample Output

**Journal Entry:**
- *July 7, 2025, 10:39 AM*: Ran 5K, felt unstoppable → What made that 5K feel so empowering today?

**Insights Dashboard:**
- Themes: Fitness (3), Stress (2)
- Moods: Positive (2), Stressed (1)

## Premium Features
- **Journal Mode**: View/export all reflections
- **Insights Dashboard**: Visualize your progress
- **Server Storage**: Store entries in MongoDB (Atlas free tier)
- **Toggle Premium**: Use the in-app switch (no login required)

## Setup Instructions

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB Atlas (for premium)
- OpenAI API key (GPT-4o mini) or xAI API key (optional)

### Installation

1. **Clone/download the project**
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
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add:
   ```
   # For OpenAI (GPT-4o mini)
   OPENAI_API_KEY=your-openai-key-here
   # For MongoDB Atlas
   MONGODB_URI=your-mongodb-uri-here
   # OR for xAI (Grok)
   XAI_API_KEY=your-xai-key-here
   ```
   **Note:** No API key needed for mock/test mode.
5. **Start both frontend and backend (recommended)**
   ```bash
   npm run dev
   ```
   This starts both the React frontend (port 3000) and Node.js backend (port 3001) concurrently.

### Alternative Startup Options
- **Frontend only**: `npm start` (requires backend to be running separately)
- **Backend only**: `npm run server` (for backend development)
- **Backend production**: `npm run server:start`

## Usage
- **Toggle Premium**: Use the switch in the app to enable premium features (no login required)
- **Journal**: Click "New Entry" to add a reflection (speech or text)
- **Insights**: View charts in the Insights tab (premium only)
- **Download Journal**: Export as PDF from the Journal tab

## Project Structure

```
reflect-within/
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   └── utils/          # Utility functions
├── server/             # Node.js backend
│   ├── routes/         # Express routes
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB models
│   └── middleware/     # Express middleware
├── public/             # Static assets
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── tailwind.config.js  # Tailwind configuration
├── package.json        # Frontend dependencies & scripts
└── README.md           # This file
```

## Security
- `.env` and `node_modules` are gitignored by default
- No authentication; premium is a toggle
- All data is local unless premium is enabled

## Troubleshooting
- **Speech-to-text not working?** Use Chrome or check browser permissions
- **No AI response?** Check API key or use mock mode
- **MongoDB errors?** Check your Atlas URI and network access
- **Port conflicts?** Backend runs on 3001, frontend on 3000

## Disclaimer
ReflectWithin is for self-reflection and well-being, not a substitute for professional therapy. For mental health emergencies, contact a professional or call 988 in the US.

---

**Built for thoughtful fitness & mental well-being journaling** 