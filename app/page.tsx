'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, Settings, Loader2, FileAudio, Play, Pause } from 'lucide-react'


// Import Chinese character conversion (client-side only)
let Chinese: any = null
if (typeof window !== 'undefined') {
  try {
    Chinese = require('chinese-s2t')
  } catch (error) {
    console.warn('Failed to load chinese-s2t package:', error)
  }
}

// Types for the Fal.ai response (matching official client types)
interface FalAiWord {
  text: string
  start: number
  end: number
  type: string
  speaker_id?: string // Optional to match official client
}

interface FalAiResponse {
  text: string
  language_code: string
  language_probability: number
  words: FalAiWord[]
}

interface TranscriptionSegment {
  speaker: string
  text: string
}

export default function Home() {

  const [isUploading, setIsUploading] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  const [error, setError] = useState('')

  const [languageCode, setLanguageCode] = useState('yue') // Default to Cantonese
  const [progressStatus, setProgressStatus] = useState('')
  const [processingLogs, setProcessingLogs] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [completionTime, setCompletionTime] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rawResponse, setRawResponse] = useState<FalAiResponse | null>(null)
  
  // Speaker identification features
  const [enableSpeakerIdentification, setEnableSpeakerIdentification] = useState(false)
  const [participantNames, setParticipantNames] = useState('')
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [speakerMappings, setSpeakerMappings] = useState<Record<string, string>>({})
  const [isIdentifyingSpeakers, setIsIdentifyingSpeakers] = useState(false)
  
  // Chinese character conversion feature
  const [enableChineseConversion, setEnableChineseConversion] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Audio player event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(audio.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [audioUrl])

  // Audio control functions
  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const seekToTime = (time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    if (!isPlaying) {
      audio.play()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Check if a word should be highlighted
  const isWordHighlighted = (word: FalAiWord) => {
    return currentTime >= word.start && currentTime <= word.end
  }

  // Cleanup audio URL on component unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Transform Fal.ai response to speaker format
  const transformToSpeakerFormat = (response: FalAiResponse): TranscriptionSegment[] => {
    const segments: TranscriptionSegment[] = []
    let currentSpeaker = ''
    let currentText = ''

    response.words.forEach((word) => {
      if (word.type === 'word') {
        const speakerId = word.speaker_id || 'speaker_0' // Handle undefined speaker_id
        if (speakerId !== currentSpeaker) {
          // Save previous segment if exists
          if (currentSpeaker && currentText.trim()) {
            segments.push({
              speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
              text: currentText.trim()
            })
          }
          // Start new segment
          currentSpeaker = speakerId
          currentText = word.text
        } else {
          currentText += word.text
        }
      } else if (word.type === 'spacing') {
        currentText += word.text
      }
    })

    // Add final segment
    if (currentSpeaker && currentText.trim()) {
      segments.push({
        speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
        text: currentText.trim()
      })
    }

    return segments
  }

  // Helper function to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setProcessingLogs(prev => [...prev, logMessage])
  }

  // Chinese character conversion function
  const convertToTraditionalChinese = (data: FalAiResponse): FalAiResponse => {
    if (!Chinese) {
      addLog('⚠️ Chinese conversion library not available in server environment')
      return data
    }

    addLog('🔄 Starting simplified to traditional Chinese conversion...')
    const conversionStart = Date.now()
    
    try {
      // Convert the main transcription text
      const originalText = data.text || ''
      const convertedText = originalText ? Chinese.s2t(originalText) : ''
      
      // Convert individual word texts
      const convertedWords = data.words.map(word => ({
        ...word,
        text: word.text ? Chinese.s2t(word.text) : word.text
      }))

      const convertedData: FalAiResponse = {
        ...data,
        text: convertedText,
        words: convertedWords
      }

      const conversionTime = ((Date.now() - conversionStart) / 1000).toFixed(3)
      addLog(`⚡ Chinese conversion completed in ${conversionTime} seconds`)
      
      // Log conversion statistics
      const originalChars = originalText.length
      const convertedChars = convertedText.length
      const wordsConverted = data.words.filter(w => w.text && Chinese.s2t(w.text) !== w.text).length
      
      addLog(`📝 Converted ${originalChars} characters in main text`)
      addLog(`🔤 Converted ${wordsConverted}/${data.words.length} individual words`)
      
      // Check for character length changes that might affect synchronization
      if (originalChars !== convertedChars) {
        addLog(`⚠️ Character count changed: ${originalChars} → ${convertedChars} (may affect sync)`)
      } else {
        addLog(`✅ Character count preserved: ${originalChars} characters (sync maintained)`)
      }
      
      // Show example conversions
      if (originalText !== convertedText) {
        const textPreview = originalText.substring(0, 50)
        const convertedPreview = convertedText.substring(0, 50)
        addLog(`📖 Text conversion example: "${textPreview}" → "${convertedPreview}"`)
        
        // Log detailed word-level changes that might affect timing
        const changedWords = data.words.filter(w => w.text && Chinese.s2t(w.text) !== w.text)
        if (changedWords.length > 0) {
          const firstChanged = changedWords[0]
          addLog(`🔍 First word change: "${firstChanged.text}" → "${Chinese.s2t(firstChanged.text)}" (time: ${firstChanged.start?.toFixed(2)}s)`)
        }
      } else {
        addLog('📖 No simplified characters detected in transcription')
      }

      return convertedData
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown conversion error'
      addLog(`❌ Chinese conversion failed: ${errorMsg}`)
      addLog('🔄 Proceeding with original text without conversion')
      return data
    }
  }

  // Clear and re-identify speakers
  const clearAndReidentify = async () => {
    if (!transcription.length || !participantNames.trim()) return
    
    setSpeakerMappings({})
    await identifySpeakers(transcription, participantNames)
  }

  // AI Speaker Identification
  const identifySpeakers = async (transcriptSegments: TranscriptionSegment[], participantList: string) => {
    if (!participantList.trim()) {
      addLog('⚠️ No participant names provided - skipping speaker identification')
      return {}
    }

    setIsIdentifyingSpeakers(true)
    addLog('🤖 Starting AI speaker identification with DeepSeek R1...')
    
    try {
      // Format transcript for AI analysis
      const transcript = transcriptSegments.map(segment => 
        `${segment.speaker}: ${segment.text}`
      ).join('\n\n')
      
      addLog(`📋 Analyzing ${transcriptSegments.length} speaker segments...`)
      
      const identificationStart = Date.now()
      
      // Call backend API for speaker identification
      const response = await fetch('/api/speaker-identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptSegments,
          participantList
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const hours = Math.ceil((errorData.rateLimitInfo?.resetTime - Date.now()) / (60 * 60 * 1000))
          throw new Error(`⚠️ Rate limit exceeded! You can only identify speakers 10 times per 24 hours. Please try again in ${hours} hour${hours !== 1 ? 's' : ''}.`)
        }
        
        throw new Error(errorData.message || errorData.error || 'Speaker identification failed')
      }

      const backendResult = await response.json()
      
      // Log rate limit info
      if (backendResult.rateLimitInfo) {
        addLog(`📊 Speaker ID rate limit: ${backendResult.rateLimitInfo.remaining}/${backendResult.rateLimitInfo.limit} requests remaining`)
      }

      const identificationTime = ((Date.now() - identificationStart) / 1000).toFixed(1)
      addLog(`⚡ Speaker identification completed in ${identificationTime} seconds`)

      // Log the complete API response for debugging
      addLog('📋 Raw DeepSeek R1 API Response:')
      addLog(`🔍 Response Status: Success`)
      addLog(`📝 Model Used: deepseek/deepseek-r1`)
      
      if (backendResult.rawResponse) {
        const responseText = backendResult.rawResponse.trim()
        addLog(`💬 Full Response Text: "${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}"`)
        addLog(`📏 Response Length: ${responseText.length} characters`)
      }

      // Log any processing logs from the API
      if (backendResult.logs && Array.isArray(backendResult.logs) && backendResult.logs.length > 0) {
        addLog(`📊 API Processing Logs (${backendResult.logs.length} entries):`)
        backendResult.logs.forEach((log: any, index: number) => {
          addLog(`   ${index + 1}. ${log.message || log}`)
        })
      }

      // Use the parsed mappings from backend
      const mappings: Record<string, string> = backendResult.mappings || {}
      
      addLog('✅ Successfully received AI response from backend')
      addLog(`🗂️ Parsed mappings object: ${JSON.stringify(mappings, null, 2)}`)
      
      // Log the results with detailed analysis
      addLog('🎭 Speaker Identification Results:')
      Object.entries(mappings).forEach(([speaker, name]) => {
        const status = name === "Unknown" ? "❓" : "🎯"
        const confidence = name === "Unknown" ? "Low confidence" : "Identified"
        addLog(`${status} ${speaker}: ${name} (${confidence})`)
      })
      
      const identifiedCount = Object.values(mappings).filter(name => name !== "Unknown").length
      const totalSpeakers = Object.keys(mappings).length
      const successRate = totalSpeakers > 0 ? ((identifiedCount / totalSpeakers) * 100).toFixed(1) : '0'
      
      addLog(`📊 Identification Summary: ${identifiedCount}/${totalSpeakers} speakers identified (${successRate}% success rate)`)

      setSpeakerMappings(mappings)
      return mappings
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      addLog(`❌ Speaker identification failed: ${errorMsg}`)
      return {}
    } finally {
      setIsIdentifyingSpeakers(false)
    }
  }

  // Check audio duration client-side
  const checkAudioDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const audioUrl = URL.createObjectURL(file)
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audioUrl)
        resolve(audio.duration)
      })
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl)
        reject(new Error('Could not read audio duration'))
      })
      
      audio.src = audioUrl
    })
  }

  // Call backend API for transcription
  const transcribeAudio = async (file: File, forceSpeakerID?: boolean, forceParticipants?: string) => {
    // Use forced values if provided (for demo), otherwise use state
    const useSpeakerID = forceSpeakerID !== undefined ? forceSpeakerID : enableSpeakerIdentification
    const useParticipants = forceParticipants !== undefined ? forceParticipants : participantNames
    // Reset states
    setIsUploading(true)
    setError('')
    setProgressStatus('Initializing...')
    setProcessingLogs([])
    setTranscription([])
    setCompletionTime('')
    setRawResponse(null)
    setSpeakerMappings({})
    setAudioFile(file)
    
    // Create audio URL for playback
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    const newAudioUrl = URL.createObjectURL(file)
    setAudioUrl(newAudioUrl)
    
    const start = Date.now()
    setStartTime(start)

    try {
      addLog(`🚀 Starting transcription for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      addLog(`🗣️ Language: ${languageCode || 'Auto-detect'}`)
      addLog(`🈂️ Chinese conversion: ${enableChineseConversion ? 'Enabled' : 'Disabled'}`)
      addLog(`🤖 Speaker identification: ${useSpeakerID ? 'Enabled' : 'Disabled'}`)
      if (useSpeakerID && useParticipants) {
        addLog(`👥 Participants ready: ${useParticipants.split(',').length} names loaded`)
      }
      
      // Check audio duration
      setProgressStatus('Checking audio duration...')
      addLog('⏱️ Checking audio duration...')
      
      let duration = 0
      try {
        duration = await checkAudioDuration(file)
        addLog(`📏 Audio duration: ${Math.round(duration)}s (${Math.round(duration / 60 * 10) / 10} minutes)`)
        
        if (duration > 10 * 60) {
          throw new Error(`Audio file is too long (${Math.round(duration / 60 * 10) / 10} minutes). Maximum allowed: 10 minutes. Please use a shorter audio file.`)
        }
        
        if (duration > 5 * 60) {
          addLog('⚠️ Large audio file detected. Processing may take longer.')
        }
      } catch (durationError) {
        if (durationError instanceof Error && durationError.message.includes('too long')) {
          throw durationError
        }
        addLog('⚠️ Could not determine audio duration. Proceeding with upload.')
      }
      
      setProgressStatus('Uploading audio file...')
      addLog('📤 Uploading audio file to backend...')

      // Create form data for backend API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('languageCode', languageCode || '')
      formData.append('duration', duration.toString())

      // Call backend API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const hours = Math.ceil((errorData.rateLimitInfo?.resetTime - Date.now()) / (60 * 60 * 1000))
          throw new Error(`⚠️ Rate limit exceeded! You can only process 10 audio files per 24 hours. Please try again in ${hours} hour${hours !== 1 ? 's' : ''}.`)
        }
        
        throw new Error(errorData.message || errorData.error || 'Transcription failed')
      }

      const result = await response.json()
      
      // Log rate limit info
      if (result.rateLimitInfo) {
        addLog(`📊 Rate limit: ${result.rateLimitInfo.remaining}/${result.rateLimitInfo.limit} requests remaining`)
      }
      
      const processingTime = ((Date.now() - start) / 1000).toFixed(2)
      addLog(`⚡ Processing completed in ${processingTime} seconds`)
      
      setProgressStatus('Transforming response...')
      const data: FalAiResponse = result.data
      
      // Log the complete ElevenLabs API response for debugging
      addLog('📋 Raw ElevenLabs API Response:')
      const elevenlabsResultWithLogs = result as any // Type assertion to access logs
      addLog(`🔍 Response Status: ${elevenlabsResultWithLogs.logs ? 'Success with logs' : 'Success'}`)
      addLog(`📝 Service: ElevenLabs Speech-to-Text`)
      
      if (data) {
        // Basic response metadata
        addLog(`🎯 Detected language: ${data.language_code} (confidence: ${(data.language_probability * 100).toFixed(1)}%)`)
        addLog(`📝 Total words processed: ${data.words.length}`)
        addLog(`📏 Full transcription length: ${data.text?.length || 0} characters`)
        
        // Preview of transcribed text
        if (data.text) {
          const textPreview = data.text.substring(0, 150)
          addLog(`💬 Transcription preview: "${textPreview}${data.text.length > 150 ? '...' : ''}"`)
        }
        
        // Detailed word analysis
        const wordTypes = data.words.reduce((acc: Record<string, number>, word) => {
          acc[word.type] = (acc[word.type] || 0) + 1
          return acc
        }, {})
        addLog(`🔤 Word breakdown: ${JSON.stringify(wordTypes)}`)
        
        // Speaker analysis
        const speakerIds = data.words
          .map(word => word.speaker_id)
          .filter(Boolean)
        const uniqueSpeakers = new Set(speakerIds)
        addLog(`👥 Speakers identified: ${uniqueSpeakers.size}`)
        
        if (uniqueSpeakers.size > 0) {
          const speakerDistribution: Record<string, number> = {}
          speakerIds.forEach(speaker => {
            if (speaker) {
              speakerDistribution[speaker] = (speakerDistribution[speaker] || 0) + 1
            }
          })
          addLog(`📊 Speaker word distribution: ${JSON.stringify(speakerDistribution)}`)
        }
        
        // Audio timing analysis
        const wordsWithTiming = data.words.filter(word => word.type === 'word' && word.start !== undefined && word.end !== undefined)
        if (wordsWithTiming.length > 0) {
          const totalDuration = Math.max(...wordsWithTiming.map(w => w.end))
          const avgWordDuration = wordsWithTiming.reduce((sum, w) => sum + (w.end - w.start), 0) / wordsWithTiming.length
          addLog(`⏱️ Audio duration: ${totalDuration.toFixed(2)}s`)
          addLog(`⚡ Avg word duration: ${(avgWordDuration * 1000).toFixed(0)}ms`)
          addLog(`🗣️ Speech rate: ${(wordsWithTiming.length / (totalDuration / 60)).toFixed(1)} words/minute`)
        }
        
        // Quality metrics
        const wordsWithSpeakers = data.words.filter(word => word.type === 'word' && word.speaker_id)
        const speakerAssignmentRate = wordsWithTiming.length > 0 ? (wordsWithSpeakers.length / wordsWithTiming.length * 100).toFixed(1) : '0'
        addLog(`✅ Speaker assignment rate: ${speakerAssignmentRate}% of words`)
      }

      // Log any processing logs from the ElevenLabs API
      if (elevenlabsResultWithLogs.logs && Array.isArray(elevenlabsResultWithLogs.logs) && elevenlabsResultWithLogs.logs.length > 0) {
        addLog(`📊 ElevenLabs Processing Logs (${elevenlabsResultWithLogs.logs.length} entries):`)
        elevenlabsResultWithLogs.logs.forEach((log: any, index: number) => {
          addLog(`   ${index + 1}. ${log.message || log}`)
        })
      }
      
      // Log the complete response object structure (truncated for readability)
      const responseStructure = {
        text: data.text ? `"${data.text.substring(0, 50)}..."` : null,
        language_code: data.language_code,
        language_probability: data.language_probability,
        words: `Array[${data.words.length}]`,
        wordTypes: data.words.slice(0, 3).map(w => ({ type: w.type, text: w.text?.substring(0, 10) }))
      }
      addLog(`🗂️ Response structure: ${JSON.stringify(responseStructure, null, 2)}`)
      
      // Apply Chinese character conversion (simplified to traditional) if enabled
      let convertedData = data
      if (enableChineseConversion) {
        setProgressStatus('Converting Chinese characters...')
        convertedData = convertToTraditionalChinese(data)
      } else {
        addLog('🔄 Chinese character conversion skipped (disabled in settings)')
      }
      
      // Save converted response for audio player functionality
      setRawResponse(convertedData)
      
      // Transform to speaker segments using converted data
      const segments = transformToSpeakerFormat(convertedData)
      addLog(`✨ Transcription formatted into ${segments.length} speaker segments`)
      
      setTranscription(segments)
      
      // Run AI speaker identification if enabled
      addLog(`🔍 Checking speaker identification: enabled=${useSpeakerID}, participants=${useParticipants ? 'provided' : 'empty'}`)
      
      if (useSpeakerID && useParticipants?.trim()) {
        addLog(`🤖 Starting AI speaker identification with ${useParticipants.split(',').length} participants`)
        setProgressStatus('Identifying speakers with AI...')
        await identifySpeakers(segments, useParticipants)
      } else if (useSpeakerID && !useParticipants?.trim()) {
        addLog('⚠️ Speaker identification enabled but no participants provided')
      } else if (!useSpeakerID) {
        addLog('ℹ️ Speaker identification disabled - skipping AI analysis')
      }
      
      setProgressStatus('Completed!')
      
      const totalTime = ((Date.now() - start) / 1000).toFixed(2)
      setCompletionTime(`Completed in ${totalTime} seconds`)
      addLog(`🎉 Transcription successfully completed!`)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio'
      setError(errorMessage)
      setProgressStatus('Error occurred')
      addLog(`❌ Error: ${errorMessage}`)
      console.error('Transcription error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file drop
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      transcribeAudio(audioFile)
    } else {
      setError('Please upload an audio file')
    }
  }, [languageCode])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Handle file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      transcribeAudio(file)
    }
  }

  // Load demo data
  const loadDemo = async () => {
    setIsLoadingDemo(true)
    addLog('🎬 Loading demo data...')
    addLog('📋 Demo source: 觀塘區議會第七次會議 - 其他事項 (2025-01-06)')
    addLog('🔗 Source: https://www.districtcouncils.gov.hk/kt/tc_chi/meetings/dcmeetings/dc_meetings_audio.php?meeting_id=28585')
    
    try {
      // Load demo participant names
      const participantsResponse = await fetch('/demo-participants.txt')
      const participantsText = await participantsResponse.text()
      const participantList = participantsText.trim().split('\n').join(', ')
      
      // Set states and wait for them to update
      setParticipantNames(participantList)
      setEnableSpeakerIdentification(true)
      addLog(`👥 Loaded ${participantsText.trim().split('\n').length} demo participants from council meeting`)
      addLog(`🎯 Speaker identification: ENABLED for demo`)
      addLog(`📝 Participants preview: ${participantList.substring(0, 100)}...`)
      
      // Load demo audio file
      const audioResponse = await fetch('/demo-audio.mp3')
      const audioBlob = await audioResponse.blob()
      const audioFile = new File([audioBlob], 'kwun-tong-council-meeting-demo.mp3', { type: 'audio/mpeg' })
      
      addLog(`🎵 Loaded demo audio: Kwun Tong District Council meeting excerpt (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`)
      addLog('⚖️ Audio content: Official government meeting proceedings in Cantonese')
      
      // Small delay to ensure state updates are applied
      await new Promise(resolve => setTimeout(resolve, 100))
      
      addLog('🚀 Starting demo transcription with speaker identification...')
      
      // Start transcription with demo file, passing speaker ID settings directly
      await transcribeAudio(audioFile, true, participantList)
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load demo'
      setError(`Demo loading failed: ${errorMsg}`)
      addLog(`❌ Demo loading error: ${errorMsg}`)
    } finally {
      setIsLoadingDemo(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cantonese Speech to Text
          </h1>
          <p className="text-gray-600">
            AI-powered transcription with speaker identification
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Usage Limits:</strong> 10 requests per 24 hours • Maximum 10 minutes audio • 50MB file size limit
            </p>
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>🎬 Demo Available:</strong> Try our sample Cantonese council meeting audio with speaker identification
            </p>
            <p className="text-xs text-green-600 mt-1">
              <strong>Source:</strong> <a href="https://www.districtcouncils.gov.hk/kt/tc_chi/meetings/dcmeetings/dc_meetings_audio.php?meeting_id=28585" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-800">觀塘區議會第七次會議</a> - 其他事項 (4:38) © Hong Kong District Councils
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className="max-w-md mx-auto mb-8 space-y-4">


          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elevenlabs-purple focus:border-transparent"
            >
              <option value="yue">Cantonese (廣東話)</option>
              <option value="zho">Mandarin Chinese (中文)</option>
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="jpn">Japanese</option>
              <option value="kor">Korean</option>
              <option value="">Auto-detect</option>
            </select>
          </div>

          {/* Speaker Identification */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="enableSpeakerID"
                checked={enableSpeakerIdentification}
                onChange={(e) => setEnableSpeakerIdentification(e.target.checked)}
                className="h-4 w-4 text-elevenlabs-purple focus:ring-elevenlabs-purple border-gray-300 rounded"
              />
              <label htmlFor="enableSpeakerID" className="ml-2 text-sm font-medium text-gray-700">
                AI Speaker Identification 🤖
              </label>
            </div>
            
            {enableSpeakerIdentification && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Participant Names (comma-separated)
                </label>
                <textarea
                  value={participantNames}
                  onChange={(e) => setParticipantNames(e.target.value)}
                  placeholder="e.g., John Smith (Chairman), Mary Wong (Housing Manager), David Lee..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elevenlabs-purple focus:border-transparent resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Include roles/titles for better identification. Powered by DeepSeek R1.
                </p>
              </div>
            )}
          </div>

          {/* Chinese Character Conversion */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="enableChineseConversion"
                checked={enableChineseConversion}
                onChange={(e) => setEnableChineseConversion(e.target.checked)}
                className="h-4 w-4 text-elevenlabs-purple focus:ring-elevenlabs-purple border-gray-300 rounded"
              />
              <label htmlFor="enableChineseConversion" className="ml-2 text-sm font-medium text-gray-700">
                Chinese Character Conversion 🈂️
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              💡 Automatically convert simplified Chinese to traditional Chinese characters.
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto mb-8">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-elevenlabs-purple transition-colors cursor-pointer"
            onClick={(e) => {
              // Only open file picker if not clicking demo button
              if (!isLoadingDemo && !isUploading && !isIdentifyingSpeakers) {
                fileInputRef.current?.click()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isUploading || isIdentifyingSpeakers || isLoadingDemo ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-elevenlabs-purple animate-spin mb-4" />
                <p className="text-gray-600 font-medium">
                  {isLoadingDemo ? 'Loading demo...' : isIdentifyingSpeakers ? 'Identifying speakers with AI...' : progressStatus}
                </p>
                {startTime && !isIdentifyingSpeakers && !isLoadingDemo && (
                  <p className="text-gray-500 text-sm mt-1">
                    Elapsed: {Math.floor((Date.now() - startTime) / 1000)}s
                  </p>
                )}
                {isIdentifyingSpeakers && (
                  <p className="text-gray-500 text-sm mt-1">
                    🤖 DeepSeek R1 analyzing conversation patterns...
                  </p>
                )}
                {isLoadingDemo && (
                  <p className="text-gray-500 text-sm mt-1">
                    🎬 Loading demo audio and participant list...
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileAudio className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your audio file here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Upload className="w-4 h-4" />
                    Supports MP3, WAV, M4A and other audio formats
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">or</span>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        loadDemo()
                      }}
                    >
                      🎬 Try Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="flex-shrink-0 w-12 h-12 bg-elevenlabs-purple hover:bg-elevenlabs-purple/90 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-elevenlabs-purple rounded-full transition-all duration-100"
                          style={{
                            width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => seekToTime(Number(e.target.value))}
                        className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="flex-shrink-0 text-sm text-gray-600 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* File Info */}
                {audioFile && (
                  <div className="mt-4 text-sm text-gray-500">
                    Playing: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Interactive Transcription Results */}
        {transcription.length > 0 && rawResponse && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interactive Transcription</h2>
              
              {/* Speaker Identification Controls */}
              {enableSpeakerIdentification && (
                <div className="flex items-center gap-3">
                  {Object.keys(speakerMappings).length > 0 && (
                    <span className="text-sm text-green-600 font-medium">
                      🎯 {Object.values(speakerMappings).filter(name => name !== "Unknown").length} speakers identified
                    </span>
                  )}
                  <button
                    onClick={clearAndReidentify}
                    disabled={isIdentifyingSpeakers || !participantNames.trim()}
                    className="px-4 py-2 bg-elevenlabs-purple text-white text-sm rounded-lg hover:bg-elevenlabs-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isIdentifyingSpeakers ? 'Identifying...' : 'Clear & Re-identify'}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
                <span>Click on any word to jump to that time in the audio</span>
                {isPlaying && (
                  <span className="text-elevenlabs-purple font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-elevenlabs-purple rounded-full animate-pulse"></div>
                    Playing
                  </span>
                )}
              </div>
              
              {/* Interactive Speaker Segments with word-level highlighting */}
              <div className="space-y-4">
                {(() => {
                  // Create chronological speaker segments with word-level data
                  const segments: Array<{
                    speaker: string
                    words: FalAiWord[]
                    startTime: number
                    endTime: number
                  }> = []

                  let currentSpeaker = ''
                  let currentWords: FalAiWord[] = []

                  rawResponse.words.forEach((word) => {
                    if (word.type === 'word' && word.speaker_id) {
                      if (word.speaker_id !== currentSpeaker) {
                        // Save previous segment if exists
                        if (currentSpeaker && currentWords.length > 0) {
                          const wordOnlyWords = currentWords.filter(w => w.type === 'word')
                          segments.push({
                            speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
                            words: currentWords,
                            startTime: wordOnlyWords[0]?.start || 0,
                            endTime: wordOnlyWords[wordOnlyWords.length - 1]?.end || 0
                          })
                        }
                        // Start new segment
                        currentSpeaker = word.speaker_id
                        currentWords = [word]
                      } else {
                        currentWords.push(word)
                      }
                    } else if (word.type === 'spacing' && currentWords.length > 0) {
                      // Add spacing to current segment
                      currentWords.push(word)
                    }
                  })

                  // Add final segment
                  if (currentSpeaker && currentWords.length > 0) {
                    const wordOnlyWords = currentWords.filter(w => w.type === 'word')
                    segments.push({
                      speaker: `Speaker ${parseInt(currentSpeaker.replace('speaker_', '')) + 1}`,
                      words: currentWords,
                      startTime: wordOnlyWords[0]?.start || 0,
                      endTime: wordOnlyWords[wordOnlyWords.length - 1]?.end || 0
                    })
                  }

                  return segments.map((segment, segmentIndex) => (
                    <div key={segmentIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-elevenlabs-purple">
                          {speakerMappings[segment.speaker] 
                            ? `${segment.speaker} (${speakerMappings[segment.speaker]})` 
                            : segment.speaker}
                        </h4>
                        <button
                          onClick={() => seekToTime(segment.startTime)}
                          className="text-xs text-gray-500 hover:text-elevenlabs-purple bg-white px-2 py-1 rounded border hover:border-elevenlabs-purple transition-colors"
                        >
                          {formatTime(segment.startTime)}
                        </button>
                      </div>
                      <div className="text-gray-800 leading-relaxed">
                        {segment.words.map((word, wordIndex) => {
                          if (word.type === 'word') {
                            const isHighlighted = isWordHighlighted(word)
                            return (
                              <span
                                key={`${segmentIndex}-${wordIndex}`}
                                onClick={() => seekToTime(word.start)}
                                className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 hover:bg-blue-200 ${
                                  isHighlighted 
                                    ? 'bg-elevenlabs-purple text-white shadow-sm' 
                                    : 'hover:bg-white'
                                }`}
                                title={`${formatTime(word.start)} - ${formatTime(word.end)}`}
                              >
                                {word.text}
                              </span>
                            )
                          } else if (word.type === 'spacing') {
                            return (
                              <span key={`${segmentIndex}-${wordIndex}`}>
                                {word.text}
                              </span>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 