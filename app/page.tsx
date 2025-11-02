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
  Stack,
  Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

  const SAMPLE_DOCSET_ID = process.env.NEXT_PUBLIC_SAMPLE_DOCSET_ID;

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

  const handleUseSampleDoc = () => {
    if (!SAMPLE_DOCSET_ID) {
      setError('Sample doc is not configured. Set NEXT_PUBLIC_SAMPLE_DOCSET_ID.');
      return;
    }

    const sampleDocset: DocsetData = {
      docset_id: SAMPLE_DOCSET_ID,
      name: 'Attention Is All You Need (Sample)',
      filename: 'Attention Is All You Need.pdf',
      status: 'ready',
      documents: [{ doc_id: 'sample', chunks: 0 }],
    };

    setCurrentDocset(sampleDocset);
    setQuestion('');
    setPendingQuestion(null);
    setGenerations([]);
    hasScrolledToChatRef.current = false;

    track('try_sample_doc_clicked', { docset_id: SAMPLE_DOCSET_ID });

    // Scroll to chat input
    setTimeout(() => {
      const element = document.getElementById('create-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    }, 0);
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
      // Build OpenAI-style messages array from conversation history
      const messages = [];
      
      // Add all previous Q&As
      for (const gen of generations) {
        messages.push({
          role: 'user',
          content: gen.question
        });
        messages.push({
          role: 'assistant',
          content: gen.content
        });
      }
      
      // Add current question
      messages.push({
        role: 'user',
        content: currentQuestion
      });

      const response = await fetch(`/api/docsets/${currentDocset.docset_id}/generate?factory_id=default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages, // Send full conversation history
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
          position: 'relative',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '150%', md: '100%' },
            height: '100%',
            background: theme.palette.mode === 'light'
              ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.15), transparent)'
              : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.2), transparent)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                mb: 4,
                borderRadius: '100px',
                border: `1.5px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'light' ? 'background.paper' : alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                Powered by a{' '}
                <Link
                  href="https://www.voltagepark.com/ai-factory?utm_source=doc-qa&utm_medium=link&utm_campaign=agentic_rag_demo&utm_content=hero_badge"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('voltage_park_link_click', { location: 'hero_badge' })}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 700,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Voltage Park AI Factory
                </Link>
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                mb: 3,
                background: theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Chat with your documents using AI
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Upload PDFs and get instant, accurate answers powered by retrieval-augmented generation
            </Typography>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 8 }}
            >
              <Button
                variant="contained"
                size="large"
                component="a"
                href="https://www.voltagepark.com/ai-factory-preview?utm_source=doc-qa&utm_medium=cta&utm_campaign=agentic_rag_demo&utm_content=hero_primary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('deploy_factory_clicked', { location: 'hero_primary' })}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.75,
                }}
              >
                Deploy Your Own AI Factory
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleUseSampleDoc}
                sx={{
                  px: 4,
                  py: 1.75,
                }}
              >
                Try Sample Document
              </Button>
            </Stack>

            {/* Stats */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              divider={<Divider orientation="vertical" flexItem />}
              spacing={{ xs: 3, sm: 4 }}
              justifyContent="center"
              sx={{
                py: 4,
                px: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'light' ? 'background.paper' : alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  Agentic
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  RAG architecture
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  100%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Source-grounded answers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  Instant
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Real-time responses
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* How it works Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: theme.palette.mode === 'light' ? '#fafafa' : alpha(theme.palette.background.paper, 0.3),
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              How it works
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              A simple, powerful workflow that turns your documents into an intelligent knowledge base
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 6 }}>
            {[
              {
                number: '01',
                title: 'Upload',
                description: 'Drop in your PDF documents to create a searchable collection',
              },
              {
                number: '02',
                title: 'Process',
                description: 'We parse, chunk, and embed your documents for semantic search',
              },
              {
                number: '03',
                title: 'Retrieve',
                description: 'AI agent finds the most relevant passages for your question',
              },
              {
                number: '04',
                title: 'Answer',
                description: 'Get accurate, contextual responses grounded in your sources',
              },
            ].map((step) => (
              <Paper
                key={step.number}
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'light'
                      ? '0 8px 24px -4px rgba(37, 99, 235, 0.15)'
                      : '0 8px 24px -4px rgba(59, 130, 246, 0.25)',
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.15),
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {step.description}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src="/how-it-works/sample.png"
              alt="Sample conversation showing a concise answer"
              sx={{
                width: '100%',
                maxWidth: '700px',
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'light'
                  ? '0 20px 60px -10px rgba(0, 0, 0, 0.15)'
                  : '0 20px 60px -10px rgba(0, 0, 0, 0.5)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography id="create-section" variant="h2" component="h2" gutterBottom>
              See it in action
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try this live demo with our sample document or upload your own
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
            {/* Upload Section */}
            {!currentDocset && (
              <Box>
                <DocumentUpload
                  docsetId={null}
                  onUploadComplete={handleUploadComplete}
                />
              </Box>
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
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'light' ? '#fafafa' : alpha(theme.palette.background.paper, 0.5),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {currentDocset.filename || 'Document'}
                      </Typography>
                      {generations.length === 0 && !pendingQuestion && (
                        <Typography variant="body2" color="text.secondary">
                          Ready to answer your questions
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleReset}
                    >
                      Upload New Document
                    </Button>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '400px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                  }}
                >
                  {generations.length === 0 && !pendingQuestion ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        flex: 1,
                        textAlign: 'center',
                        gap: 2,
                      }}
                    >
                      <QuestionAnswerIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                      <Typography variant="h6" color="text.secondary">
                        Ask a question to get started
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '400px' }}>
                        Try asking about the main concepts, key findings, or specific details from your document
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
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                px: 3,
                                py: 2,
                                borderRadius: 3,
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
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                          }}
                        >
                          <QuestionAnswerIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            px: 3,
                            py: 2,
                            borderRadius: 3,
                            borderTopLeftRadius: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Thinking...
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Input Area */}
                <Box
                  sx={{
                    p: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'light' ? '#fafafa' : alpha(theme.palette.background.paper, 0.5),
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
                          bgcolor: 'background.paper',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            type="submit"
                            disabled={isGenerating || !question.trim()}
                            color="primary"
                            sx={{
                              width: 40,
                              height: 40,
                            }}
                          >
                            {isGenerating ? (
                              <CircularProgress size={20} />
                            ) : (
                              <ArrowForwardIcon />
                            )}
                          </IconButton>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>

      {/* Deploy Your Own Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'light' ? 'primary.main' : alpha(theme.palette.primary.main, 0.95),
          color: 'primary.contrastText',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                mb: 3,
                fontWeight: 800,
                color: 'inherit',
              }}
            >
              Ready to Deploy Your Own AI Factory?
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                fontWeight: 400,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.6,
                opacity: 0.95,
              }}
            >
              This is just a demo. Get a custom AI Factory built for your documents, your models, and your business goals.
            </Typography>

            {/* Benefits Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
                mb: 6,
              }}
            >
              {[
                {
                  title: 'Faster Time-to-Value',
                  description: 'Move from idea to production-ready AI in weeks, not quarters.',
                },
                {
                  title: 'Private & Secure',
                  description: 'Your data never leaves your perimeter for zero compromise on security.',
                },
                {
                  title: 'Tailored to Work for You',
                  description: 'Work 1-on-1 with Voltage Park\'s engineering team to build a stack optimized for your exact workloads.',
                },
                {
                  title: 'Cost Transparency',
                  description: 'Pay only for GPU hours. No hidden token fees.',
                },
              ].map((benefit) => (
                <Paper
                  key={benefit.title}
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: alpha('#fff', theme.palette.mode === 'light' ? 0.95 : 0.1),
                    color: theme.palette.mode === 'light' ? 'text.primary' : 'primary.contrastText',
                    textAlign: 'left',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : 'inherit' }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === 'light' ? 'text.secondary' : alpha('#fff', 0.85) }}
                  >
                    {benefit.description}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* CTA */}
            <Button
              variant="contained"
              size="large"
              component="a"
              href="https://www.voltagepark.com/ai-factory-preview?utm_source=doc-qa&utm_medium=cta&utm_campaign=agentic_rag_demo&utm_content=deploy_section"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('deploy_factory_clicked', { location: 'deploy_section' })}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.125rem',
                bgcolor: theme.palette.mode === 'light' ? 'background.paper' : alpha('#fff', 0.95),
                color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.main',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.background.paper, 0.9) : '#fff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              Request Your Custom Factory
            </Button>

            <Typography
              variant="body2"
              sx={{
                mt: 3,
                opacity: 0.85,
              }}
            >
              Partner directly with our engineers to design, deploy, and scale your custom AI Factory
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
