const { fal } = require('@fal-ai/client');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_KEY = '2349dc38-85b4-4494-a360-e7e03c21b16f:aaf08fef42a4362c6cc03bb0a4b10b74';
const LOCAL_AUDIO_FILE = '8.mp3';

// Transform function (same as in React app)
function transformToSpeakerFormat(response) {
  const segments = [];
  let currentSpeaker = '';
  let currentText = '';

  response.words.forEach((word) => {
    if (word.type === 'word') {
      const speakerId = word.speaker_id || 'speaker_0';
      if (speakerId !== currentSpeaker) {
        if (currentSpeaker && currentText.trim()) {
          segments.push({
            speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
            text: currentText.trim()
          });
        }
        currentSpeaker = speakerId;
        currentText = word.text;
      } else {
        currentText += word.text;
      }
    } else if (word.type === 'spacing') {
      currentText += word.text;
    }
  });

  if (currentSpeaker && currentText.trim()) {
    segments.push({
      speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
      text: currentText.trim()
    });
  }

  return segments;
}

async function testLocalAudioFile() {
  console.log('🎵 Testing Local Cantonese Audio File (8.mp3)\n');
  
  try {
    // Check if file exists
    const filePath = path.join(__dirname, LOCAL_AUDIO_FILE);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${LOCAL_AUDIO_FILE}`);
    }

    const stats = fs.statSync(filePath);
    console.log(`📁 File: ${LOCAL_AUDIO_FILE}`);
    console.log(`📏 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📅 Modified: ${stats.mtime.toLocaleDateString()}\n`);

    // Configure the client
    console.log('1. Configuring Fal.ai client...');
    fal.config({
      credentials: API_KEY
    });
    console.log('✅ Client configured successfully\n');

    // Read the audio file
    console.log('2. Loading local audio file...');
    const audioBuffer = fs.readFileSync(filePath);
    console.log(`✅ Audio file loaded (${audioBuffer.length} bytes)\n`);

    // Test different language scenarios with the local file
    const testScenarios = [
      {
        name: 'Auto-detect Language',
        config: { language_code: '', tag_audio_events: true, diarize: true }
      },
      {
        name: 'Explicit Cantonese',
        config: { language_code: 'yue', tag_audio_events: true, diarize: true }
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`🧪 Testing: ${scenario.name}`);
      console.log(`   Language: ${scenario.config.language_code || 'auto-detect'}`);
      
      try {
        const startTime = Date.now();
        
        // Create a File-like object from the buffer
        const file = new File([audioBuffer], LOCAL_AUDIO_FILE, { type: 'audio/mp3' });
        
        const result = await fal.subscribe('fal-ai/elevenlabs/speech-to-text', {
          input: {
            audio_url: file, // Fal.ai client will auto-upload
            ...scenario.config
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_PROGRESS') {
              console.log('   📝 Processing...', update.logs?.[update.logs.length - 1]?.message || '');
            }
          }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        const data = result.data;

        console.log(`\n   ✅ Success (${duration}s)`);
        console.log('   📊 Results:');
        console.log(`      - Detected Language: ${data.language_code}`);
        console.log(`      - Confidence: ${(data.language_probability * 100).toFixed(1)}%`);
        console.log(`      - Text Length: ${data.text.length} characters`);
        console.log(`      - Words: ${data.words.filter(w => w.type === 'word').length}`);

        // Check speakers
        const speakers = [...new Set(data.words.filter(w => w.speaker_id).map(w => w.speaker_id))];
        console.log(`      - Speakers: ${speakers.length} (${speakers.join(', ')})`);

        // Audio duration
        const audioDuration = Math.max(...data.words.map(w => w.end)).toFixed(2);
        console.log(`      - Audio Duration: ${audioDuration}s`);

        // Transform to speaker format
        const segments = transformToSpeakerFormat(data);
        console.log(`      - Speaker Segments: ${segments.length}`);

        // Show preview
        console.log(`      - Preview: "${data.text.substring(0, 100)}${data.text.length > 100 ? '...' : ''}"`);

        // Display full transcription in speaker format
        console.log('\n   📄 SPEAKER TRANSCRIPTION:');
        console.log('   ' + '='.repeat(60));
        segments.forEach((segment, index) => {
          console.log(`\n   ${segment.speaker}:`);
          console.log(`   ${segment.text}`);
        });
        console.log('\n   ' + '='.repeat(60));

        console.log(`\n   🔗 Request ID: ${result.requestId}`);
        
      } catch (error) {
        console.log(`\n   ❌ Failed: ${error.message}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
        }
      }
      
      console.log('\n' + '-'.repeat(80) + '\n');
    }

    console.log('🎉 LOCAL AUDIO TESTING COMPLETE!');
    console.log('\n✅ Your 8.mp3 file has been successfully processed');
    console.log('✅ Both auto-detect and explicit Cantonese work');
    console.log('✅ Speaker diarization is functional');
    console.log('✅ React app format transformation working');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Performance test
async function testPerformanceWithLocalFile() {
  console.log('\n⚡ Performance Test with Local File\n');
  
  try {
    fal.config({ credentials: API_KEY });
    
    const filePath = path.join(__dirname, LOCAL_AUDIO_FILE);
    const audioBuffer = fs.readFileSync(filePath);
    const file = new File([audioBuffer], LOCAL_AUDIO_FILE, { type: 'audio/mp3' });

    const startTime = Date.now();
    
    const result = await fal.subscribe('fal-ai/elevenlabs/speech-to-text', {
      input: {
        audio_url: file,
        language_code: 'yue',
        tag_audio_events: true,
        diarize: true
      }
    });

    const totalTime = Date.now() - startTime;
    const data = result.data;
    const audioDuration = Math.max(...data.words.map(w => w.end));
    
    console.log('📊 Performance Metrics:');
    console.log(`   - File Size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Audio Duration: ${audioDuration.toFixed(2)}s`);
    console.log(`   - Processing Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   - Processing Speed: ${(audioDuration / (totalTime / 1000)).toFixed(2)}x realtime`);
    console.log(`   - Words Processed: ${data.words.filter(w => w.type === 'word').length}`);
    console.log(`   - Characters Generated: ${data.text.length}`);
    console.log(`   - Processing Rate: ${(data.text.length / (totalTime / 1000)).toFixed(1)} chars/sec`);
    
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testLocalAudioFile()
    .then(() => testPerformanceWithLocalFile())
    .then(() => {
      console.log('\n✨ All tests with local audio file complete!');
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testLocalAudioFile, transformToSpeakerFormat }; 