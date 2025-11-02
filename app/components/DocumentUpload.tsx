'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  alpha,
  Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 },
        borderRadius: 3,
        border: '2px dashed',
        borderColor: file ? 'primary.main' : theme => theme.palette.divider,
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? file ? alpha(theme.palette.primary.main, 0.02) : '#fafafa'
            : file ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.background.paper, 0.4),
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: !file && !isUploading ? 'pointer' : 'default',
        '&:hover': !file && !isUploading ? {
          borderColor: 'primary.main',
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? alpha(theme.palette.primary.main, 0.03)
              : alpha(theme.palette.primary.main, 0.12),
        } : {},
      }}
      onClick={() => {
        if (!file && !isUploading && fileInputRef.current) {
          fileInputRef.current.click();
        }
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
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 8px 24px -4px rgba(37, 99, 235, 0.3)'
                    : '0 8px 24px -4px rgba(59, 130, 246, 0.4)',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Upload your document
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Drag and drop or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Supports PDF files up to 50MB
              </Typography>
            </Box>

            <Button 
              variant="contained"
              size="large"
              startIcon={<InsertDriveFileIcon />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </Stack>
        )}

        {file && !isUploading && (
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: alpha('#2563eb', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                startIcon={<CloudUploadIcon />}
              >
                Upload & Process
              </Button>
              <Button 
                variant="outlined"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}

        {(isUploading || isCreatingDocset) && (
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: alpha('#2563eb', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>

            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom align="center">
                {isCreatingDocset ? 'Creating collection...' : 'Processing your document'}
              </Typography>
              <LinearProgress 
                variant="indeterminate" 
                sx={{ 
                  my: 2,
                  height: 6,
                  borderRadius: 3,
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                align="center"
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
          </Stack>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 3 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

