import DataSourceInput from '@/components/DataSourceInput'
import FileUpload from '@/components/FileUpload'
import RAGStore from '@/components/RAGStore'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <>
      {/* Header - Black background with gray accent */}
      <div className="hc-header">
        <h1>DATACHAT AI</h1>
        <div className="hc-header-nav">
          <span>PROFILE</span>
          <span>SETTINGS</span>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="three-panel-layout">
        {/* Panel 1: Data Sources - Gray accent bar */}
        <div className="panel">
          <h2 className="panel-header">DATA SOURCES</h2>
          <DataSourceInput />
          <FileUpload />
        </div>

        {/* Panel 2: RAG Store - Davys-gray accent bar */}
        <div className="panel">
          <h2 className="panel-header">RAG STORE</h2>
          <RAGStore />
        </div>

        {/* Panel 3: AI Chat - Black accent bar */}
        <div className="panel">
          <h2 className="panel-header">AI CHAT</h2>
          <ChatInterface />
        </div>
      </div>

      {/* Status Bar - Gray background with strategic information */}
      <div className="hc-status-bar">
        <span>STATUS: OPERATIONAL</span>
        <span>DOCUMENTS: 5</span>
        <span>CHUNKS: 127</span>
        <span>UPDATED: 2 MIN AGO</span>
      </div>
    </>
  )
}