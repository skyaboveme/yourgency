# Yourgency AI

**Yourgency AI** is an intelligent sales and client management assistant designed specifically for marketing agencies serving the home service industry (HVAC, Plumbing, Electrical, etc.).

Powered by Google's Gemini models, it helps sales teams identify prospects, score leads, and generate strategic insights.

## Features

- **Mission Control Dashboard**: Real-time view of pipeline value, active prospects, and critical alerts.
- **AI Prospecting**:
  - **Lead Scoring**: Uses `gemini-3-flash-preview` to analyze company data and generate a composite fit score.
  - **Deep Thinking Mode**: Uses `gemini-3-pro-preview` with extended thinking budget to generate comprehensive strategic domination plans.
- **Deal Pipeline**: Visual Kanban-style board to manage opportunities from Prospect to Close.
- **Yourgency Assistant Chat**:
  - Context-aware chat for drafting emails and strategy.
  - **Google Maps Grounding**: Toggle to pull real-time location data for prospect research using `gemini-2.5-flash`.

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/skyaboveme/yourgency.git
   cd yourgency
   ```

2. **Install dependencies**
   (Assuming a standard React build environment)
   ```bash
   npm install
   ```

3. **Environment Variables**
   Ensure you have a valid Google GenAI API Key available in your environment as `API_KEY`.

4. **Run the Application**
   ```bash
   npm start
   ```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google GenAI SDK (@google/genai)
- **Charts**: Recharts
- **Icons**: Lucide React

## License

Proprietary software for Yourgency.
