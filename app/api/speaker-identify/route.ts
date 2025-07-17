import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'
import { checkRateLimit, getRemainingTime } from '../lib/rate-limiter'

interface TranscriptionSegment {
  speaker: string
  text: string
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1'

    // Check rate limit (using same limit as transcription)
    const rateLimitResult = checkRateLimit(`speaker-${clientIP}`)
    if (!rateLimitResult.success) {
      const remainingTime = getRemainingTime(rateLimitResult.resetTime)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `You have exceeded the limit of ${rateLimitResult.limit} speaker identification requests per 24 hours. Please try again in ${remainingTime}.`,
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

    // Configure fal.ai client
    fal.config({
      credentials: apiKey
    })

    // Parse the request body
    const body = await request.json()
    const { transcriptSegments, participantList } = body

    if (!transcriptSegments || !Array.isArray(transcriptSegments)) {
      return NextResponse.json(
        { error: 'Invalid transcript segments provided' },
        { status: 400 }
      )
    }

    if (!participantList || typeof participantList !== 'string') {
      return NextResponse.json(
        { error: 'Participant list is required' },
        { status: 400 }
      )
    }

    // Format transcript for AI analysis
    const transcript = transcriptSegments.map((segment: TranscriptionSegment) => 
      `${segment.speaker}: ${segment.text}`
    ).join('\n\n')

    // Call fal.ai any-llm API for speaker identification
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: "deepseek/deepseek-r1",
        system_prompt: "You are a meeting analysis expert. Respond with only valid JSON. Do not include any explanations or additional text.",
        prompt: `You are analyzing a meeting transcript to identify speakers based on their roles and topics they discuss.

Participant List:
${participantList}

Meeting Transcript:
${transcript}

Please match each speaker to a participant based on:
- Their role in the meeting (chairperson, questioner, responder)  
- The topics they discuss (housing, police, general council matters)
- Their speaking patterns and authority level

Return only valid JSON with speaker mappings. Use "Unknown" if unsure.
Format: {"Speaker 1": "name", "Speaker 2": "name", "Speaker 3": "name", "Speaker 4": "name"}`
      },
      logs: true
    })

    // Parse the JSON response
    let mappings: Record<string, string> = {}
    
    try {
      const responseText = result.data.output.trim()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const extractedJson = jsonMatch[0]
        mappings = JSON.parse(extractedJson)
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      mappings = {}
    }

    return NextResponse.json({
      success: true,
      mappings,
      logs: (result as any).logs || [],
      rawResponse: result.data.output,
      rateLimitInfo: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Speaker identification error:', error)
    return NextResponse.json(
      { 
        error: 'Speaker identification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 