import { NextRequest, NextResponse } from 'next/server'
import { OpenAIEmbeddings } from '@langchain/openai';
import OpenAI from 'openai';
import { createQdrantVectorStore } from '@/lib/qdrant';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid message is required' },
        { status: 400 }
      );
    }

    // Sanitize message length
    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message too long. Maximum 2000 characters.' },
        { status: 400 }
      );
    }

    // Validate conversation history
    if (conversationHistory && (!Array.isArray(conversationHistory) || conversationHistory.length > 20)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation history' },
        { status: 400 }
      );
    }
    
    console.log('Received chat message:', message.substring(0, 100))
    console.log('Conversation history length:', conversationHistory?.length || 0)
    
    // Initialize OpenAI and embeddings
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });
    
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [CHAT-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to vector store and search for relevant documents
    const vectorStore = await createQdrantVectorStore(embeddings);
    
    const relevantDocs = await vectorStore.similaritySearch(message, 5);
    console.log(`Found ${relevantDocs.length} relevant documents`);
    
    // Prepare context from relevant documents
    const context = relevantDocs.map((doc, index) => 
      `Document ${index + 1}: ${doc.pageContent}`
    ).join('\n\n');
    
    // Prepare conversation history
    const history = conversationHistory?.slice(-5).map((msg: any) => 
      `${msg.type === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n') || '';
    
    // Create system prompt with context
    const systemPrompt = `You are a helpful AI assistant. Use the following context to answer the user's question. If you cannot answer based on the context, say so clearly.

Context:
${context}

Conversation History:
${history}`;
    
    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const response = completion.choices[0]?.message?.content || 'No response generated';
    
    // Extract sources from relevant documents
    const sources = relevantDocs.map(doc => {
      const metadata = doc.metadata;
      if (metadata.type === 'website') {
        return `Website: ${metadata.title || metadata.url}`;
      } else if (metadata.type === 'file') {
        return `File: ${metadata.fileName || metadata.title}`;
      } else if (metadata.type === 'text') {
        return `Text: ${metadata.title}`;
      } else {
        return `Document: ${metadata.title || 'Unknown'}`;
      }
    });
    
    console.log('Generated response successfully');
    
    return NextResponse.json({ 
      success: true,
      response: response,
      sources: sources,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing chat message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}