import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'
import { checkRateLimit, getRemainingTime } from '../lib/rate-limiter'
import { validateAudioLimits, getAudioLimits } from '../lib/audio-utils'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1'

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP)
    if (!rateLimitResult.success) {
      const remainingTime = getRemainingTime(rateLimitResult.resetTime)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `You have exceeded the limit of ${rateLimitResult.limit} requests per 24 hours. Please try again in ${remainingTime}.`,
          rateLimitInfo: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    // Check for API key in environment variables
    const apiKey = process.env.FAL_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FAL_AI_API_KEY not configured on server' },
        { status: 500 }
      )
    }

    // Parse the form data from the request
    const formData = await request.formData()
    const file = formData.get('file') as File
    const languageCode = formData.get('languageCode') as string
    const duration = parseFloat(formData.get('duration') as string || '0')

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate audio limits
    const validation = validateAudioLimits(duration, file.size)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Audio validation failed',
          message: validation.message,
          limits: getAudioLimits()
        },
        { status: 400 }
      )
    }

    // Configure fal.ai client
    fal.config({
      credentials: apiKey
    })

    // Call fal.ai speech-to-text API
    const result = await fal.subscribe('fal-ai/elevenlabs/speech-to-text', {
      input: {
        audio_url: file,
        language_code: languageCode || undefined,
        tag_audio_events: true,
        diarize: true
      },
      logs: true
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      logs: (result as any).logs || [],
      rateLimitInfo: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      },
      validationWarnings: validation.warnings
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 