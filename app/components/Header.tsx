'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { track } from '@vercel/analytics';

interface HeaderProps {
  onThemeToggle: () => void;
}

export default function Header({ onThemeToggle }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleScrollToCreate = () => {
    const element = document.getElementById('create-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      track('ask_question_clicked', { location: 'header' });
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleScrollToCreate}>
            <ListItemText primary="Try Demo" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        color="default"
        sx={{
          backdropFilter: 'blur(12px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.85)' 
            : 'rgba(10, 10, 10, 0.85)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: theme.palette.mode === 'light'
                  ? '0 4px 12px -2px rgba(37, 99, 235, 0.3)'
                  : '0 4px 12px -2px rgba(59, 130, 246, 0.4)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '16px',
                  height: '20px',
                  borderRadius: '2px',
                  border: '2.5px solid white',
                  borderBottom: '4px solid white',
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.4rem' },
                  color: 'text.primary',
                  letterSpacing: '-0.03em',
                }}
              >
                DocQA
              </Box>
              <Chip 
                label="DEMO" 
                size="small"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  bgcolor: theme.palette.mode === 'light' 
                    ? 'rgba(37, 99, 235, 0.1)' 
                    : 'rgba(59, 130, 246, 0.2)',
                  color: 'primary.main',
                  border: 'none',
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => {
                track('theme_toggled', { 
                  from: theme.palette.mode,
                  to: theme.palette.mode === 'light' ? 'dark' : 'light',
                });
                onThemeToggle();
              }}
              color="inherit"
              aria-label={`Switch to ${theme.palette.mode === 'light' ? 'dark' : 'light'} mode`}
              sx={{
                width: 44,
                height: 44,
              }}
            >
              {theme.palette.mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            {!isMobile && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleScrollToCreate}
              >
                Try Demo
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

