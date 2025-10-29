import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification, type EmailNotification } from '@/lib/email';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userEmail, userName, details } = body;

    const notification: EmailNotification = {
      type,
      userEmail,
      userName,
      timestamp: new Date().toISOString(),
      details: details || {},
    };

    await sendAdminNotification(notification);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin notification error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to send notification', message },
      { status: 500 }
    );
  }
}
