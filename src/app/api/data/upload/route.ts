import { NextRequest, NextResponse } from 'next/server'

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from 'langchain/document';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    // 1. Validate file type and size
    const fileType = file.type;
    const fileSize = file.size;
    const fileName = file.name;
    const fileExtension = file.name.split('.').pop();
    let docs: Document[] = [];


    // TODO: Implement file processing and storage logic



    // 2. Extract text content based on file type:
    //    - PDF: Use PDF parser
    if (fileExtension === 'pdf') {
      const loader = new PDFLoader(file);
       docs = await loader.load();
      console.log(docs);
    }

    //    - CSV: Parse CSV data
    if (fileExtension === 'csv') {
      const loader = new CSVLoader(
        file
      );
       docs = await loader.load();
      console.log(docs);
    }
    //    - TXT: Read text directly
    if (fileExtension === 'txt') {
      const loader = new TextLoader(
        file
      );
       docs = await loader.load();
      console.log(docs);
    }
    //    - DOC/DOCX: Use document parser
    if ( fileExtension === 'docx') {
       const loader = new DocxLoader(
        file
      );
       docs = await loader.load();
      console.log(docs);
    }
    if (fileExtension === 'doc') {
    const loader = new DocxLoader(
     file,
     {
       type: "doc",
     }
   );
    docs = await loader.load();
   console.log(docs);
  }
    // 3. Process the extracted text (chunking, embedding generation)
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
    });
    // 4. Store in vector database
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: 'http://localhost:6333',
      collectionName: 'chaicode-collection',
    });
    // 5. Return success response
    
    console.log('Received file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })
  } catch (error) {
    console.error('Error processing file upload:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}