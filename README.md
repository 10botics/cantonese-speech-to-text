# Cantonese Speech-to-Text Web Application

A professional web application for Cantonese speech-to-text transcription with AI-powered speaker identification and interactive audio playback.

## Features

### 🎯 Core Functionality
- **Cantonese Speech Recognition** - High-quality transcription using ElevenLabs AI
- **Speaker Diarization** - Automatic speaker separation and identification
- **AI Speaker Identification** - Match speakers to participant names using DeepSeek R1
- **Interactive Audio Player** - Click on text to jump to specific audio timestamps
- **Chinese Character Conversion** - Automatic simplified to traditional Chinese conversion

### 🛡️ Production Ready
- **Rate Limiting** - 10 requests per 24 hours per user
- **Audio Duration Limits** - Maximum 10 minutes, 50MB file size
- **Secure Backend** - API keys managed server-side
- **Error Handling** - Comprehensive error messages and validation

### 🎬 Demo Available
Try the live demo with a sample from **觀塘區議會第七次會議** (Kwun Tong District Council meeting):
- **Audio Source**: Official Hong Kong District Council meeting proceedings
- **Content**: "其他事項" (Other Matters) agenda item (4:38 duration)
- **Participants**: 46+ council members and government officials
- **Language**: Cantonese with traditional Chinese output

## Quick Start

### 1. Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd speech-to-text

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your FAL_AI_API_KEY to .env.local
```

### 2. Get API Key
1. Sign up at [fal.ai](https://fal.ai)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   FAL_AI_API_KEY=your_actual_api_key_here
   ```

### 3. Run Development
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
1. Push to GitHub
2. Import to Vercel
3. Add `FAL_AI_API_KEY` to Vercel environment variables
4. Deploy!

## Usage

### Option 1: Try Demo
1. Click **"🎬 Try Demo"** button
2. Watch automatic transcription of council meeting audio
3. See AI speaker identification in action

### Option 2: Upload Your Own Audio
1. Upload audio file (MP3, WAV, M4A supported)
2. Select language (Cantonese recommended)
3. Optionally enable speaker identification
4. View results with interactive audio player

## Technical Architecture

### Backend API Routes
- `/api/transcribe` - Speech-to-text processing with fal.ai/elevenlabs
- `/api/speaker-identify` - AI speaker identification with DeepSeek R1

### Rate Limiting & Security
- IP-based rate limiting (24-hour windows)
- Server-side API key management
- Audio validation and size limits
- Comprehensive error handling

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Vercel Serverless Functions
- **AI Services**: fal.ai (ElevenLabs speech-to-text, DeepSeek R1)
- **Deployment**: Vercel

## Demo Content Attribution

The demo audio is sourced from official Hong Kong District Council proceedings:

- **Meeting**: 觀塘區議會第七次會議 (Kwun Tong District Council 7th Meeting)
- **Date**: 2025-01-06
- **Agenda**: 其他事項 (Other Matters) - 4:38 duration
- **Source**: [Hong Kong District Councils](https://www.districtcouncils.gov.hk/kt/tc_chi/meetings/dcmeetings/dc_meetings_audio.php?meeting_id=28585)
- **Copyright**: © Hong Kong District Councils (Used under fair use for demonstration)

## Development

### Project Structure
```
├── app/
│   ├── api/              # Backend API routes
│   │   ├── lib/          # Shared utilities
│   │   ├── transcribe/   # Speech-to-text endpoint
│   │   └── speaker-identify/ # Speaker ID endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # App layout
│   └── page.tsx          # Main app component
├── public/               # Static files
│   ├── demo-audio.mp3    # Demo audio file
│   └── demo-participants.txt # Demo participant list
└── tests/                # Test files and examples
```

### Key Features Implementation
- **Rate Limiting**: In-memory store with IP tracking
- **Audio Validation**: Client and server-side duration/size checks
- **Speaker ID**: DeepSeek R1 AI with conversation pattern analysis
- **Chinese Conversion**: Simplified to Traditional character conversion
- **Interactive Player**: Audio synchronization with transcript text

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper attribution
4. Submit pull request

For demo content, ensure proper attribution to original sources. 