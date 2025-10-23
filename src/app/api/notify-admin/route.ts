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
  } catch (error: any) {
    console.error('Admin notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', message: error.message },
      { status: 500 }
    );
  }
}
