# Doc Q&A

An AI-powered document analysis system that transforms your documents into an intelligent Q&A interface. Upload PDFs, contracts, papers, and more, then ask questions to get instant AI-powered answers. Built with Next.js 15, TypeScript, and Material UI, integrated with Voltage Park AI Factory.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Material UI](https://img.shields.io/badge/Material%20UI-v5-007FFF?logo=mui)](https://mui.com)

## Features

- 📄 **Document Upload** - Support for PDF, DOC, DOCX, and TXT files
- 🤖 **AI-Powered Q&A** - Ask questions and get intelligent answers from your documents
- 🎨 **Modern UI** - Sleek Material UI design with dark/light mode and green accent colors
- 📱 **Fully Responsive** - Optimized for all devices
- ⚡ **Real-time Processing** - Live document indexing and vector embedding
- 🔍 **Semantic Search** - Intelligent retrieval of relevant document chunks
- 🌐 **Unified Architecture** - Single Next.js app with API routes and frontend
- 📊 **Multi-Document Collections** - Organize documents into docsets for topic-specific Q&A

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [Voltage Park API credentials](https://voltagepark.com)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd doc-qa

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Voltage Park credentials

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
DOCSETS_API_URL=https://060de239.voltagepark.studio
DOCSETS_BEARER_TOKEN=your-bearer-token
```

Get your credentials from [Voltage Park](https://voltagepark.com).

## Usage

### 1. Create a Document Collection (Docset)

Give your collection a name and optional description:
- "Research Papers"
- "Legal Documents"
- "User Manuals"

### 2. Upload Documents

Upload one or more documents (PDF, DOC, DOCX, TXT). The system will:
- Extract text content
- Chunk the document into semantic sections
- Create vector embeddings for semantic search
- Index for fast retrieval

### 3. Ask Questions

Ask natural language questions about your documents:
- "What are the main findings?"
- "Summarize the key points"
- "What does section 3 say about...?"
- "Explain the methodology used"

The AI will retrieve relevant context and generate comprehensive answers.

## Technology Stack

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[Material UI v5](https://mui.com)** - Component library with custom green theme
- **[Emotion](https://emotion.sh)** - CSS-in-JS styling
- **[Voltage Park AI Factory](https://voltagepark.com)** - Document processing and Q&A generation

## Project Structure

```
doc-qa/
├── app/
│   ├── api/
│   │   ├── docsets/
│   │   │   ├── route.ts                    # POST - Create docset, GET - List docsets
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET - Get docset details
│   │   │       ├── ingest/route.ts         # POST - Upload document
│   │   │       └── generate/route.ts       # POST - Generate answer
│   │   └── health/route.ts                 # Health check
│   ├── components/
│   │   ├── AnswerCard.tsx                  # Answer display component
│   │   ├── DocumentUpload.tsx              # Document upload component
│   │   ├── Header.tsx                      # App header with branding
│   │   ├── Banner.tsx                      # Voltage Park banner
│   │   ├── Footer.tsx                      # App footer
│   │   ├── ClientLayout.tsx                # Layout wrapper
│   │   └── ThemeRegistry.tsx               # Theme provider
│   ├── lib/
│   │   ├── theme.ts                        # Material UI theme (green accents)
│   │   └── docsets-store.ts                # State management
│   ├── layout.tsx                          # Root layout
│   └── page.tsx                            # Home page with stepper interface
├── public/
│   └── favicon.svg
├── .env.example                            # Environment template
├── next.config.js                          # Next.js config
├── tsconfig.json                           # TypeScript config
└── package.json
```

## API Endpoints

### POST /api/docsets

Create a new document collection.

**Request:**
```json
{
  "name": "Research Papers",
  "description": "Analysis of attention-is-all-you-need paper",
  "factory_id": "default",
  "user_id": "anonymous"
}
```

**Response:**
```json
{
  "docset_id": "3da8233a-b11b-4c89-a000-95a97735a512",
  "name": "Research Papers",
  "status": "created"
}
```

### GET /api/docsets

List all document collections.

**Response:**
```json
{
  "docsets": [
    {
      "docset_id": "3da8233a-b11b-4c89-a000-95a97735a512",
      "name": "Research Papers",
      "description": "Analysis of attention-is-all-you-need paper",
      "status": "ready",
      "document_count": 1,
      "created_at": "2025-11-01T14:20:47.000848"
    }
  ],
  "count": 1
}
```

### POST /api/docsets/:id/ingest

Upload and process a document.

**Request:** (multipart/form-data)
- `file`: Document file (PDF, DOC, DOCX, TXT)
- `source_type`: Document type (default: "document")
- `factory_id`: Factory ID (default: "default")
- `doc_tags`: Comma-separated tags (optional)

**Response:**
```json
{
  "doc_id": "878f4019-9a1b-4c93-b1a0-4958212a8786",
  "status": "processed",
  "chunks": 35,
  "vectors": 35,
  "processing_time_ms": 48234
}
```

### POST /api/docsets/:id/generate

Generate an answer to a question about the documents.

**Request:**
```json
{
  "content_prompt": "What is this paper about?",
  "format_prompt": "Provide a detailed explanation with bullet points",
  "section_label": "Paper Summary",
  "top_k": 8
}
```

**Response:**
```json
{
  "docset_id": "3da8233a-b11b-4c89-a000-95a97735a512",
  "generation_id": "1adbcfc0-e5d6-40c6-a11b-e674f183bad6",
  "section_label": "Paper Summary",
  "content": "## Summary\n\nThis paper introduces...",
  "word_count": 339,
  "status": "completed",
  "processing_time_ms": 20931,
  "created_at": "2025-11-01T14:20:47.000848"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T...",
  "docsets": 3
}
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

Deploy to [Vercel](https://vercel.com) (recommended):

```bash
npm install -g vercel
vercel
```

Or deploy to:
- [Netlify](https://netlify.com)
- [AWS Amplify](https://aws.amazon.com/amplify)
- [Google Cloud Run](https://cloud.google.com/run)
- Any Node.js hosting platform

**Important:** Set environment variables (`DOCSETS_API_URL` and `DOCSETS_BEARER_TOKEN`) in your hosting platform's dashboard.

## Production Notes

The application currently uses in-memory storage for docsets and generations. For production deployment, consider:

1. **Database Integration** - Replace `docsets-store.ts` with PostgreSQL, MongoDB, or Redis
2. **Document Storage** - Store uploaded documents in S3 or similar object storage
3. **Rate Limiting** - Implement API rate limits to prevent abuse
4. **User Authentication** - Add login/signup for user-specific docsets
5. **Caching** - Cache generated answers to reduce API calls
6. **Monitoring** - Add logging and error tracking (e.g., Sentry)
7. **Vector Database** - For large-scale deployments, consider dedicated vector DB (Pinecone, Weaviate)

## API Integration Example

Using the Voltage Park API directly (via curl):

```bash
# 1. Create a docset
curl -X POST "https://060de239.voltagepark.studio/docsets/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "factory_id": "default",
    "name": "Attention Paper Analysis",
    "metadata": {
      "user_id": "user123",
      "description": "Analysis of attention-is-all-you-need paper"
    }
  }'

# 2. Upload a document
curl -X POST "https://060de239.voltagepark.studio/docsets/DOCSET_ID/ingest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@paper.pdf" \
  -F "source_type=contract" \
  -F "factory_id=default" \
  -F "doc_tags=paper,attention,nlp"

# 3. Ask a question
curl -X POST "https://060de239.voltagepark.studio/docsets/DOCSET_ID/generate?factory_id=default" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_prompt": "What is this paper about?",
    "top_k": 8
  }'
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Powered by [Voltage Park AI Factory](https://voltagepark.com)
- UI components from [Material UI](https://mui.com)
- Built with [Next.js](https://nextjs.org)

---

**Questions or issues?** Open an issue on GitHub or contact the maintainers.
