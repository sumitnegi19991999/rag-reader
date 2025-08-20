'use client'

import { useState, useRef } from 'react'

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        // TODO: Implement API call to upload and process file
        const response = await fetch('/api/data/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setUploadedFiles(prev => [...prev, file.name])
          console.log(`File ${file.name} uploaded successfully`)
        } else {
          console.error(`Failed to upload ${file.name}`)
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">File Upload</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.csv,.txt,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </label>
        <p className="mt-2 text-sm text-gray-600">
          Supported formats: PDF, CSV, TXT, DOC, DOCX
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Uploaded Files:</h3>
            <button
              onClick={clearUploadedFiles}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <ul className="space-y-1">
            {uploadedFiles.map((fileName, index) => (
              <li key={index} className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                {fileName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}