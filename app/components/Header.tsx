'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
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
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Description,
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
            <ListItemText primary="Ask a question" />
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
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(30, 30, 30, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
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
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Description 
              sx={{ 
                fontSize: { xs: 28, sm: 36 },
                color: 'primary.main',
              }} 
            />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                color: 'text.primary',
                letterSpacing: '-0.02em',
                '& span': {
                  color: 'primary.main',
                },
              }}
            >
              Doc<span>QA</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            >
              {theme.palette.mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            {!isMobile && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleScrollToCreate}
                sx={{ ml: 1 }}
              >
                Ask a question
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

