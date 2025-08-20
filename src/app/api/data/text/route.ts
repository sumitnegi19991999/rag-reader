import { NextRequest, NextResponse } from 'next/server'
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📝 [TEXT-API] Processing text input request');
  
  try {
    // Validate request body
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('❌ [TEXT-API] Invalid text input provided');
      return NextResponse.json(
        { success: false, error: 'Valid text input is required' },
        { status: 400 }
      );
    }

    console.log(`📊 [TEXT-API] Processing text (${text.length} characters): ${text.substring(0, 100)}...`);

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [TEXT-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitTexts = await textSplitter.splitText(text);
    console.log(`📄 [TEXT-API] Split text into ${splitTexts.length} chunks`);

    // Create documents with metadata
    const docs: Document[] = splitTexts.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: {
        id: `text-${Date.now()}-${index}`,
        type: 'text',
        title: `Text Input ${new Date().toISOString().split('T')[0]}`,
        timestamp: new Date().toISOString(),
        chunkIndex: index,
        totalChunks: splitTexts.length
      }
    }));

    console.log(`🔤 [TEXT-API] Created ${docs.length} document chunks`);

    // Initialize embeddings and vector store
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });

    console.log('🔗 [TEXT-API] Connecting to Qdrant vector store...');
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: process.env.QDRANT_COLLECTION || 'chaicode-collection',
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ [TEXT-API] Successfully processed text in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Text data processed and stored successfully',
      metadata: {
        chunksCreated: docs.length,
        textLength: text.length,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [TEXT-API] Error processing text data (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process text data',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}