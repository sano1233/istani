import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 1200x630 OpenGraph image
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Istani Fitness').slice(0, 80);
  const subtitle = (searchParams.get('subtitle') || 'AI-Powered Plans • Claude + Gemini Ensemble').slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: 'linear-gradient(135deg,#0f172a,#111827)',
          color: 'white',
          padding: '64px',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: -1 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9 }}>{subtitle}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 32, fontSize: 22, opacity: 0.85 }}>
          <span>Personalized Workouts</span>
          <span>•</span>
          <span>Meal Plans</span>
          <span>•</span>
          <span>Safety Guardrails</span>
        </div>
        <div style={{ marginTop: 'auto', fontSize: 22, opacity: 0.8 }}>istani.store</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

