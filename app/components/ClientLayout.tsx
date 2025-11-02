'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
  onThemeToggle: () => void;
}

export default function ClientLayout({ children, onThemeToggle }: ClientLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header onThemeToggle={onThemeToggle} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

