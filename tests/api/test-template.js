const { fal } = require('@fal-ai/client');

// Test configuration - Use environment variable for security
const API_KEY = process.env.FAL_API_KEY || 'your-api-key-here';

if (!API_KEY || API_KEY === 'your-api-key-here') {
  console.error('❌ Please set FAL_API_KEY environment variable');
  console.log('Example: FAL_API_KEY="your-key-here" node test-template.js');
  process.exit(1);
}

// Sample audio URL from Fal.ai documentation
const TEST_AUDIO_URL = 'https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3';

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

async function testFalAiIntegration() {
  console.log('🚀 Testing Fal.ai ElevenLabs Speech-to-Text Integration\n');
  
  try {
    // Configure the client
    console.log('1. Configuring Fal.ai client...');
    fal.config({
      credentials: API_KEY
    });
    console.log('✅ Client configured successfully\n');

    // Test API call
    console.log('2. Sending transcription request...');
    console.log(`   Audio URL: ${TEST_AUDIO_URL}`);
    console.log('   Language: Cantonese (yue)');
    console.log('   Diarization: enabled');
    console.log('   Audio events tagging: enabled\n');

    const startTime = Date.now();
    
    const result = await fal.subscribe('fal-ai/elevenlabs/speech-to-text', {
      input: {
        audio_url: TEST_AUDIO_URL,
        language_code: 'yue', // Cantonese
        tag_audio_events: true,
        diarize: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('📝 Processing audio...');
        }
      }
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Request completed in ${duration} seconds\n`);

    // Validate response
    const data = result.data;
    console.log('3. Response validation:');
    console.log(`   - Language detected: ${data.language_code}`);
    console.log(`   - Confidence: ${(data.language_probability * 100).toFixed(1)}%`);
    console.log(`   - Text length: ${data.text.length} characters`);
    console.log(`   - Words: ${data.words.filter(w => w.type === 'word').length}`);

    // Test speaker diarization
    const speakers = [...new Set(data.words.filter(w => w.speaker_id).map(w => w.speaker_id))];
    console.log(`   - Speakers found: ${speakers.length}`);

    // Test transformation
    const segments = transformToSpeakerFormat(data);
    console.log(`   - Speaker segments: ${segments.length}`);

    // Display results
    console.log('\n📄 TRANSCRIPTION RESULTS:');
    console.log('='.repeat(50));
    segments.forEach((segment) => {
      console.log(`\n${segment.speaker}:`);
      console.log(segment.text);
    });
    console.log('\n' + '='.repeat(50));

    console.log('\n🎉 TEST PASSED! Integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFalAiIntegration();
}

module.exports = { testFalAiIntegration, transformToSpeakerFormat }; 