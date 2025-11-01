import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import ThemeRegistry from './components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Doc Q&A - AI-Powered Document Analysis',
  description: 'Upload documents and get instant AI-powered answers to your questions. Analyze PDFs, contracts, papers, and more with intelligent document Q&A.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}

