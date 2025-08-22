import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface QdrantConfig {
  url: string;
  collectionName: string;
  apiKey?: string;
}

export function getQdrantConfig(): QdrantConfig {
  const url = process.env.QDRANT_URL;
  const collectionName = process.env.QDRANT_COLLECTION || 'chaicode-collection';
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url) {
    throw new Error('QDRANT_URL environment variable is required');
  }

  return {
    url,
    collectionName,
    apiKey,
  };
}

export async function createQdrantVectorStore(embeddings: OpenAIEmbeddings): Promise<QdrantVectorStore> {
  const config = getQdrantConfig();
  
  const qdrantConfig: any = {
    url: config.url,
    collectionName: config.collectionName,
  };

  // Add API key if provided (for Qdrant Cloud)
  if (config.apiKey) {
    qdrantConfig.apiKey = config.apiKey;
  }

  return await QdrantVectorStore.fromExistingCollection(embeddings, qdrantConfig);
}

export function createQdrantClient(): QdrantClient {
  const config = getQdrantConfig();
  
  const clientConfig: any = {
    url: config.url,
  };

  // Add API key if provided (for Qdrant Cloud)
  if (config.apiKey) {
    clientConfig.apiKey = config.apiKey;
  }

  return new QdrantClient(clientConfig);
}