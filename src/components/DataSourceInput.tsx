'use client'

import { useState } from 'react'

export default function DataSourceInput() {
  const [textData, setTextData] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTextSubmit = async () => {
    if (!textData.trim()) return
    
    setIsLoading(true)
    try {
      // TODO: Implement API call to store text data
      const response = await fetch('/api/data/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textData })
      })
      // Handle response
      console.log('Text data stored')
      setTextData('')
    } catch (error) {
      console.error('Error storing text data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return
    
    setIsLoading(true)
    try {
      // TODO: Implement API call to fetch and store website data
      const response = await fetch('/api/data/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })
      // Handle response
      console.log('Website data stored')
      setWebsiteUrl('')
    } catch (error) {
      console.error('Error storing website data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
      
      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Text Data</label>
        <textarea
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          placeholder="Enter your text data here..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleTextSubmit}
          disabled={!textData.trim() || isLoading}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Add Text Data'}
        </button>
      </div>

      {/* Website URL Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Website URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleWebsiteSubmit}
            disabled={!websiteUrl.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Fetching...' : 'Add Website'}
          </button>
        </div>
      </div>
    </div>
  )
}