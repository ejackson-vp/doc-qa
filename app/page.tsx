'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  alpha,
  useTheme,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Link,
  IconButton,
  Avatar,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import { track } from '@vercel/analytics';
import DocumentUpload from './components/DocumentUpload';
import ChatMessage from './components/ChatMessage';

interface DocsetData {
  docset_id: string;
  name: string;
  filename?: string;
  status: 'created' | 'ready';
  documents: Array<{
    doc_id: string;
    chunks: number;
  }>;
}

interface GenerationData {
  generation_id: string;
  question: string;
  content: string;
  section_label?: string;
  word_count?: number;
  created_at?: string;
}

export default function Home() {
  const theme = useTheme();
  const [currentDocset, setCurrentDocset] = useState<DocsetData | null>(null);
  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasScrolledToChatRef = useRef(false);

  const FORMAT_PROMPT = 'Respond in a concise, 2-5 sentence paragraph';

  // Focus input only when document is first ready (not during chat)
  useEffect(() => {
    if (currentDocset && !isGenerating && !hasScrolledToChatRef.current && generations.length === 0) {
      hasScrolledToChatRef.current = true;
      // Scroll to chat section
      const element = document.getElementById('create-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [currentDocset, isGenerating, generations.length]);

  const handleScrollToCreate = () => {
    const element = document.getElementById('create-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      track('get_started_clicked', { location: 'hero_section' });
    }
  };

  const handleUploadComplete = (docsetId: string, docId: string, chunks: number, filename: string) => {
    const updatedDocset: DocsetData = {
      docset_id: docsetId,
      name: `Document Collection ${Date.now().toString(36)}`,
      filename: filename,
      status: 'ready',
      documents: [{ doc_id: docId, chunks }],
    };
    setCurrentDocset(updatedDocset);
    
    track('document_uploaded', {
      docset_id: docsetId,
      doc_id: docId,
      chunks,
    });
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!question.trim() || !currentDocset) return;

    const currentQuestion = question.trim();
    setPendingQuestion(currentQuestion);
    setQuestion('');
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/docsets/${currentDocset.docset_id}/generate?factory_id=default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content_prompt: currentQuestion,
          // format_prompt: FORMAT_PROMPT,
          top_k: 8
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate answer');
      }

      const data = await response.json();
      
      track('question_answered', {
        docset_id: currentDocset.docset_id,
        question: currentQuestion,
        word_count: data.word_count,
      });
      
      setGenerations([...generations, {
        generation_id: data.generation_id,
        question: currentQuestion,
        content: data.content,
        section_label: data.section_label,
        word_count: data.word_count,
        created_at: data.created_at,
      }]);
      
      setPendingQuestion(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to generate answer');
      setPendingQuestion(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const handleReset = () => {
    if (currentDocset) {
      track('upload_new_document_clicked', {
        messages_count: generations.length,
        docset_id: currentDocset.docset_id,
      });
    }
    setCurrentDocset(null);
    setQuestion('');
    setPendingQuestion(null);
    setGenerations([]);
    setError(null);
    hasScrolledToChatRef.current = false;
  };

  return (
    <Box component="main">
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.secondary.dark, 0.2)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 3,
              }}
            >
              Upload documents. Ask questions. Get instant AI-powered answers.
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 400 }}
            >
              Transform your documents into an intelligent Q&A system powered by cutting-edge AI.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mb: 6,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleScrollToCreate}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Get Started
              </Button>
            </Box>

            {/* Voltage Park AI Factory Info Box */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.3),
                maxWidth: '900px',
                mx: 'auto',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: '0.1em',
                  }}
                >
                  DEMO APPLICATION
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    mb: 2,
                  }}
                >
                  Built with{' '}
                  <Link
                    href="https://www.voltagepark.com/ai-factory"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('voltage_park_link_click', { location: 'hero_section' })}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      borderBottom: '3px solid',
                      borderBottomColor: 'primary.main',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    Voltage Park AI Factory
                  </Link>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
                  This app demonstrates intelligent document analysis using pre-configured AI templates 
                  that let you deploy production systems in minutes.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 3,
                  mt: 4,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <RocketLaunchIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Deploy in Minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    No infrastructure setup required
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : alpha(theme.palette.secondary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Lightning Fast
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Optimized AI inference
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Enterprise Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Built-in compliance
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Main Content Section */}
      <Box
        id="create-section"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? alpha(theme.palette.primary.main, 0.03)
              : alpha(theme.palette.primary.main, 0.08),
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Chat with your document
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Upload a document and start asking questions
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
            {/* Upload Section */}
            {!currentDocset && (
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              mb: 4,
            }}
          >
                <DocumentUpload
                  docsetId={null}
                  onUploadComplete={handleUploadComplete}
                />
              </Paper>
            )}

            {/* Chat Interface */}
            {currentDocset && (
              <Paper
                elevation={2}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {currentDocset.filename || 'Document'}
                    </Typography>
                    {generations.length === 0 && !pendingQuestion && (
                      <Typography variant="body2" color="text.secondary">
                        Document ready. Ask a question to get started.
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Messages Area - Grows with content */}
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '300px',
                  }}
                >
                  {generations.length === 0 && !pendingQuestion ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        minHeight: '300px',
                      }}
                    >
                      <Typography variant="body1" align="center">
                        Start a conversation by asking a question about your document.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {generations.map((gen) => (
                        <ChatMessage
                          key={gen.generation_id}
                          question={gen.question}
                          answer={gen.content}
                          section_label={gen.section_label}
                        />
                      ))}
                      {pendingQuestion && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', maxWidth: '85%', flexDirection: 'row-reverse' }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                p: 2,
                                borderRadius: 2,
                                borderTopRightRadius: 0,
                              }}
                            >
                              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                {pendingQuestion}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                  {isGenerating && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', maxWidth: '85%' }}>
                        <Avatar
                          sx={{
                            bgcolor: (theme) =>
                              theme.palette.mode === 'light'
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.primary.main, 0.2),
                            color: 'primary.main',
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                          }}
                        >
                          <QuestionAnswerIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box
                          sx={{
                            bgcolor: (theme) =>
                              theme.palette.mode === 'light'
                                ? alpha(theme.palette.primary.main, 0.05)
                                : alpha(theme.palette.primary.main, 0.1),
                            p: 2,
                            borderRadius: 2,
                            borderTopLeftRadius: 0,
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Input Area - Fixed at bottom */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Box component="form" onSubmit={handleAskQuestion} noValidate>
                    <TextField
                      inputRef={inputRef}
                      fullWidth
                      placeholder="Ask a question about your document..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isGenerating}
                      variant="outlined"
                      autoComplete="off"
                      multiline
                      rows={1}
                      maxRows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                        mb: 1.5,
                      }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            type="submit"
                            disabled={isGenerating || !question.trim()}
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            {isGenerating ? (
                              <CircularProgress size={20} />
                            ) : (
                              <QuestionAnswerIcon />
                            )}
                          </IconButton>
                        ),
                      }}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleReset}
                      sx={{ mt: 1 }}
                    >
                      Upload New Document
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
              </Box>
        </Container>
      </Box>
    </Box>
  );
}
