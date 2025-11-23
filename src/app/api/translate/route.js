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
    id: 'gemini-2.5-pro',
  },
}

// Helper to send SSE message
function sendSSE(controller, event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  controller.enqueue(new TextEncoder().encode(message))
}

export async function POST(request) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2)
  console.log(`[${requestId}] Translation request started (streaming)`)

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
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
          sendSSE(controller, 'error', {
            error: 'Invalid request body',
            details: parseError.message,
          })
          controller.close()
          return
        }

        // Step 2: Validate input
        if (!text || !text.trim()) {
          console.log(`[${requestId}] Empty text input`)
          sendSSE(controller, 'error', { error: 'Text input is required' })
          controller.close()
          return
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
          sendSSE(controller, 'error', {
            error: 'API key not configured',
            details: `${missingVar} environment variable is missing`,
          })
          controller.close()
          return
        }

        if (model === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
          console.error(`[${requestId}] API key format appears invalid (should start with sk-ant-)`)
          sendSSE(controller, 'error', {
            error: 'API key configuration error',
            details: 'API key format appears invalid',
          })
          controller.close()
          return
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

Analyze the following expert text and (taking into account any prior context and the user's extra guidance):




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

        console.log(`[${requestId}] Prompt prepared, calling ${SUPPORTED_MODELS[model].name} API (streaming)...`)

        // Stream the translation
        if (model === 'gemini') {
          await streamGeminiAPI({ prompt, apiKey, requestId, controller })
        } else {
          await streamAnthropicAPI({ prompt, apiKey, requestId, controller })
        }

        // Send completion event
        sendSSE(controller, 'done', { requestId })
        controller.close()
      } catch (error) {
        console.error(`[${requestId}] Unexpected error:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
          cause: error.cause,
        })

        sendSSE(controller, 'error', {
          error: 'Translation failed',
          details: error.message,
          type: error.name,
          requestId,
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function streamAnthropicAPI({ prompt, apiKey, requestId, controller }) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: SUPPORTED_MODELS.anthropic.id,
        max_tokens: 8192,
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = errorText
      try {
        const parsed = JSON.parse(errorText)
        errorData = parsed?.error?.message || parsed?.error || errorText
      } catch {}
      throw new Error(
        `Anthropic API error (${response.status}): ${typeof errorData === 'string' ? errorData.slice(0, 1000) : JSON.stringify(errorData).slice(0, 1000)}`
      )
    }

    if (!response.body) {
      throw new Error('No response body from Anthropic API')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            continue
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              sendSSE(controller, 'chunk', { text: parsed.delta.text })
            } else if (parsed.type === 'message_stop') {
              console.log(`[${requestId}] Anthropic stream completed`)
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error?.message || 'Anthropic API error')
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error(`[${requestId}] Anthropic streaming error:`, error)
    throw error
  }
}

async function streamGeminiAPI({ prompt, apiKey, requestId, controller }) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${SUPPORTED_MODELS.gemini.id}:streamGenerateContent?key=${encodeURIComponent(apiKey)}`

    const response = await fetch(endpoint, {
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData = errorText
      try {
        const parsed = JSON.parse(errorText)
        errorData = parsed?.error?.message || parsed?.error?.details || parsed?.error || errorText
      } catch {}
      throw new Error(
        `Gemini API error (${response.status}): ${typeof errorData === 'string' ? errorData.slice(0, 1000) : JSON.stringify(errorData).slice(0, 1000)}`
      )
    }

    if (!response.body) {
      throw new Error('No response body from Gemini API')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let accumulatedText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line)
            const candidate = parsed?.candidates?.[0]
            if (candidate?.content?.parts) {
              for (const part of candidate.content.parts) {
                if (part.text) {
                  // Gemini sends accumulated text, so we need to extract only new content
                  const newText = part.text.slice(accumulatedText.length)
                  if (newText) {
                    accumulatedText = part.text
                    sendSSE(controller, 'chunk', { text: newText })
                  }
                }
              }
            }
            if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
              if (candidate.finishReason === 'SAFETY') {
                throw new Error('Content was blocked by Gemini safety filters')
              }
            }
          } catch (e) {
            if (e.message.includes('safety filters')) {
              throw e
            }
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error(`[${requestId}] Gemini streaming error:`, error)
    throw error
  }
}
