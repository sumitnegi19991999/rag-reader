import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { NextRequest, NextResponse } from 'next/server'
import { Document } from 'langchain/document';

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all stored documents from database
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings({
        model: 'text-embedding-3-large',
      }),
      {
        url: 'http://localhost:6333',
        collectionName: 'chaicode-collection',
      }
    );
    // 2. Return documents with metadata
    const documents = await vectorStore.similaritySearch("What is the capital of France?");
    console.log(documents); 
    
    console.log('Fetching all documents')
    
    // Placeholder response - replace with actual database query


    
    return NextResponse.json({ 
      success: true,
      documents: documents,
      count: documents.length
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Delete all documents from database
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings({
        model: 'text-embedding-3-large',
      }),
      {
        url: 'http://localhost:6333',
        collectionName: 'chaicode-collection',
      }
    );
    // 2. Clear vector store
    await vectorStore.delete
    // 3. Return success response

    
    console.log('Clearing all documents')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All documents cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear documents' },
      { status: 500 }
    )
  }
}