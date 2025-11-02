'use client';

import { Box, Container, Typography, Link, IconButton, Divider, Button } from '@mui/material';
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
              Agentic RAG demo built with a Voltage Park AI Factory
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Voltage Park
            </Typography>
            <Box>
              <IconButton
                aria-label="LinkedIn"
                href="https://www.linkedin.com/company/voltage-park/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'linkedin_company' })}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                aria-label="GitHub"
                href="https://github.com/voltagepark"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'github_org' })}
              >
                <GitHub />
              </IconButton>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                href="https://www.voltagepark.com/ai-factory-preview?utm_source=doc-qa&utm_medium=cta&utm_campaign=agentic_rag_demo&utm_content=footer_cta"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_build_with_ai_factory', { location: 'footer' })}
              >
                Build your own AI Factory
              </Button>
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
          Built with a{' '}
          <Link
            href="https://www.voltagepark.com/ai-factory?utm_source=doc-qa&utm_medium=link&utm_campaign=agentic_rag_demo&utm_content=footer_link"
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

