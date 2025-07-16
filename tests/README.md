# Test Suite for Cantonese Speech to Text

This directory contains comprehensive tests and examples for the Cantonese Speech to Text application.

## 📁 Directory Structure

```
tests/
├── api/                    # API integration tests
├── examples/              # Documentation and example files
├── data/                  # Test audio files and sample outputs
└── README.md             # This file
```

## 🧪 API Tests (`tests/api/`)

### Quick Start
```bash
# Set your API key
export FAL_API_KEY="your-fal-ai-api-key-here"

# Run basic API test
node tests/api/test-template.js

# Run Cantonese-specific test
node tests/api/test-cantonese.js

# Run speaker identification test
node tests/api/test-speaker-identification.js
```

### Test Files

#### `test-template.js`
- **Purpose**: Basic ElevenLabs API integration test
- **Features**: Basic transcription, language detection
- **Usage**: `node tests/api/test-template.js`

#### `test-cantonese.js`
- **Purpose**: Cantonese-specific transcription testing
- **Features**: Cantonese language processing, speaker diarization
- **Usage**: `node tests/api/test-cantonese.js`

#### `test-speaker-identification.js`
- **Purpose**: DeepSeek R1 speaker identification testing
- **Features**: AI speaker matching, participant identification
- **Usage**: `node tests/api/test-speaker-identification.js`

#### `test-fal-api.js`
- **Purpose**: General Fal.ai API connectivity test
- **Features**: API authentication, basic functionality
- **Usage**: `node tests/api/test-fal-api.js`

#### `test-local-audio.js`
- **Purpose**: Local audio file processing test
- **Features**: File upload, processing workflow
- **Usage**: `node tests/api/test-local-audio.js`

## 📄 Examples (`tests/examples/`)

### Documentation Files

#### `test_case.txt`
Sample test scenarios and expected outcomes for manual testing.

#### `anyllm.txt`
Example usage of the Any LLM API for speaker identification.

#### `schema.txt`
ElevenLabs API schema documentation and response format examples.

## 📊 Test Data (`tests/data/`)

### Audio Files

#### `8.mp3`
- **Description**: Sample Cantonese audio file for testing
- **Duration**: ~10 minutes
- **Content**: Meeting/conversation with multiple speakers
- **Use Case**: Testing transcription accuracy and speaker diarization

### Sample Outputs

#### `output.json`
- **Description**: Example API response from ElevenLabs
- **Content**: Complete transcription with speaker data, timing, and metadata
- **Use Case**: Validating response format and data structure

## 🚀 Running Tests

### Prerequisites
```bash
npm install
export FAL_API_KEY="your-api-key-here"
```

### Basic Workflow Test
```bash
# Test basic transcription
node tests/api/test-template.js

# Expected output: Successful transcription with timing data
```

### Cantonese-Specific Test
```bash
# Test Cantonese transcription
node tests/api/test-cantonese.js

# Expected output: Cantonese text with proper character encoding
```

### Speaker Identification Test
```bash
# Test AI speaker identification
node tests/api/test-speaker-identification.js

# Expected output: Speaker mappings and identification confidence
```

### Integration Test with Real Audio
```bash
# Test with provided audio file
node tests/api/test-local-audio.js tests/data/8.mp3

# Expected output: Complete transcription with speakers identified
```

## 🧪 Testing Checklist

### API Integration
- [ ] Basic transcription works
- [ ] Language detection accurate
- [ ] Speaker diarization functional
- [ ] Timing data preserved
- [ ] Error handling robust

### Speaker Identification
- [ ] DeepSeek R1 integration works
- [ ] Participant matching accurate
- [ ] Unknown speakers handled properly
- [ ] Processing time acceptable

### Chinese Character Conversion
- [ ] Simplified to traditional conversion
- [ ] Character count preserved
- [ ] Timing synchronization maintained
- [ ] Edge cases handled

### Audio Synchronization
- [ ] Word-level highlighting works
- [ ] Click-to-seek functional
- [ ] Audio player controls responsive
- [ ] Timing accuracy verified

## 🔧 Troubleshooting

### Common Issues

#### API Key Problems
```bash
# Verify API key format
echo $FAL_API_KEY
# Should start with your key ID
```

#### Network Issues
```bash
# Test basic connectivity
curl -H "Authorization: Key $FAL_API_KEY" https://fal.run/status
```

#### Audio File Issues
```bash
# Check file format and size
file tests/data/8.mp3
ls -la tests/data/8.mp3
```

### Performance Benchmarks

#### Expected Processing Times
- **Transcription**: 2-4x real-time (10 min audio = 2.5-5 min processing)
- **Speaker ID**: Additional 60-70 seconds
- **Chinese Conversion**: <100ms
- **Total**: ~3-6 minutes for 10-minute audio

#### Quality Metrics
- **Language Detection**: >95% confidence for clear audio
- **Speaker Assignment**: >90% word-level assignment
- **Character Conversion**: 100% preservation of timing data

## 📈 Test Results Validation

### Success Criteria
1. **Transcription Accuracy**: Readable, properly segmented text
2. **Speaker Separation**: Clear speaker boundaries
3. **Timing Precision**: <200ms variance in word timing
4. **Character Conversion**: No timing disruption
5. **Error Handling**: Graceful failure modes

### Performance Monitoring
- Monitor processing times
- Check memory usage
- Validate API response sizes
- Ensure consistent results

## 🤝 Contributing Tests

When adding new tests:

1. **Place in appropriate directory**:
   - API tests → `tests/api/`
   - Examples → `tests/examples/`
   - Test data → `tests/data/`

2. **Follow naming convention**:
   - API tests: `test-[feature].js`
   - Examples: descriptive names
   - Data: descriptive names with extensions

3. **Include documentation**:
   - Purpose and scope
   - Usage instructions
   - Expected outcomes
   - Dependencies

4. **Update this README** with new test information 