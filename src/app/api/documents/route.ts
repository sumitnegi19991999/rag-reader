import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { NextRequest, NextResponse } from 'next/server'
import { QdrantClient } from '@qdrant/js-client-rest';


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

    // Group chunks by source/document
    const groupedDocs = new Map();
    
    searchResults.forEach(doc => {
      const groupKey = doc.metadata.url || doc.metadata.fileName || doc.metadata.source || doc.metadata.title;
      
      if (!groupedDocs.has(groupKey)) {
        groupedDocs.set(groupKey, {
          id: doc.metadata.id?.split('-').slice(0, -1).join('-') || `doc-${groupKey}`,
          title: doc.metadata.title || doc.metadata.fileName || `Document`,
          type: doc.metadata.type || 'unknown',
          content: '',
          timestamp: doc.metadata.timestamp || new Date().toISOString(),
          metadata: {
            ...doc.metadata,
            totalChunks: doc.metadata.totalChunks || 1,
            source: groupKey
          },
          chunks: []
        });
      }
      
      const group = groupedDocs.get(groupKey);
      group.chunks.push({
        content: doc.pageContent,
        chunkIndex: doc.metadata.chunkIndex || 0
      });
    });
    
    // Transform grouped documents to match frontend interface
    const documents = Array.from(groupedDocs.values()).map(group => {
      // Sort chunks by index and combine content
      group.chunks.sort((a: any, b: any) => a.chunkIndex - b.chunkIndex);
      const combinedContent = group.chunks.map((chunk: any) => chunk.content).join(' ');
      
      return {
        id: group.id,
        title: group.title,
        type: group.type,
        content: combinedContent.substring(0, 300) + (combinedContent.length > 300 ? '...' : ''),
        timestamp: group.timestamp,
        metadata: {
          ...group.metadata,
          chunksCount: group.chunks.length,
          fullContent: combinedContent
        }
      };
    });

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
      const qdrantClient = new QdrantClient({
        url: process.env.QDRANT_URL || 'http://localhost:6333',
      });
      
      const collectionName = process.env.QDRANT_COLLECTION || 'chaicode-collection';
      
      // Delete points using the correct Qdrant API format
      const deleteResult = await qdrantClient.deleteCollection(collectionName);
      
      console.log(`✅ [DELETE-DOC-API] Successfully deleted ${collectionName} `);
      console.log(`🔍 [DELETE-DOC-API] Delete result:`, deleteResult);
      
    }  catch (deleteError) {
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