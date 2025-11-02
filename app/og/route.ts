import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const width = 1200;
  const height = 630;
  const primary = '#10b981';
  const secondary = '#14b8a6';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(20, 184, 166, 0.08))`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            padding: 48,
            borderRadius: 24,
            background: '#ffffff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          {/* Simple document icon */}
          <svg width="140" height="140" viewBox="0 0 64 64" fill="none">
            <rect x="10" y="6" width="36" height="52" rx="6" fill={secondary} opacity="0.12" />
            <rect x="14" y="10" width="28" height="44" rx="4" fill="#ffffff" stroke={primary} strokeWidth="2" />
            <rect x="18" y="18" width="20" height="3" rx="1.5" fill={primary} />
            <rect x="18" y="24" width="20" height="3" rx="1.5" fill={primary} opacity="0.6" />
            <rect x="18" y="30" width="16" height="3" rx="1.5" fill={primary} opacity="0.4" />
            <rect x="18" y="36" width="12" height="3" rx="1.5" fill={primary} opacity="0.3" />
          </svg>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: -2,
                color: '#111827',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              }}
            >
              Doc<span style={{ color: primary }}>QA</span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 36,
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              }}
            >
              Agentic RAG Demo
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 24,
                color: '#4b5563',
                fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              }}
            >
              Built with a Voltage Park AI Factory
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
