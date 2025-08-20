import { NextRequest, NextResponse } from 'next/server'
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings({
        model: 'text-embedding-3-large',
      }),
      {
        url: 'http://localhost:6333',
        collectionName: 'chaicode-collection',
      }
    );
    await vectorStore.delete({ids:[id]});
    
    console.log('Deleting document with ID:', id)
    
    return NextResponse.json({ 
      success: true, 
      message: `Document ${id} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}