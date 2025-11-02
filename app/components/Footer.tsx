'use client';

import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { GitHub, LinkedIn } from '@mui/icons-material';
import { track } from '@vercel/analytics';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              DocQA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered document analysis
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Follow Me
            </Typography>
            <Box>
              <IconButton
                aria-label="LinkedIn"
                href="https://www.linkedin.com/in/eric-jackson-b4a5741a0"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'linkedin' })}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                aria-label="GitHub"
                href="https://github.com/ejackson-vp"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'github' })}
              >
                <GitHub />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: '0.75rem' }}
        >
          Built using{' '}
          <Link
            href="https://voltagepark.com/ai-factory"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('voltage_park_link_click', { location: 'footer' })}
            color="primary"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Voltage Park AI Factory
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

