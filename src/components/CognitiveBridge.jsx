'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function CognitiveBridge() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [model, setModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trustnet-model') || 'anthropic'
    }
    return 'anthropic'
  })
  const [targetDomain, setTargetDomain] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [context, setContext] = useState(null)

  // Persist model choice to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trustnet-model', model)
    }
  }, [model])

  const modelOptions = [
    {
      value: 'anthropic',
      label: 'Anthropic Claude',
      helper: 'Best for nuanced reasoning and longer outputs.',
    },
    {
      value: 'gemini',
      label: 'Google Gemini',
      helper: 'Great for faster drafts and multilingual inputs.',
    },
  ]

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setOutput('')

    let accumulatedTranslation = ''

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          model,
          targetDomain: targetDomain.trim() || null,
          userPrompt: userPrompt.trim() || null,
          context,
        }),
      })

      if (!response.body) {
        // Handle non-streaming errors
        if (!response.ok) {
          let details = ''
          try {
            const text = await response.text()
            try {
              const err = JSON.parse(text)
              details = err?.error || err?.details || ''
            } catch {
              details = text.slice(0, 500)
            }
          } catch {}
          throw new Error(details || 'Translation failed')
        }
        throw new Error('No response body from server')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue // Skip empty lines
          
          if (trimmed.startsWith('event: ')) {
            currentEvent = trimmed.slice(7).trim()
            continue
          }
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim()
            if (!dataStr || dataStr === '[DONE]') {
              currentEvent = ''
              continue
            }
            
            // Only parse if it looks like JSON (starts with { or [)
            if (!dataStr.startsWith('{') && !dataStr.startsWith('[')) {
              currentEvent = ''
              continue
            }
            
            try {
              const data = JSON.parse(dataStr)
              
              if (currentEvent === 'chunk' && data.text) {
                // Accumulate chunks
                accumulatedTranslation += data.text
                setOutput(accumulatedTranslation)
              } else if (currentEvent === 'error') {
                throw new Error(data.details || data.error || 'Translation failed')
              } else if (currentEvent === 'done') {
                // Translation complete
                console.log('Translation stream completed')
              }
            } catch (e) {
              // If it's our error, rethrow it
              if (e.message && (e.message.includes('Translation failed') || e.message.includes('error'))) {
                throw e
              }
              // Skip invalid JSON - log for debugging but don't break
              if (e instanceof SyntaxError) {
                console.warn('Skipping invalid SSE JSON:', dataStr.slice(0, 50))
              } else {
                // Re-throw non-JSON errors
                throw e
              }
            }
            currentEvent = ''
          }
        }
      }

      // Update local context with final translation
      if (accumulatedTranslation) {
        setContext({
          expertText: input,
          targetDomain: targetDomain.trim() || null,
          history: [
            ...(context?.history || []),
            {
              model,
              output: accumulatedTranslation,
              timestamp: Date.now(),
            },
          ],
        })
      }
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <label htmlFor="model-select" className="sr-only">
              Choose inference model
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TrustNet
          </h1>
          <p className="text-xl text-gray-600">
            Structural Knowledge Translation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bridge expert knowledge to collective understanding
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">

          <div className="space-y-4">
            <div>
              <label
                htmlFor="target-domain"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Optional target domain
              </label>
              <input
                id="target-domain"
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. parenting, cooking, small business, classroom, sports..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                If set, the translation will look for bridges in this world instead of general
                everyday life.
              </p>
            </div>

            <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
              Expert Knowledge Input
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste technical text, research papers, or specialized content here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

            <div>
              <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Optional question or focus
              </label>
              <input
                id="user-prompt"
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. focus on decision-making tradeoffs, or: compare to startup funding"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use this for follow-up questions too; the previous translation is kept as context.
              </p>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Translating...
              </>
            ) : (
              <>
                <Send size={20} />
                Translate Structure
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {output && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Structural Translation
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
                <p className="text-gray-800 whitespace-pre-wrap">{output}</p>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Free for personal use • MIT License</p>
        </footer>
      </div>
    </div>
  )
}

