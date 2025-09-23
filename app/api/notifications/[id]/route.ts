import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/turso';
import { initializeDatabase } from '@/lib/turso';

// 個別の通知を既読にする
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    
    const notificationId = parseInt(params.id);
    
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }
    
    const success = await markNotificationAsRead(notificationId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('PUT /api/notifications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
