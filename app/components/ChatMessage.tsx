'use client';

import {
  Box,
  Typography,
  alpha,
  Avatar,
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  question: string;
  answer: string;
  section_label?: string;
}

export default function ChatMessage({ 
  question, 
  answer, 
  section_label
}: ChatMessageProps) {
  return (
    <>
      {/* User Question - Right aligned */}
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
              {question}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* AI Answer - Left aligned */}
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
            {section_label && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  display: 'block',
                  mb: 1,
                }}
              >
                {section_label}
              </Typography>
            )}
            <Box
              sx={{
                '& p': {
                  margin: '0 0 1em 0',
                  '&:last-child': {
                    marginBottom: 0,
                  },
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  marginTop: '1em',
                  marginBottom: '0.5em',
                  fontWeight: 600,
                  '&:first-of-type': {
                    marginTop: 0,
                  },
                },
                '& ul, & ol': {
                  margin: '0.5em 0',
                  paddingLeft: '1.5em',
                },
                '& li': {
                  margin: '0.25em 0',
                },
                '& code': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.2),
                  padding: '0.2em 0.4em',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontFamily: 'monospace',
                },
                '& pre': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.2),
                  padding: '1em',
                  borderRadius: '8px',
                  overflow: 'auto',
                  margin: '0.5em 0',
                  '& code': {
                    bgcolor: 'transparent',
                    padding: 0,
                  },
                },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  paddingLeft: '1em',
                  margin: '0.5em 0',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                },
                '& strong': {
                  fontWeight: 600,
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <ReactMarkdown>{answer}</ReactMarkdown>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
