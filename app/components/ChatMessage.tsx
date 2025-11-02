'use client';

import {
  Box,
  Typography,
  alpha,
  Avatar,
  Chip,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: { xs: 'flex-end', sm: 'flex-start' }, maxWidth: { xs: '95%', sm: '80%' }, flexDirection: { xs: 'column', sm: 'row-reverse' } }}>
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
            <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1rem' }}>
              {question}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* AI Answer - Left aligned */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', maxWidth: { xs: '95%', sm: '80%' }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Avatar
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.2),
              color: 'primary.main',
              width: 36,
              height: 36,
              flexShrink: 0,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? '#fafafa'
                  : alpha(theme.palette.background.paper, 0.6),
              px: 3,
              py: 2,
              borderRadius: 3,
              borderTopLeftRadius: 0,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {section_label && (
              <Chip
                label={section_label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: alpha('#2563eb', 0.1),
                  color: 'primary.main',
                  mb: 1.5,
                  border: 'none',
                }}
              />
            )}
            <Box
              sx={{
                '& p': {
                  margin: '0 0 1em 0',
                  lineHeight: 1.7,
                  fontSize: '1rem',
                  '&:last-child': {
                    marginBottom: 0,
                  },
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  marginTop: '1.2em',
                  marginBottom: '0.6em',
                  fontWeight: 700,
                  '&:first-of-type': {
                    marginTop: 0,
                  },
                },
                '& ul, & ol': {
                  margin: '0.8em 0',
                  paddingLeft: '1.8em',
                },
                '& li': {
                  margin: '0.4em 0',
                  lineHeight: 1.6,
                },
                '& code': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.dark',
                  padding: '0.2em 0.5em',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontWeight: 500,
                },
                '& pre': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? alpha(theme.palette.primary.main, 0.05)
                      : alpha(theme.palette.primary.main, 0.1),
                  padding: '1.2em',
                  borderRadius: '8px',
                  overflow: 'auto',
                  margin: '1em 0',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& code': {
                    bgcolor: 'transparent',
                    padding: 0,
                    color: 'text.primary',
                  },
                },
                '& blockquote': {
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  paddingLeft: '1.2em',
                  margin: '1em 0',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                },
                '& strong': {
                  fontWeight: 700,
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  borderBottom: '1px solid',
                  borderBottomColor: alpha('#2563eb', 0.3),
                  transition: 'border-color 0.15s ease',
                  '&:hover': {
                    borderBottomColor: 'primary.main',
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
