import DataSourceInput from '@/components/DataSourceInput'
import FileUpload from '@/components/FileUpload'
import RAGStore from '@/components/RAGStore'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RAG Reader
          </h1>
          <p className="text-gray-600">
            Retrieval Augmented Generation Application - Upload your data and chat with it
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Data Input */}
          <div className="space-y-6">
            <DataSourceInput />
            <FileUpload />
          </div>

          {/* Right Column - RAG Store */}
          <div>
            <RAGStore />
          </div>
        </div>

        {/* Chat Interface - Full Width */}
        <div className="w-full">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}