# RAG Reader

A Next.js application for Retrieval Augmented Generation (RAG) that allows users to upload documents, scrape websites, and chat with their data using AI.

## Features

- 📝 **Text Input**: Direct text input for processing
- 📁 **File Upload**: Support for PDF, CSV, TXT, DOC, DOCX files
- 🌐 **Website Scraping**: Extract content from web pages
- 💬 **AI Chat**: Chat with your uploaded data using RAG
- 🔍 **Document Management**: View and manage stored documents
- 🎯 **Vector Search**: Semantic search using embeddings

## Prerequisites

1. **Node.js** (v18 or later)
2. **Qdrant Vector Database** (Docker recommended)
3. **OpenAI API Key**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Qdrant Vector Database

Using Docker:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

Or install Qdrant locally following their [documentation](https://qdrant.tech/documentation/quick-start/).

### 3. Environment Variables

Copy the example environment file and fill in your values:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=chaicode-collection
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## API Endpoints

- `POST /api/data/text` - Process text input
- `POST /api/data/website` - Scrape and process website content
- `POST /api/data/upload` - Upload and process files
- `GET /api/documents` - Fetch all stored documents
- `DELETE /api/documents` - Clear all documents
- `DELETE /api/documents/[id]` - Delete specific document
- `POST /api/chat` - Chat with your data

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Vector Database**: Qdrant for storing embeddings
- **AI**: OpenAI GPT for chat and embeddings
- **Document Processing**: LangChain for text splitting and processing

## File Support

- **PDF**: Extracted using PDF loaders
- **CSV**: Parsed as structured data
- **TXT**: Direct text processing
- **DOC/DOCX**: Microsoft Word document processing

## Logging

The application includes comprehensive logging with emojis for easy identification:
- 📝 Text processing
- 🌐 Website scraping
- 📁 File uploads
- 📊 Document management
- 🤖 Chat interactions

## Error Handling

All APIs include proper error handling for:
- Input validation
- File type validation
- Size limits
- Network errors
- Database connection issues
- Missing environment variables

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

1. **Qdrant Connection Issues**: Ensure Qdrant is running on port 6333
2. **OpenAI API Errors**: Check your API key and quota
3. **File Upload Issues**: Check file size limits (10MB max)
4. **Missing Dependencies**: Run `npm install` to ensure all packages are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request