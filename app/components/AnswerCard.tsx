'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  alpha,
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

interface AnswerCardProps {
  question: string;
  answer: string;
  section_label?: string;
  word_count?: number;
  created_at?: string;
}

export default function AnswerCard({ 
  question, 
  answer, 
  section_label, 
  word_count,
  created_at 
}: AnswerCardProps) {
  return (
    <Card 
      elevation={2}
      sx={{
        width: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': {
            transform: 'none',
          },
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <QuestionAnswerIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {question}
            </Typography>
            {section_label && (
              <Chip 
                label={section_label} 
                size="small" 
                sx={{ mb: 1 }}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.03)
                : alpha(theme.palette.primary.main, 0.08),
            mb: 2,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}
          >
            {answer}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {word_count && (
            <Typography variant="caption" color="text.secondary">
              {word_count} words
            </Typography>
          )}
          {created_at && (
            <Typography variant="caption" color="text.secondary">
              {new Date(created_at).toLocaleString()}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ fontStyle: 'italic', ml: 'auto' }}
          >
            Generated with AI
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

