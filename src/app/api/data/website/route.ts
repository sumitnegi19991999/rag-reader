import { NextRequest, NextResponse } from 'next/server'

import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    const loader = new PlaywrightWebBaseLoader(url);
    const docs = await loader.load();
    console.log(docs);
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: 'http://localhost:6333',
      collectionName: 'chaicode-collection',
    });
  
    
    console.log('Received website URL:', url)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Website URL received successfully',
      url: url
    })
  } catch (error) {
    console.error('Error processing website URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process website URL' },
      { status: 500 }
    )
  }
}