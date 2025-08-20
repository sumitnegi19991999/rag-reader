import { NextRequest, NextResponse } from 'next/server'
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const { id } = params;
  console.log(`🗑️ [DELETE-DOC-API] Deleting document with ID: ${id}`);
  
  try {
    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.log('❌ [DELETE-DOC-API] Invalid document ID provided');
      return NextResponse.json(
        { success: false, error: 'Valid document ID is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [DELETE-DOC-API] Missing OPENAI_API_KEY environment variable');
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
      console.error('❌ [DELETE-DOC-API] Failed to connect to vector store:', vectorError);
      return NextResponse.json(
        { success: false, error: 'Vector store not available' },
        { status: 503 }
      );
    }

    // Delete the document by ID
    try {
      await vectorStore.delete({ ids: [id] });
      console.log(`✅ [DELETE-DOC-API] Successfully deleted document: ${id}`);
    } catch (deleteError) {
      console.error(`❌ [DELETE-DOC-API] Error deleting document ${id}:`, deleteError);
      
      // Check if it's a "not found" type error
      const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
      if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('not exist')) {
        return NextResponse.json(
          { success: false, error: 'Document not found' },
          { status: 404 }
        );
      }
      
      throw deleteError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [DELETE-DOC-API] Successfully processed deletion in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Document ${id} deleted successfully`,
      deletedId: id,
      processingTimeMs: processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [DELETE-DOC-API] Error deleting document (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete document',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}