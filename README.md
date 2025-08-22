# RAG Reader - AI-Powered Document Analysis

A modern Next.js application that combines Retrieval Augmented Generation (RAG) with a beautiful, high-contrast UI for document processing and AI-powered chat.

## 🚀 Features

- **Document Upload**: Support for PDF, CSV, TXT, DOCX files
- **Web Scraping**: Extract content from websites and articles
- **Text Input**: Direct text processing and analysis
- **AI Chat**: Intelligent conversations based on your document knowledge base
- **Vector Search**: Powered by Qdrant vector database
- **Real-time UI**: Toast notifications and progress indicators
- **Responsive Design**: Works on desktop and mobile devices

## 🛡️ Security Features

- Input sanitization and validation
- File type and size restrictions
- Security headers (XSS, CSRF protection)
- Environment variable validation
- Rate limiting ready

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Custom CSS with high-contrast design system
- **AI**: OpenAI GPT-3.5-turbo, OpenAI Embeddings
- **Vector DB**: Qdrant Cloud
- **Document Processing**: LangChain, Playwright
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key
- Qdrant Cloud account (or self-hosted Qdrant)

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
QDRANT_URL=https://your-qdrant-cloud-url
QDRANT_COLLECTION=ragReader-collection
```

## 🚀 Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Dependency Management

This project uses specific versions to ensure compatibility:
- OpenAI v4.62.1 (compatible with LangChain)
- LangChain v0.3.2 (stable release)
- Next.js v14.2.32 (security patched)

## 📦 Production Build

```bash
npm run build
npm start
```

## 🔐 Security Notes

- Never commit `.env` files to git
- Use strong API keys
- Regularly update dependencies
- Monitor usage and costs

## 📄 License

Private project - All rights reserved

## 🤝 Support

For issues and questions, please open a GitHub issue.