'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, X, Github } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function CognitiveBridge() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [error, setError] = useState(null)
  const [model, setModel] = useState('gemini')
  const [targetDomain, setTargetDomain] = useState('')



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

  // Clear all input fields and reset state
  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
    setTargetDomain('')


  }

  const modelOptions = [
    {
      value: 'gemini',
      label: 'Google Gemini',
      helper: 'Flash model - fastest responses, great for quick drafts.',
    },
    {
      value: 'anthropic',
      label: 'Anthropic Claude',
      helper: 'Best for nuanced reasoning and longer outputs.',
    },
  ]

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setOutput('')
    setLoadingStatus('Sending request to server...')

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


        }),
      })

      const fetchTime = Date.now() - startTime
      console.log(`Fetch completed in ${fetchTime}ms, status: ${response.status}, ok: ${response.ok}`)
      setLoadingStatus('Processing response...')

      // Read response as text first, then parse as JSON (can only read body once)
      const responseText = await response.text()
      console.log('Response text received, length:', responseText.length)
      setLoadingStatus('Parsing translation...')

      if (!response.ok) {
        let details = ''
        try {
          const err = JSON.parse(responseText)
          details = err?.error || err?.details || ''
          console.error('Error response:', err)
        } catch (parseErr) {
          console.error('Failed to parse error response as JSON:', parseErr)
          details = responseText.slice(0, 200)
        }
        throw new Error(details || 'Translation failed')
      }

      console.log('Response OK, parsing JSON...')
      let data
      try {
        data = JSON.parse(responseText)
        console.log('JSON parsed, keys:', Object.keys(data), 'has translation:', !!data.translation)
      } catch (jsonErr) {
        console.error('Failed to parse JSON response:', jsonErr)
        console.error('Response text (first 500 chars):', responseText.slice(0, 500))
        throw new Error(`Failed to parse server response: ${jsonErr.message}`)
      }

      if (!data.translation) {
        console.error('No translation in response:', data)
        throw new Error('No translation received from server')
      }

      console.log('Setting output, length:', data.translation.length)
      setLoadingStatus('Complete!')
      setOutput(data.translation)
      // Update local context so follow-up questions can refer back

    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
      setLoadingStatus('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cognitive Bridge
          </h1>
          <p className="text-xl text-gray-600">
            Structural Knowledge Translation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bridge expert knowledge to collective understanding
          </p>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 flex-wrap">
              <a
                href="https://github.com/ServTrust/TrustNet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-600 hover:underline"
              >
                <Github size={16} />
                Look under the hood
              </a>
              <span className="text-gray-300">|</span>
              <span>Learn all about it</span>
              <a
                href="https://deepwiki.com/ServTrust/TrustNet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" className="h-5" />
              </a>
            </div>

            <p className="text-sm text-gray-600">
              Support us via <a href="https://donate.stripe.com/14AaEWa98agEchnb1H0Ba00" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Stripe</a>.
            </p>
          </div>
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="input" className="block text-sm font-medium text-gray-700">
                  Expert Knowledge Input
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${input.length > 5000 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                    {input.length.toLocaleString()} / 5,000 chars
                  </span>
                  {(input || output || targetDomain) && (
                    <button
                      onClick={handleClear}
                      disabled={loading}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Clear all fields"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste technical text, research papers, or specialized content here..."
                className={`w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${input.length > 5000 ? 'border-orange-300' : 'border-gray-300'
                  }`}
              />
              {input.length > 5000 && (
                <p className="mt-1 text-xs text-orange-600">
                  ⚠️ Input exceeds recommended size. Results may be truncated or incomplete.
                </p>
              )}
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

          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{loadingStatus || 'Processing...'}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This typically takes 15-30 seconds. Please wait...
                  </p>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

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
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}


        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Functional Constraints (MVP)</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              <strong>Text mode only:</strong> Text input/output, no images or multimedia
            </li>
            <li>
              <strong>Output limits:</strong> Anthropic Claude (2,048 tokens), Gemini Flash (8,192 tokens)
            </li>
            <li>
              <strong>Input size:</strong> Recommended under 5,000 characters for best results
            </li>
            <li>
              <strong>Response time:</strong> 15-30 seconds typical (serverless function limits apply)
            </li>
            <li>
              <strong>MVP status:</strong> Core functionality only, features may be limited
            </li>
          </ul>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Free for personal use • MIT License</p>
        </footer>
      </div>
    </div>
  )
}

