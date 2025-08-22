import { NextRequest, NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'csv', 'txt', 'docx', 'doc'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📁 [UPLOAD-API] Processing file upload request');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ [UPLOAD-API] No file provided in request');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file properties
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    console.log(`📄 [UPLOAD-API] Processing file: ${fileName} (${fileSize} bytes, ${fileType})`);

    // Validate file extension
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.log(`❌ [UPLOAD-API] Unsupported file extension: ${fileExtension}`);
      return NextResponse.json(
        { success: false, error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      console.log(`❌ [UPLOAD-API] File too large: ${fileSize} bytes`);
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (fileType && !ALLOWED_MIME_TYPES.includes(fileType)) {
      console.log(`❌ [UPLOAD-API] Unsupported MIME type: ${fileType}`);
      return NextResponse.json(
        { success: false, error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [UPLOAD-API] Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let docs: Document[] = [];

    // Process file based on extension
    try {
      switch (fileExtension) {
        case 'pdf':
          console.log('📋 [UPLOAD-API] Processing PDF file');
          const pdfLoader = new PDFLoader(file);
          docs = await pdfLoader.load();
          break;

        case 'csv':
          console.log('📊 [UPLOAD-API] Processing CSV file');
          const csvLoader = new CSVLoader(file);
          docs = await csvLoader.load();
          break;

        case 'txt':
          console.log('📋 [UPLOAD-API] Processing TXT file');
          const text = await file.text();
          docs = [new Document({
            pageContent: text,
            metadata: { source: fileName }
          })];
          break;

        case 'docx':
        case 'doc':
          console.log('📄 [UPLOAD-API] Processing Word document');
          const docLoader = new DocxLoader(file);
          docs = await docLoader.load();
          break;

        default:
          throw new Error(`Unsupported file extension: ${fileExtension}`);
      }

      console.log(`📄 [UPLOAD-API] Extracted ${docs.length} documents from file`,docs);
      
      if (docs.length === 0) {
        console.log('⚠️ [UPLOAD-API] No content extracted from file');
        return NextResponse.json(
          { success: false, error: 'No content could be extracted from the file' },
          { status: 422 }
        );
      }

    } catch (extractionError) {
      console.error('❌ [UPLOAD-API] Error extracting content from file:', extractionError);
      return NextResponse.json(
        { success: false, error: 'Failed to extract content from file' },
        { status: 422 }
      );
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`📄 [UPLOAD-API] Split into ${splitDocs.length} chunks`);

    // Add metadata to documents
    const processedDocs: Document[] = splitDocs.map((doc, index) => new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        id: `file-${Date.now()}-${index}`,
        type: 'file',
        title: fileName,
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileExtension,
        timestamp: new Date().toISOString(),
        chunkIndex: index,
        totalChunks: splitDocs.length
      }
    }));

    // Initialize embeddings and vector store
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });

    console.log('🔗 [UPLOAD-API] Storing documents in vector database...');
    const vectorStore = await QdrantVectorStore.fromDocuments(processedDocs, embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: process.env.QDRANT_COLLECTION || 'chaicode-collection',
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ [UPLOAD-API] Successfully processed file in ${processingTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded and processed successfully',
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileExtension,
      metadata: {
        documentsCreated: processedDocs.length,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [UPLOAD-API] Error processing file upload (${processingTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process file upload',
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}