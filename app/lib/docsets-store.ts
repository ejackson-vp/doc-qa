// In-memory storage for docset jobs (use database in production)
interface Docset {
  id: string;
  status: 'created' | 'ingesting' | 'ready' | 'failed';
  name: string;
  description?: string;
  factory_id: string;
  user_id: string;
  documents: Document[];
  createdAt: string;
  updatedAt?: string;
  error?: string;
}

interface Document {
  doc_id: string;
  status: 'processing' | 'processed' | 'failed';
  source_type: string;
  doc_tags?: string[];
  chunks?: number;
  vectors?: number;
  uploadedAt: string;
  error?: string;
}

interface Generation {
  id: string;
  docset_id: string;
  generation_id: string;
  question: string;
  section_label?: string;
  content?: string;
  word_count?: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Use globalThis to persist the Maps across hot reloads in development
declare global {
  var docsetsStore: Map<string, Docset> | undefined;
  var generationsStore: Map<string, Generation> | undefined;
}

export const docsets = globalThis.docsetsStore ?? new Map<string, Docset>();
export const generations = globalThis.generationsStore ?? new Map<string, Generation>();

if (process.env.NODE_ENV === 'development') {
  globalThis.docsetsStore = docsets;
  globalThis.generationsStore = generations;
}

