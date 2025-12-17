import { NextResponse } from 'next/server'

// Force fresh build - Updated: 2025-11-06 01:08 UTC
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORTED_MODELS = {
  anthropic: {
    name: 'Anthropic Claude',
    id: 'claude-sonnet-4-20250514',
  },
  gemini: {
    name: 'Google Gemini',
    id: 'gemini-2.5-flash',
  },
}

export async function POST(request) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2)
  console.log(`[${requestId}] Translation request started`)

  try {
    // Step 1: Parse request body
    let text
    let model = 'anthropic'
    let targetDomain = null
    let userPrompt = null
    let context = null
    try {
      const body = await request.json()
      text = body.text
      model = body.model && SUPPORTED_MODELS[body.model] ? body.model : 'anthropic'
      targetDomain = body.targetDomain || null
      userPrompt = body.userPrompt || null
      context = body.context || null
      console.log(
        `[${requestId}] Request body parsed, text length: ${text?.length || 0}, model: ${model}`
      )
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

    // Step 3: Prepare API configuration
    const apiKey =
      model === 'gemini' ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY
    console.log(
      `[${requestId}] ${model} API key check - exists: ${!!apiKey}, length: ${apiKey?.length || 0}`
    )

    if (!apiKey) {
      const missingVar = model === 'gemini' ? 'GEMINI_API_KEY' : 'ANTHROPIC_API_KEY'
      console.error(`[${requestId}] ${missingVar} environment variable is not set`)
      return NextResponse.json(
        {
          error: 'API key not configured',
          details: `${missingVar} environment variable is missing`,
        },
        { status: 500 }
      )
    }

    if (model === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      console.error(`[${requestId}] API key format appears invalid (should start with sk-ant-)`)
      return NextResponse.json(
        { error: 'API key configuration error', details: 'API key format appears invalid' },
        { status: 500 }
      )
    }

    // Step 4: Prepare prompt
    const targetDomainInstruction = targetDomain
      ? `Focus your analogies and bridge concepts in the following lived world or domain: "${targetDomain}". When choosing examples, prefer situations and stories that would feel native inside that domain.`
      : `Assume the target domain is shared, everyday human experience — work, family, cities, bodies, games, nature, and ordinary social life.`

    const conversationContext = context
      ? `\n\nThere is existing conversation context you should respect:\n${JSON.stringify(
          context,
          null,
          2
        ).slice(0, 4000)}\n\nTreat this as prior turns in the dialogue and avoid repeating yourself.`
      : ''

    const userPromptInstruction = userPrompt
      ? `\n\nThe user has given an extra instruction or follow-up question you must honor:\n"${userPrompt}".`
      : ''

    const prompt = `You are a structural knowledge translator. Your task is to reveal the conceptual structure beneath specialized knowledge by finding analogous structures in lived experience.

${targetDomainInstruction}

Analyze the following expert text and (taking into account any prior context and the user’s extra guidance):




Respond in this EXACT structure (use these headers):

1. Identify the core structural pattern (what is this really about?)

## Cognitive Distance Assessment
[Brief analysis: jargon density, prerequisite concepts, abstraction level - be specific about what makes this hard]

## Core Pattern
[What is this REALLY about at the structural level? Strip away jargon, what's the fundamental idea?]

2. Find familiar patterns that match this structure

## Bridge Concepts
[Find analogies from everyday/accessible domains that match the funnctional structure of prerequisite concepts. Be concrete and vivid]

3. Translate it to accessible understanding using those bridges

## Accessible Explanation
[Explain the knowledge behind the technical description using the bridging concepts. Progressive depth - start simple, add layers. Use concrete examples]

## Dissonance
[Point out where the semantic description diverges from the actual structures it is describing. Consider if it reveals or conceals factual reality. Explain how]

## Key Insights
[3-4 bullet points of the most important takeaways, in plain language]

## Where This Connects
[Briefly mention what this opens up - why would someone care? What can they explore next?]

The translation should NOT be:
- Oversimplified (ELI5)
- Summarized (losing depth)
- Paraphrased (just reworded)


Keep it conversational and specific. Avoid generic explanations - find the ACTUAL cognitive bridges that work for this specific content.

It should be structural isomorphism - finding the same relational pattern in accessible form. 

Expert text to translate:
${text}

${conversationContext}

${userPromptInstruction}

Structural translation:`

    console.log(`[${requestId}] Prompt prepared, calling ${SUPPORTED_MODELS[model].name} API...`)

    let translation
    if (model === 'gemini') {
      translation = await callGeminiAPI({ prompt, apiKey, requestId })
    } else {
      translation = await callAnthropicAPI({ prompt, apiKey, requestId })
    }

    // Validate translation is a non-empty string
    if (!translation || typeof translation !== 'string' || !translation.trim()) {
      console.error(`[${requestId}] Invalid translation received:`, typeof translation, translation?.slice(0, 100))
      throw new Error('Invalid translation received from API')
    }

    console.log(`[${requestId}] Translation successful, length: ${translation.length}`)
    console.log(`[${requestId}] Returning response to client...`)
    const response = NextResponse.json({ translation }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
    console.log(`[${requestId}] Response object created, status: ${response.status}`)
    return response

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })
    
    // Determine user-friendly error message based on error content
    let userMessage = 'Translation failed'
    let statusCode = 500

    if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
      userMessage = 'The model is currently overloaded. Please try again in a few moments.'
      statusCode = 503
    } else if (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('too many requests')) {
      userMessage = 'Too many requests. Please wait a moment before trying again.'
      statusCode = 429
    }

    return NextResponse.json(
      { 
        error: userMessage, 
        details: error.message,
        type: error.name,
        requestId
      }, 
      { status: statusCode }
    )
  }
}

async function callAnthropicAPI({ prompt, apiKey, requestId }) {
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
        model: SUPPORTED_MODELS.anthropic.id,
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
    throw new Error(`Failed to connect to Anthropic API: ${fetchError.message}`)
  }

  // Step 6: Check response status
  if (!response.ok) {
    let errorText = ''
    let errorData = null

    try {
      errorText = await response.text()
      console.error(
        `[${requestId}] Anthropic API error - Status: ${response.status}, Body: ${errorText.slice(
          0,
          500
        )}`
      )

      try {
        errorData = JSON.parse(errorText)
      } catch {}
    } catch (readError) {
      console.error(`[${requestId}] Failed to read error response:`, readError)
    }

    throw new Error(
      `Anthropic API error (${response.status} ${response.statusText}): ${
        errorData || errorText?.slice(0, 1000) || 'No error details available'
      }`
    )
  }

  // Step 7: Parse response
  let data
  try {
    data = await response.json()
    console.log(`[${requestId}] Anthropic response parsed successfully`)
  } catch (jsonError) {
    console.error(`[${requestId}] Failed to parse Anthropic response as JSON:`, jsonError)
    throw new Error(`Invalid Anthropic API response format: ${jsonError.message}`)
  }

  const translation = data?.content?.[0]?.text
  if (!translation) {
    console.error(
      `[${requestId}] No translation text in response. Response structure:`,
      JSON.stringify(data).slice(0, 500)
    )
    throw new Error('Unexpected Anthropic API response structure: no translation text found')
  }

  return translation
}

async function callGeminiAPI({ prompt, apiKey, requestId }) {
  // Try using query parameter instead of header (more reliable for Gemini)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${SUPPORTED_MODELS.gemini.id}:generateContent?key=${encodeURIComponent(apiKey)}`

  console.log(`[${requestId}] Starting Gemini API fetch to: ${endpoint.replace(apiKey, '***')}`)
  
  // Add timeout to prevent hanging
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 60000) // 60 second timeout

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 8192,
        },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    console.log(`[${requestId}] Gemini API response received, status: ${response.status}`)
  } catch (fetchError) {
    clearTimeout(timeoutId)
    if (fetchError.name === 'AbortError') {
      console.error(`[${requestId}] Gemini API request timed out after 60 seconds`)
      throw new Error('Gemini API request timed out. The request took too long to complete.')
    }
    console.error(`[${requestId}] Fetch error calling Gemini API:`, fetchError)
    throw new Error(`Failed to connect to Gemini API: ${fetchError.message}`)
  }

  // Read response text first (can only read once)
  let responseText = ''
  try {
    responseText = await response.text()
    console.log(`[${requestId}] Gemini response text length: ${responseText.length}`)
  } catch (readError) {
    console.error(`[${requestId}] Failed to read Gemini response:`, readError)
    throw new Error(`Failed to read Gemini API response: ${readError.message}`)
  }

  if (!response.ok) {
    console.error(
      `[${requestId}] Gemini API error - Status: ${response.status}, Body: ${responseText.slice(0, 1000)}`
    )
    let details = responseText
    try {
      const parsed = JSON.parse(responseText)
      details = parsed?.error?.message || parsed?.error?.details || parsed?.error || responseText
    } catch {}

    const errorMessage =
      typeof details === 'string' ? details.slice(0, 1000) : JSON.stringify(details).slice(0, 1000)
    throw new Error(`Gemini API error (${response.status} ${response.statusText}): ${errorMessage}`)
  }

  let data
  try {
    data = JSON.parse(responseText)
    console.log(`[${requestId}] Gemini response parsed successfully, keys:`, Object.keys(data))
  } catch (jsonError) {
    console.error(
      `[${requestId}] Failed to parse Gemini response as JSON. Response length: ${responseText.length}, Preview:`,
      responseText.slice(0, 500)
    )
    throw new Error(`Invalid Gemini API response format: ${jsonError.message}`)
  }

  // Log full response structure for debugging
  console.log(
    `[${requestId}] Gemini response structure:`,
    JSON.stringify(data).slice(0, 1000)
  )

  // Check if candidates array exists
  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.error(
      `[${requestId}] No candidates in Gemini response. Full response:`,
      JSON.stringify(data, null, 2)
    )
    throw new Error(
      `Unexpected Gemini API response structure: no candidates array or empty candidates. Response: ${JSON.stringify(data).slice(0, 500)}`
    )
  }

  // Check for blocked content or other issues
  const candidate = data?.candidates?.[0]
  if (candidate?.finishReason) {
    const finishReason = candidate.finishReason
    if (finishReason !== 'STOP') {
      console.warn(`[${requestId}] Gemini finish reason: ${finishReason}`)
      if (finishReason === 'SAFETY') {
        throw new Error(
          'Content was blocked by Gemini safety filters. Try rephrasing your input.'
        )
      }
      if (finishReason === 'MAX_TOKENS') {
        // Try to extract partial content even if truncated
        const partialContent =
          candidate?.content?.parts?.map((part) => part.text).join('\n\n') ?? ''
        if (partialContent) {
          console.warn(
            `[${requestId}] Response was truncated at token limit, but returning partial content`
          )
          return partialContent + '\n\n[Note: Response was truncated due to length limit]'
        }
        throw new Error(
          'Response exceeded maximum token limit. The translation is too long. Try shortening your input or splitting it into smaller parts.'
        )
      }
    }
  }

  // Check if content exists and has parts
  if (!candidate?.content) {
    console.error(
      `[${requestId}] No content in candidate. Full response:`,
      JSON.stringify(data, null, 2)
    )
    throw new Error(
      `Unexpected Gemini API response structure: no content in candidate. Response: ${JSON.stringify(data).slice(0, 500)}`
    )
  }

  if (!candidate.content.parts || !Array.isArray(candidate.content.parts)) {
    console.error(
      `[${requestId}] No parts array in content. Content structure:`,
      JSON.stringify(candidate.content, null, 2)
    )
    throw new Error(
      `Unexpected Gemini API response structure: no parts array in content. Content: ${JSON.stringify(candidate.content).slice(0, 500)}`
    )
  }

  const translation = candidate.content.parts
    .filter((part) => part.text) // Filter out non-text parts
    .map((part) => part.text)
    .join('\n\n')

  if (!translation || !translation.trim()) {
    console.error(
      `[${requestId}] No translation text in Gemini response. Parts:`,
      JSON.stringify(candidate.content.parts, null, 2),
      `Full response:`,
      JSON.stringify(data, null, 2)
    )
    throw new Error(
      `Unexpected Gemini API response structure: no translation text found. Parts: ${JSON.stringify(candidate.content.parts).slice(0, 500)}`
    )
  }

  console.log(`[${requestId}] Gemini translation extracted successfully, length: ${translation.length}`)
  return translation
}
