'use client';

import { Box, Container, Typography, Link, IconButton, Stack, alpha } from '@mui/material';
import { GitHub, LinkedIn, OpenInNew } from '@mui/icons-material';
import { track } from '@vercel/analytics';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? '#fafafa'
            : alpha(theme.palette.background.paper, 0.3),
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
            gap: { xs: 4, md: 8 },
            mb: 6,
          }}
        >
          {/* Left Column */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '14px',
                    height: '18px',
                    borderRadius: '2px',
                    border: '2.5px solid white',
                    borderBottom: '3.5px solid white',
                  },
                }}
              />
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                DocQA
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
              Intelligent document Q&A powered by agentic RAG. Built with a Voltage Park AI Factory for enterprise-grade performance and security.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="LinkedIn"
                href="https://www.linkedin.com/company/voltage-park/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'linkedin_company' })}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#2563eb', 0.08),
                  },
                }}
              >
                <LinkedIn sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                aria-label="GitHub"
                href="https://github.com/voltagepark"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                onClick={() => track('social_link_clicked', { platform: 'github_org' })}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#2563eb', 0.08),
                  },
                }}
              >
                <GitHub sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Right Column */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Build with AI Factory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Deploy your own AI-powered applications with pre-configured blueprints and enterprise infrastructure.
            </Typography>
            <Link
              href="https://www.voltagepark.com/ai-factory-preview?utm_source=doc-qa&utm_medium=cta&utm_campaign=agentic_rag_demo&utm_content=footer_cta"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cta_build_with_ai_factory', { location: 'footer' })}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Learn more <OpenInNew sx={{ fontSize: 16 }} />
            </Link>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Powered by{' '}
            <Link
              href="https://www.voltagepark.com/ai-factory?utm_source=doc-qa&utm_medium=link&utm_campaign=agentic_rag_demo&utm_content=footer_link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('voltage_park_link_click', { location: 'footer' })}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Voltage Park
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Demo Application
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

