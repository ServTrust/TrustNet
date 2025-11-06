import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2)
  console.log(`[${requestId}] Translation request started`)

  try {
    // Step 1: Parse request body
    let text
    try {
      const body = await request.json()
      text = body.text
      console.log(`[${requestId}] Request body parsed, text length: ${text?.length || 0}`)
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError)
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError.message },
        { status: 400 }
      )
    }

    // Step 2: Validate input
    if (!text || !text.trim()) {
      console.log(`[${requestId}] Empty text input`)
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      )
    }

    // Step 3: Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log(`[${requestId}] API key check - exists: ${!!apiKey}, length: ${apiKey?.length || 0}`)
    
    if (!apiKey) {
      console.error(`[${requestId}] ANTHROPIC_API_KEY environment variable is not set`)
      return NextResponse.json(
        { error: 'API key not configured', details: 'ANTHROPIC_API_KEY environment variable is missing' },
        { status: 500 }
      )
    }

    if (!apiKey.startsWith('sk-ant-')) {
      console.error(`[${requestId}] API key format appears invalid (should start with sk-ant-)`)
      return NextResponse.json(
        { error: 'API key configuration error', details: 'API key format appears invalid' },
        { status: 500 }
      )
    }

    // Step 4: Prepare prompt
    const prompt = `You are a structural knowledge translator. Your task is to reveal the conceptual structure beneath specialized knowledge by finding analogous structures in everyday experience.

Analyze the following expert text and:
1. Identify the core structural pattern (what is this really about?)
2. Find familiar patterns that match this structure
3. Translate it to accessible understanding using those bridges

The translation should NOT be:
- Oversimplified (ELI5)
- Summarized (losing depth)
- Paraphrased (just reworded)

It should be structural isomorphism - finding the same pattern in accessible form.

Expert text:
${text}

Structural translation:`

    console.log(`[${requestId}] Prompt prepared, calling Anthropic API...`)

    // Step 5: Call Anthropic API
    let response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })
      console.log(`[${requestId}] Anthropic API response received, status: ${response.status}`)
    } catch (fetchError) {
      console.error(`[${requestId}] Fetch error calling Anthropic API:`, fetchError)
      return NextResponse.json(
        { 
          error: 'Failed to connect to Anthropic API', 
          details: fetchError.message,
          type: fetchError.name 
        },
        { status: 502 }
      )
    }

    // Step 6: Check response status
    if (!response.ok) {
      let errorText = ''
      let errorData = null
      
      try {
        errorText = await response.text()
        console.error(`[${requestId}] Anthropic API error - Status: ${response.status}, Body: ${errorText.slice(0, 500)}`)
        
        try {
          errorData = JSON.parse(errorText)
        } catch {}
      } catch (readError) {
        console.error(`[${requestId}] Failed to read error response:`, readError)
      }

      return NextResponse.json(
        { 
          error: 'Anthropic API error', 
          status: response.status,
          statusText: response.statusText,
          details: errorData || errorText?.slice(0, 1000) || 'No error details available'
        },
        { status: 502 }
      )
    }

    // Step 7: Parse response
    let data
    try {
      data = await response.json()
      console.log(`[${requestId}] Response parsed successfully`)
    } catch (jsonError) {
      console.error(`[${requestId}] Failed to parse Anthropic response as JSON:`, jsonError)
      return NextResponse.json(
        { error: 'Invalid API response format', details: jsonError.message },
        { status: 502 }
      )
    }

    // Step 8: Extract translation
    const translation = data?.content?.[0]?.text
    if (!translation) {
      console.error(`[${requestId}] No translation text in response. Response structure:`, JSON.stringify(data).slice(0, 500))
      return NextResponse.json(
        { 
          error: 'Unexpected API response structure', 
          details: 'No translation text found in response',
          responsePreview: JSON.stringify(data).slice(0, 200)
        },
        { status: 502 }
      )
    }

    console.log(`[${requestId}] Translation successful, length: ${translation.length}`)
    return NextResponse.json({ translation })

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })
    
    return NextResponse.json(
      { 
        error: 'Translation failed', 
        details: error.message,
        type: error.name,
        requestId
      }, 
      { status: 500 }
    )
  }
}
