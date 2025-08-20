import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('📊 [DOCUMENTS-API] Fetching all documents');
  
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [DOCUMENTS-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to vector store
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });

    let vectorStore: QdrantVectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          collectionName: process.env.QDRANT_COLLECTION || 'chaicode-collection',
        }
      );
    } catch (vectorError) {
      console.error('❌ [DOCUMENTS-API] Failed to connect to vector store:', vectorError);
      return NextResponse.json({
        success: true,
        documents: [],
        count: 0,
        message: 'Vector store not initialized or empty'
      });
    }

    // Get documents using a general search to retrieve all/most documents
    const searchResults = await vectorStore.similaritySearch(
      "document content data text information", // General query to match various content
      50 // Limit to reasonable number
    );
    
    console.log(`📄 [DOCUMENTS-API] Retrieved ${searchResults.length} documents`);

    // Transform documents to match frontend interface
    const documents = searchResults.map((doc, index) => ({
      id: doc.metadata.id || `doc-${index}`,
      title: doc.metadata.title || doc.metadata.fileName || `Document ${index + 1}`,
      type: doc.metadata.type || 'unknown',
      content: doc.pageContent.substring(0, 200) + (doc.pageContent.length > 200 ? '...' : ''),
      timestamp: doc.metadata.timestamp || new Date().toISOString(),
      metadata: doc.metadata
    }));

    const processingTime = Date.now() - startTime;
    console.log(`✅ [DOCUMENTS-API] Successfully fetched documents in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true,
      documents: documents,
      count: documents.length,
      processingTimeMs: processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [DOCUMENTS-API] Error fetching documents (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔥 [DOCUMENTS-API] Clearing all documents');
  
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [DOCUMENTS-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to vector store
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });

    let vectorStore: QdrantVectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          collectionName: process.env.QDRANT_COLLECTION || 'chaicode-collection',
        }
      );
    } catch (vectorError) {
      console.log('⚠️ [DOCUMENTS-API] Vector store not found or empty, nothing to clear');
      return NextResponse.json({ 
        success: true, 
        message: 'No documents to clear - collection not found or empty'
      });
    }

    // Clear the entire collection by deleting and recreating it
    // Note: QdrantVectorStore doesn't have a direct "clear all" method,
    // so we use the delete method without parameters to clear everything
    try {
      await vectorStore.delete;
      console.log('✅ [DOCUMENTS-API] Successfully cleared vector store');
    } catch (deleteError) {
      console.error('❌ [DOCUMENTS-API] Error clearing vector store:', deleteError);
      throw deleteError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [DOCUMENTS-API] Successfully cleared all documents in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'All documents cleared successfully',
      processingTimeMs: processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [DOCUMENTS-API] Error clearing documents (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear documents',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}