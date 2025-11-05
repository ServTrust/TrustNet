'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function CognitiveBridge() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTranslate = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setOutput('')

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setOutput(data.translation)
    } catch (err) {
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

