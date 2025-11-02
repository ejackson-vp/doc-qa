import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import ThemeRegistry from './components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Doc Q&A – Agentic RAG Demo',
  description: 'Try an Agentic RAG demo: upload a PDF and get grounded, instant answers. Built with a Voltage Park AI Factory for speed, security, and control.',
  metadataBase: new URL('https://doc-qa.com'),
  alternates: {
    canonical: 'https://doc-qa.com',
  },
  keywords: [
    'Agentic RAG',
    'RAG demo',
    'document Q&A',
    'AI Factory',
    'Voltage Park',
    'retrieval augmented generation',
    'PDF question answering',
  ],
  openGraph: {
    title: 'Doc Q&A – Agentic RAG Demo',
    description:
      'Upload a PDF and experience Agentic RAG: grounded, instant answers built with a Voltage Park AI Factory for speed, security, and control.',
    url: 'https://doc-qa.com',
    siteName: 'Doc Q&A',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Doc Q&A – Agentic RAG Demo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doc Q&A – Agentic RAG Demo',
    description:
      'Upload a PDF and experience Agentic RAG: grounded, instant answers built with a Voltage Park AI Factory for speed, security, and control.',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Doc Q&A – Agentic RAG Demo',
              url: 'https://doc-qa.com',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'Try an Agentic RAG demo: upload a PDF and get grounded, instant answers. Built with a Voltage Park AI Factory for speed, security, and control.',
              provider: {
                '@type': 'Organization',
                name: 'Voltage Park',
                url: 'https://www.voltagepark.com',
              },
            }),
          }}
        />
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

