import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateEmbeddingCached } from '@/lib/ai-cache'

interface ProfileRequestBody {
  name: string
  role: string
  company: string
  current_work: string
  looking_for: string[]
  can_offer: string[]
  interests: string[]
}

/**
 * POST /api/profile
 * Creates a user profile with AI-generated embedding
 * 
 * Requirements: 1.4, 1.5, 1.6, 1.7
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ProfileRequestBody = await request.json()

    // Server-side validation
    const errors: string[] = []
    
    if (!body.name?.trim()) {
      errors.push('Name is required')
    }
    if (!body.role?.trim()) {
      errors.push('Role is required')
    }
    if (!body.company?.trim()) {
      errors.push('Company is required')
    }
    if (!body.current_work?.trim()) {
      errors.push('Current work description is required')
    }
    if (!Array.isArray(body.looking_for) || body.looking_for.length === 0) {
      errors.push('At least one "looking for" option is required')
    }
    if (!Array.isArray(body.can_offer) || body.can_offer.length === 0) {
      errors.push('At least one "can offer" option is required')
    }
    if (!Array.isArray(body.interests) || body.interests.length === 0) {
      errors.push('At least one interest is required')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate profile text for embedding
    const profileText = `
Name: ${body.name}
Role: ${body.role}
Company: ${body.company}
Current Work: ${body.current_work}
Looking For: ${body.looking_for.join(', ')}
Can Offer: ${body.can_offer.join(', ')}
Interests: ${body.interests.join(', ')}
    `.trim()

    // Generate embedding using cached function (Requirement 1.5, 1.7)
    let embedding: number[]
    try {
      embedding = await generateEmbeddingCached(profileText)
    } catch (error: any) {
      console.error('Error generating embedding:', error)
      
      // Handle rate limit errors
      if (error.message?.includes('RATE_LIMIT')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again in a few moments.' },
          { status: 429 }
        )
      }
      
      // Handle other API errors
      if (error.message?.includes('API_ERROR')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to generate profile embedding. Please try again.' },
        { status: 500 }
      )
    }

    // Store profile in Supabase (Requirement 1.6)
    const { data: profile, error: dbError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        role: body.role.trim(),
        company: body.company.trim(),
        current_work: body.current_work.trim(),
        looking_for: body.looking_for,
        can_offer: body.can_offer,
        interests: body.interests,
        embedding: embedding,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error storing profile:', dbError)
      return NextResponse.json(
        { error: 'Failed to create profile. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        profile_id: profile.id,
        message: 'Profile created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in profile creation:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
