'use client';

import { Box, Container, Typography, Link, alpha } from '@mui/material';
import { track } from '@vercel/analytics';

export default function Banner() {
  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.primary.main, 0.15),
        borderBottom: (theme) =>
          `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        py: 1.5,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          align="center"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            fontWeight: 500,
          }}
        >
          🎯 Demo Application • Built with{' '}
          <Link
            href="https://voltagepark.com/ai-factory"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('voltage_park_link_click', { location: 'banner' })}
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              textDecoration: 'none',
              borderBottom: '2px solid',
              borderBottomColor: 'primary.main',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            Voltage Park AI Factory
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

