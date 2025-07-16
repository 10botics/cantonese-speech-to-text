# Cantonese Speech to Text

A professional web application that transcribes Cantonese audio files with automatic speaker diarization, optional AI-powered participant name identification, and interactive synchronized audio playback. Built with Fal.ai's ElevenLabs speech-to-text API and DeepSeek R1 for intelligent speaker analysis.

## ✨ Features

### Core Functionality
- 🎵 **Drag & Drop Upload** - Intuitive audio file upload interface
- 🎯 **Speaker Diarization** - Automatic speaker identification and separation
- 🗣️ **Cantonese Support** - Optimized for Cantonese with multi-language detection
- 🚀 **Real-time Processing** - Live progress tracking with detailed status updates
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### Enhanced Audio Experience
- 🎧 **Interactive Audio Player** - ElevenLabs-style circular play/pause controls
- ⚡ **Synchronized Highlighting** - Word-level text highlighting during playback
- 🎯 **Click-to-Seek** - Click any word to jump to that moment in audio
- ⏰ **Timestamp Navigation** - Precise time display and seeking functionality
- 🎪 **Speaker Navigation** - Quick jump buttons between speaker segments

### AI-Powered Intelligence
- 🤖 **AI Speaker Identification** - Powered by DeepSeek R1 via Fal.ai (optional, default OFF)
- 👥 **Participant Name Detection** - Input participant lists for automatic name matching  
- 🧠 **Context-Aware Matching** - Uses conversation roles and expertise for identification
- ✅ **Accuracy Safeguards** - Validates against transcription inaccuracies
- 🔄 **Clear & Re-identify** - Button to retry identification with different participants

### Professional Logging & Analytics
- 📊 **Comprehensive Logging** - Real-time status updates with timestamps
- ⏱️ **Performance Metrics** - Processing speed, word count, and completion tracking
- 📈 **File Analytics** - Size, duration, and processing efficiency metrics
- 🔄 **Progress Tracking** - Live elapsed time and completion percentages

### Developer Experience
- 🔑 **Pre-filled API Key** - Streamlined local testing environment
- 🧪 **Testing Suite** - Comprehensive validation scripts for all features
- 📋 **Detailed Logs** - Scrollable processing panel with clear/export options
- ☁️ **Vercel-Ready** - One-click deployment configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Fal.ai API key

### Installation & Running

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd speech-to-text
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the "Cantonese Speech to Text" application
   - The server will automatically reload when you make changes to the code

### Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linting
npm run lint
```

### Stopping the Server

- Press `Ctrl + C` in the terminal to stop the development server
- Or close the terminal window

### Troubleshooting

- **Port 3000 already in use?** The app will automatically use the next available port (3001, 3002, etc.)
- **Dependencies issues?** Try deleting `node_modules` and running `npm install` again
- **Build errors?** Check that you have Node.js 18+ installed with `node --version`

## 📖 Usage Guide

### Basic Transcription (Default Workflow)

1. **Upload Audio File:**
   - Drag and drop an audio file into the upload area, or click to browse
   - Supports MP3, WAV, M4A, FLAC and most common audio formats

2. **Configure Settings:**
   - **API Key:** Use the pre-filled key for local testing, or click "Show" to enter your own
   - **Language:** Select from Cantonese, Mandarin, English, or Auto-detect

3. **Process Audio:**
   - Click upload or drop your file to begin transcription
   - Watch real-time progress tracking with detailed status updates
   - ElevenLabs AI processes the audio with speaker diarization

4. **Enjoy Interactive Results:**
   - View transcription organized by speaker segments
   - Click any word to jump to that moment in the audio
   - Use the circular audio player for playback control
   - Words highlight in real-time during playback

### Advanced: AI Speaker Identification

5. **Enable Speaker Identification (Optional):**
   - Check "AI Speaker Identification 🤖" checkbox before uploading
   - Enter participant names in the textarea that appears
   - Format: "John Smith (Chairman), Mary Wong (Housing Manager), David Lee..."

6. **Enhanced Results:**
   - After transcription, DeepSeek R1 automatically analyzes conversation patterns
   - See results like "Speaker 1 (John Smith)" instead of just "Speaker 1"
   - View identification count in the results header
   - Use "Clear & Re-identify" to try different participant lists

## 🔧 Advanced Features

### AI Speaker Identification Setup

1. **Enable the Feature:**
   - Check the "AI Speaker Identification 🤖" checkbox in the settings panel
   - Feature is **disabled by default** to keep the basic workflow simple
   - When enabled, a participant names textarea will appear

2. **Prepare Participant List:**
   - Enter participant names in the textarea (comma-separated)
   - Include roles, titles, or relevant context for better matching
   - Example: "John Smith (Chairman), Mary Wong (Housing Manager), David Lee (Police Commander)"

3. **Upload and Process:**
   - Upload your audio file normally - transcription runs first
   - If speaker identification is enabled and participants are provided, AI analysis runs automatically after transcription
   - DeepSeek R1 analyzes conversation patterns, expertise areas, and speaking roles

4. **Results:**
   - Matches speakers based on context rather than potentially inaccurate transcribed names
   - Displays results as "Speaker 1 (John Smith)" or "Speaker 2 (Unknown)" for unidentified
   - Shows identification count in the results header

5. **Re-identification:**
   - Use "Clear & Re-identify" button in the transcription results to try again
   - Modify participant lists and retry with different names/roles
   - Processing typically takes 60-70+ seconds for complex meetings

### Interactive Audio Player Usage

1. **Playback Controls:**
   - Click the circular play/pause button to control audio
   - Use the progress bar to seek to any position
   - View current time and total duration

2. **Text Synchronization:**
   - Words highlight in real-time during playback
   - Click any word to jump to that exact moment
   - Hover over words to see precise timestamps

3. **Speaker Navigation:**
   - Use speaker segment buttons for quick navigation
   - Segments maintain chronological order for natural flow
   - Visual indicators show current playback position

### Performance Monitoring

The logging panel provides detailed insights:
- **Real-time Updates:** Status changes with emoji indicators and timestamps
- **File Information:** Name, size, and processing metrics
- **Performance Data:** Words per minute, speaker count, processing speed
- **Error Tracking:** Detailed error messages with resolution suggestions

### Expected Performance

- **Transcription Speed:** 2-4x real-time (10-minute audio = 2.5-5 minutes processing)
- **Speaker Identification:** Additional 60-70+ seconds for complex meetings
- **Accuracy:** 75-100% speaker identification success rate for role-based matching
- **File Size Support:** Tested with files up to 50MB+ and 2+ hour meetings

## 🧪 Testing the Application

We provide a comprehensive test suite to validate all features and functionality.

### Quick Test
```bash
# Set your API key as environment variable
export FAL_API_KEY="your-api-key-here"

# Run basic API integration test
node tests/api/test-template.js

# Run Cantonese-specific test
node tests/api/test-cantonese.js

# Run speaker identification test
node tests/api/test-speaker-identification.js
```

### Comprehensive Testing
For detailed testing instructions, performance benchmarks, and troubleshooting, see:

**📁 [Test Suite Documentation](tests/README.md)**

The test suite validates:
- API key authentication and connectivity
- Speech-to-text accuracy for Cantonese content
- Speaker diarization quality and timing
- AI participant identification with DeepSeek R1
- Chinese character conversion accuracy
- Audio synchronization and highlighting
- Response format consistency and performance benchmarks

## 🔑 Getting Your Fal.ai API Key

1. **Sign up at Fal.ai:**
   - Go to [https://fal.ai](https://fal.ai)
   - Create an account or sign in

2. **Access your API keys:**
   - Go to your dashboard: [https://fal.ai/dashboard](https://fal.ai/dashboard)
   - Navigate to the "Keys" section in the sidebar
   - Click "Create new key" 
   - Copy your API key (format: `Key your-key-here`)

3. **Enter the key in the app:**
   - In the application, click on the "Show" button next to "Fal.ai API Key"
   - Paste your API key in the input field (or use the pre-filled key for local testing)
   - The key is stored locally in your browser session

**Note:** The API key should be in the format that starts with your actual key value. The app will automatically add the "Key " prefix for API calls.

## 🔄 How It Works

1. **Upload Audio:** Drag and drop an audio file or click to browse
2. **Basic Transcription:** The app sends your audio to Fal.ai's ElevenLabs speech-to-text API with real-time progress tracking
3. **Speaker Diarization:** The API identifies different speakers in the audio automatically
4. **AI Enhancement (Optional):** If enabled, DeepSeek R1 analyzes speakers and matches them with provided participant names
5. **Interactive Results:** Transcription displays with synchronized audio playback, clickable text, and identified speaker names

## 🎵 Supported Audio Formats

- MP3
- WAV  
- M4A
- FLAC
- Most common audio formats supported by the browser

## 🎛️ API Configuration

The app integrates multiple AI services:

### Speech-to-Text (Fal.ai ElevenLabs)
- **Client:** `@fal-ai/client` (official JavaScript client)
- **Model:** `fal-ai/elevenlabs/speech-to-text`
- **Method:** `fal.subscribe()` with real-time updates
- **Parameters:**
  - `audio_url`: Auto-uploaded audio file
  - `language_code`: "yue" (Cantonese), "eng" (English), or auto-detect
  - `tag_audio_events`: Audio event detection (default: true)
  - `diarize`: Speaker identification (default: true)

### AI Speaker Identification (DeepSeek R1)
- **Service:** Fal.ai Any LLM API
- **Model:** `deepseek/deepseek-r1`
- **Purpose:** Context-based participant name matching
- **Input:** Transcription + participant list
- **Output:** Speaker-to-name mappings with confidence levels

### Features Integration
- **File Handling:** Automatic upload and processing
- **Queue Support:** Real-time progress via `onQueueUpdate`
- **Error Handling:** Comprehensive error catching and user feedback
- **Performance:** Optimized for large files and long conversations

## 🎯 Use Cases

### Meeting Transcription
- **Corporate Meetings:** Automatic participant identification
- **Government Sessions:** Public meeting transcriptions with speaker tracking
- **Educational Content:** Lecture transcriptions with Q&A speaker separation

### Media Processing
- **Podcast Transcription:** Multi-host conversation tracking
- **Interview Analysis:** Question-answer speaker identification
- **Broadcasting:** News or talk show segment separation

### Research & Analysis
- **Conversation Analysis:** Speaker behavior and interaction patterns
- **Content Creation:** Searchable transcripts with precise timing
- **Accessibility:** Audio content made text-accessible with navigation

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with App Router and TypeScript
- **Styling:** Tailwind CSS with custom components
- **Icons:** Lucide React for consistent iconography
- **AI Services:** 
  - Fal.ai ElevenLabs (Speech-to-Text)
  - DeepSeek R1 via Fal.ai (Speaker Identification)
- **Audio Processing:** Web Audio API with HTML5 audio
- **State Management:** React hooks with optimized re-rendering
- **Deployment:** Vercel with edge function support

## 📊 Example Output

### Basic Transcription (Speaker ID Disabled)
```
Speaker 1
二项八其他事项，请问有无议员要抬出？好，啊，谢谢。任市民议员。

Speaker 2  
嗯高主席，欸咁我阻大家很，好快几分钟时间，咁呢就可以有关那个高空杂物给情况呢...
```

### With AI Speaker Identification Enabled
```
Speaker 1 (何立基先生)
二项八其他事项，请问有无议员要抬出？好，啊，谢谢。任市民议员。

Speaker 2 (Unknown)
嗯高主席，欸咁我阻大家很，好快几分钟时间，咁呢就可以有关那个高空杂物给情况呢...

Speaker 3 (凌煒傑先生)
啊，前处长说的那个 AI 人工智能呢，其实是呃，我们要装了一部呃，监控系统这里...
```

### Real-Time Processing Logs
```
[14:32:15] 🚀 Starting transcription for file: meeting.mp3 (12.4 MB)
[14:32:16] ✅ API client configured successfully  
[14:32:17] 📤 Uploading audio file to Fal.ai...
[14:32:45] 🔄 Processing audio with ElevenLabs AI...
[14:33:12] ⚡ Processing completed in 57.2 seconds
[14:33:13] 🎯 Detected language: yue (confidence: 95.2%)
[14:33:13] 👥 Speakers identified: 3
[14:33:14] 🤖 Starting AI speaker identification with DeepSeek R1...
[14:34:22] ⚡ Speaker identification completed in 68.3 seconds
[14:34:22] 🎯 Speaker 1: 何立基先生
[14:34:22] ❓ Speaker 2: Unknown  
[14:34:22] 🎯 Speaker 3: 凌煒傑先生
[14:34:22] 📊 Successfully identified 2/3 speakers
[14:34:22] 🎉 Transcription successfully completed!
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click
4. Users will enter their own Fal.ai API keys in the deployed app

### Environment Variables

No server-side environment variables needed - API keys are entered by users in the frontend for security and flexibility.

## 💡 Tips & Troubleshooting

### Speaker Identification Best Practices

- **Include roles/titles:** "John Smith (Chairman)" works better than just "John Smith"
- **Provide context:** "Mary Wong (Housing Department)" helps the AI understand expertise areas
- **Use Unknown appropriately:** The AI conservatively uses "Unknown" when uncertain - this is good!
- **Processing time:** 60-70+ seconds is normal for complex meetings with multiple speakers
- **Re-identify freely:** Try different participant lists or formats if initial results aren't optimal

### Common Issues

- **Feature not working:** Ensure the checkbox is checked AND participant names are provided
- **Slow performance:** DeepSeek R1 is thorough but takes time - this is expected for quality results  
- **Poor identification:** Try including more role/context information in participant names
- **Missing participants:** The AI only selects from your provided list - add missing names and re-identify

## 🤝 Contributing

We welcome contributions! Areas for enhancement:
- Additional language support
- Advanced speaker identification algorithms
- Export functionality (SRT, VTT, etc.)
- Batch processing capabilities
- Custom AI model integration
- Real-time collaboration features
- Mobile app version

## 📄 License

MIT License 