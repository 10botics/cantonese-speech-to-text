const { fal } = require('@fal-ai/client');

// Test configuration
const API_KEY = '2349dc38-85b4-4494-a360-e7e03c21b16f:aaf08fef42a4362c6cc03bb0a4b10b74';
const TEST_AUDIO_URL = 'https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3'; // Sample from Fal.ai docs

// Transform function (same as in our React app)
function transformToSpeakerFormat(response) {
  const segments = [];
  let currentSpeaker = '';
  let currentText = '';

  response.words.forEach((word) => {
    if (word.type === 'word') {
      const speakerId = word.speaker_id || 'speaker_0';
      if (speakerId !== currentSpeaker) {
        // Save previous segment if exists
        if (currentSpeaker && currentText.trim()) {
          segments.push({
            speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
            text: currentText.trim()
          });
        }
        // Start new segment
        currentSpeaker = speakerId;
        currentText = word.text;
      } else {
        currentText += word.text;
      }
    } else if (word.type === 'spacing') {
      currentText += word.text;
    }
  });

  // Add final segment
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
    // Step 1: Configure the client
    console.log('1. Configuring Fal.ai client...');
    fal.config({
      credentials: API_KEY
    });
    console.log('✅ Client configured successfully\n');

    // Step 2: Test API call
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
          console.log('📝 Processing...', update.logs?.[update.logs.length - 1]?.message || '');
        }
      }
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Request completed in ${duration} seconds\n`);

    // Step 3: Validate response structure
    console.log('3. Validating response structure...');
    
    const data = result.data;
    
    // Check required fields
    const requiredFields = ['text', 'language_code', 'language_probability', 'words'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('✅ All required fields present');
    console.log(`   - text: ${typeof data.text} (${data.text.length} characters)`);
    console.log(`   - language_code: ${data.language_code}`);
    console.log(`   - language_probability: ${data.language_probability}`);
    console.log(`   - words: array with ${data.words.length} items`);

    // Validate word structure
    if (data.words.length > 0) {
      const firstWord = data.words[0];
      const wordFields = ['text', 'start', 'end', 'type'];
      const missingWordFields = wordFields.filter(field => !(field in firstWord));
      
      if (missingWordFields.length > 0) {
        console.log(`⚠️  Warning: Word missing fields: ${missingWordFields.join(', ')}`);
      } else {
        console.log('✅ Word structure validated');
      }
    }

    // Step 4: Test speaker diarization
    console.log('\n4. Testing speaker diarization...');
    const speakerIds = [...new Set(data.words.filter(w => w.speaker_id).map(w => w.speaker_id))];
    console.log(`✅ Found ${speakerIds.length} unique speakers: ${speakerIds.join(', ')}`);

    // Step 5: Test our transformation function
    console.log('\n5. Testing speaker format transformation...');
    const segments = transformToSpeakerFormat(data);
    console.log(`✅ Transformed into ${segments.length} speaker segments\n`);

    // Display results
    console.log('📄 TRANSCRIPTION RESULTS:');
    console.log('=' .repeat(50));
    console.log(`Full text: ${data.text}\n`);
    
    console.log('Speaker segments:');
    segments.forEach((segment, index) => {
      console.log(`\n${segment.speaker}:`);
      console.log(`${segment.text}`);
    });
    
    console.log('\n' + '='.repeat(50));

    // Step 6: Validate our app's expected format
    console.log('\n6. Validating application format...');
    const isValidFormat = segments.every(segment => 
      segment.speaker && 
      typeof segment.speaker === 'string' && 
      segment.text && 
      typeof segment.text === 'string'
    );
    
    if (isValidFormat) {
      console.log('✅ Speaker format validation passed');
    } else {
      throw new Error('Speaker format validation failed');
    }

    // Step 7: Performance metrics
    console.log('\n7. Performance metrics:');
    console.log(`   - Request duration: ${duration}s`);
    console.log(`   - Audio length: ${Math.max(...data.words.map(w => w.end)).toFixed(2)}s`);
    console.log(`   - Words processed: ${data.words.filter(w => w.type === 'word').length}`);
    console.log(`   - Request ID: ${result.requestId}`);

    console.log('\n🎉 ALL TESTS PASSED! Your Fal.ai integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', await error.response.text());
    }
    
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Alternative test with file upload
async function testFileUpload() {
  console.log('\n\n🔄 Testing file upload functionality...');
  
  try {
    // Create a simple test file
    const fs = require('fs');
    const path = require('path');
    
    // Check if we have a test audio file
    const testFilePath = path.join(__dirname, 'test-audio.mp3');
    
    if (fs.existsSync(testFilePath)) {
      console.log('📁 Found local test audio file, testing upload...');
      
      const file = fs.readFileSync(testFilePath);
      const blob = new Blob([file], { type: 'audio/mp3' });
      
      const result = await fal.subscribe('fal-ai/elevenlabs/speech-to-text', {
        input: {
          audio_url: blob, // Test auto-upload
          language_code: 'yue',
          tag_audio_events: true,
          diarize: true
        },
        logs: true
      });
      
      console.log('✅ File upload test passed');
      console.log(`   Transcribed: ${result.data.text.substring(0, 100)}...`);
    } else {
      console.log('📝 No local test file found, skipping file upload test');
    }
  } catch (error) {
    console.log('⚠️  File upload test failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  testFalAiIntegration()
    .then(() => testFileUpload())
    .then(() => {
      console.log('\n✨ Testing complete!');
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testFalAiIntegration, transformToSpeakerFormat }; 