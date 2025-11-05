import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('Anthropic API error status:', response.status, text)
      return NextResponse.json(
        { error: 'Upstream error', status: response.status, details: text?.slice(0, 2000) },
        { status: 502 }
      )
    }

    const data = await response.json()
    const translation = data?.content?.[0]?.text
    if (!translation) {
      console.error('Unexpected Anthropic response:', JSON.stringify(data).slice(0, 2000))
      return NextResponse.json(
        { error: 'Unexpected API response', details: data },
        { status: 502 }
      )
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error?.message || 'Translation failed' }, { status: 500 })
  }
}

