'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function CognitiveBridge() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [model, setModel] = useState('anthropic')
  const [targetDomain, setTargetDomain] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [context, setContext] = useState(null)

  // Load persisted model choice from localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('trustnet-model')
    if (savedModel && (savedModel === 'anthropic' || savedModel === 'gemini')) {
      setModel(savedModel)
    }
  }, [])

  // Save model choice to localStorage when it changes
  const handleModelChange = (newModel) => {
    setModel(newModel)
    localStorage.setItem('trustnet-model', newModel)
  }

  const modelOptions = [
    {
      value: 'anthropic',
      label: 'Anthropic Claude',
      helper: 'Best for nuanced reasoning and longer outputs.',
    },
    {
      value: 'gemini',
      label: 'Google Gemini',
      helper: 'Flash model - fastest responses, great for quick drafts.',
    },
  ]

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setOutput('')

    try {
      console.log('Starting translation request, model:', model)
      const startTime = Date.now()
      
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

      const fetchTime = Date.now() - startTime
      console.log(`Fetch completed in ${fetchTime}ms, status: ${response.status}, ok: ${response.ok}`)

      if (!response.ok) {
        let details = ''
        try {
          const err = await response.json()
          details = err?.error || err?.details || ''
          console.error('Error response:', err)
        } catch (parseErr) {
          console.error('Failed to parse error response:', parseErr)
          const text = await response.text()
          console.error('Error response text:', text.slice(0, 500))
        }
        throw new Error(details || 'Translation failed')
      }

      console.log('Response OK, parsing JSON...')
      const data = await response.json()
      console.log('JSON parsed, keys:', Object.keys(data), 'has translation:', !!data.translation)
      
      if (!data.translation) {
        console.error('No translation in response:', data)
        throw new Error('No translation received from server')
      }
      
      console.log('Setting output, length:', data.translation.length)
      setOutput(data.translation)
      // Update local context so follow-up questions can refer back
      setContext({
        expertText: input,
        targetDomain: targetDomain.trim() || null,
        history: [
          ...(context?.history || []),
          {
            model,
            output: data.translation,
            timestamp: Date.now(),
          },
        ],
      })
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
        <header className="text-center mb-12">
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

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <label htmlFor="model-select" className="text-xs text-gray-500">
              Model:
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

