import { NextRequest, NextResponse } from 'next/server'
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🌐 [WEBSITE-API] Processing website scraping request');
  
  try {
    const { url } = await request.json();
    
    // Validate URL
    if (!url || typeof url !== 'string') {
      console.log('❌ [WEBSITE-API] Invalid URL provided');
      return NextResponse.json(
        { success: false, error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      console.log('❌ [WEBSITE-API] Invalid URL format:', url);
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`🔗 [WEBSITE-API] Loading website: ${url}`);

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [WEBSITE-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Load website content
    const loader = new PlaywrightWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      },
    });
    
    const rawDocs = await loader.load();
    console.log(`📄 [WEBSITE-API] Loaded ${rawDocs.length} documents from website`);

    if (rawDocs.length === 0) {
      console.log('⚠️ [WEBSITE-API] No content extracted from website');
      return NextResponse.json(
        { success: false, error: 'No content could be extracted from the website' },
        { status: 422 }
      );
    }

    // Split content into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(rawDocs);
    console.log(`📄 [WEBSITE-API] Split into ${splitDocs.length} chunks`);

    // Add metadata to documents
    const docs: Document[] = splitDocs.map((doc, index) => new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        id: `website-${Date.now()}-${index}`,
        type: 'website',
        title: doc.metadata.title || validUrl.hostname,
        url: url,
        timestamp: new Date().toISOString(),
        chunkIndex: index,
        totalChunks: splitDocs.length
      }
    }));

    // Initialize embeddings and vector store
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });

    console.log('🔗 [WEBSITE-API] Storing documents in vector database...');
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: process.env.QDRANT_COLLECTION || 'chaicode-collection',
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ [WEBSITE-API] Successfully processed website in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Website content scraped and stored successfully',
      url: url,
      metadata: {
        documentsCreated: docs.length,
        websiteTitle: docs[0]?.metadata.title || validUrl.hostname,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [WEBSITE-API] Error processing website (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process website',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}