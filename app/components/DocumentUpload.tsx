'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PROCESSING_MESSAGES = [
  'Reading your document...',
  'Extracting text and analyzing structure...',
  'Breaking it into semantic chunks...',
  'Creating vector embeddings...',
  'Indexing for fast retrieval...',
];

interface DocumentUploadProps {
  docsetId: string | null;
  onUploadComplete: (docsetId: string, docId: string, chunks: number, filename: string) => void;
}

export default function DocumentUpload({ docsetId, onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingDocset, setIsCreatingDocset] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate messages every 8 seconds during processing
  useEffect(() => {
    if (isUploading || isCreatingDocset) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setCurrentMessageIndex(0);
    }
  }, [isUploading, isCreatingDocset]);

  const generateRandomDocsetName = (fileName: string): string => {
    const timestamp = Date.now().toString(36);
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const sanitized = nameWithoutExt.substring(0, 20).replace(/[^a-z0-9]/gi, '');
    return `Document ${sanitized || 'Collection'} ${timestamp}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let currentDocsetId = docsetId;

      // Create docset and upload document in one call if docset doesn't exist
      if (!currentDocsetId) {
        setIsCreatingDocset(true);
        const docsetName = generateRandomDocsetName(file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', docsetName);
        formData.append('description', `Document collection for ${file.name}`);
        formData.append('factory_id', 'default');
        formData.append('user_id', 'anonymous');
        formData.append('top_k', '8');
        
        const docsetResponse = await fetch('/api/docsets', {
          method: 'POST',
          body: formData,
        });

        if (!docsetResponse.ok) {
          const errorData = await docsetResponse.json();
          throw new Error(errorData.error || 'Failed to create docset and upload document');
        }

        const docsetData = await docsetResponse.json();
        // Extract docset_id from response (could be in docset_id or job_id field)
        currentDocsetId = docsetData.docset_id || docsetData.job_id || docsetData.id;
        
        if (!currentDocsetId) {
          throw new Error('Failed to get docset ID from response');
        }
        
        setIsCreatingDocset(false);
        
        // File upload is complete, use the response data
        setUploadProgress(100);
        const finalDocsetId = currentDocsetId; // Capture for closure
        setTimeout(() => {
          onUploadComplete(finalDocsetId, docsetData.doc_id || docsetData.job_id || finalDocsetId, docsetData.chunks || 0, file.name);
          setFile(null);
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      } else {
        // Upload document to existing docset
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_type', 'contract');
        formData.append('factory_id', 'default');

        const response = await fetch(`/api/docsets/${currentDocsetId}/ingest`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        setUploadProgress(100);
        
        setTimeout(() => {
          onUploadComplete(currentDocsetId!, data.doc_id, data.chunks, file.name);
          setFile(null);
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Upload failed');
      setIsUploading(false);
      setIsCreatingDocset(false);
      setUploadProgress(0);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '2px dashed',
        borderColor: file ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, file ? 0.05 : 0.02)
            : alpha(theme.palette.primary.main, file ? 0.1 : 0.05),
        transition: 'all 0.3s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
      />
      
      <Box sx={{ textAlign: 'center' }}>
        {!file && !isUploading && (
          <>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2,
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Upload a Document
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              PDF files only
            </Typography>
            <label htmlFor="file-upload">
              <Button 
                variant="contained" 
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Choose File
              </Button>
            </label>
          </>
        )}

        {file && !isUploading && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleUpload}
                startIcon={<CloudUploadIcon />}
              >
                Upload & Process
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {(isUploading || isCreatingDocset) && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {isCreatingDocset ? 'Creating collection...' : 'Processing Document...'}
            </Typography>
            <LinearProgress 
              variant="indeterminate" 
              sx={{ mb: 2, mt: 2 }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                minHeight: '1.5em',
                transition: 'opacity 0.3s ease',
              }}
            >
              {isCreatingDocset 
                ? 'Setting up your document collection...'
                : PROCESSING_MESSAGES[currentMessageIndex]}
            </Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

