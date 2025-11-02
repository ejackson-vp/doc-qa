import { ImageResponse } from 'next/og';
// eslint-disable-next-line @next/next/no-img-element
import React from 'react';

export const runtime = 'edge';

export async function GET() {
  const width = 1200;
  const height = 630;
  const primary = '#2563eb';
  const secondary = '#7c3aed';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.15), transparent)',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            padding: 64,
            borderRadius: 32,
            background: '#ffffff',
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.3)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '80px',
                borderRadius: '4px',
                border: '5px solid white',
                borderBottom: '8px solid white',
              }}
            />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: -3,
                color: '#0f172a',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                lineHeight: 1.1,
              }}
            >
              DocQA
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 600,
                color: '#475569',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                marginTop: 4,
              }}
            >
              Chat with your documents using AI
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 24,
                color: '#64748b',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 500,
              }}
            >
              Powered by a Voltage Park AI Factory
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
