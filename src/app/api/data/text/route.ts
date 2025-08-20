import { NextRequest, NextResponse } from 'next/server'

import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from 'langchain/document';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    let docs: Document[] = [];
    const loader = new TextLoader(text);
    docs = await loader.load();
    console.log(docs);
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: 'http://localhost:6333',
      collectionName: 'chaicode-collection',
    });
    
    console.log('Received text data:', text?.substring(0, 100) + '...')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Text data received successfully',
      // Add any additional data you want to return
    })
  } catch (error) {
    console.error('Error processing text data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process text data' },
      { status: 500 }
    )
  }
}