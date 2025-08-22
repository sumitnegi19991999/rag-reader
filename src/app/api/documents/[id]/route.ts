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

    // Find all chunk IDs for this grouped document
    console.log(`🔍 [DELETE-DOC-API] Searching for chunks with prefix: ${id}`);
    
    // Search for documents with similar content to find all related chunks
    const searchResults = await vectorStore.similaritySearch(
      "document content data text information", // General query
      100 // Get more results to find all chunks
    );
    // Filter chunks that belong to this grouped document
    const chunksToDelete = searchResults
      .filter(doc => {
        const docId = doc.metadata.id || '';
        // Check if this chunk belongs to the grouped document
        return docId.startsWith(id + '-') || docId === id;
      })
      .map(doc => doc.id)
      .filter((docId): docId is string => docId !== undefined && docId !== null);
    
    console.log(`🗑️ [DELETE-DOC-API] Found ${chunksToDelete.length} chunks to delete:`, chunksToDelete);
    
    if (chunksToDelete.length === 0) {
      console.log(`⚠️ [DELETE-DOC-API] No chunks found for document: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Delete all found chunks
    try {
      await vectorStore.delete({ ids: chunksToDelete });
      console.log(`✅ [DELETE-DOC-API] Successfully deleted ${chunksToDelete.length} chunks for document: ${id}`);
    } catch (deleteError) {
      console.error(`❌ [DELETE-DOC-API] Error deleting chunks for ${id}:`, deleteError);
      
      // Check if it's a "not found" type error
      const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
      if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('not exist')) {
        return NextResponse.json(
          { success: false, error: 'Document chunks not found' },
          { status: 404 }
        );
      }
      
      throw deleteError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [DELETE-DOC-API] Successfully processed deletion in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Document ${id} deleted successfully (${chunksToDelete.length} chunks)`,
      deletedId: id,
      deletedChunks: chunksToDelete.length,
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