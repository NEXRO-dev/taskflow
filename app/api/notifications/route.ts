import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markAllNotificationsAsRead, getUnreadNotificationCount } from '@/lib/turso';
import { initializeDatabase } from '@/lib/turso';

// 通知を取得
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default_user';
    
    const notifications = await getNotifications(userId);
    const unreadCount = await getUnreadNotificationCount(userId);
    
    return NextResponse.json({
      notifications,
      unreadCount
    });
    
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// すべての通知を既読にする
export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { userId } = await request.json();
    const targetUserId = userId || 'default_user';
    
    const success = await markAllNotificationsAsRead(targetUserId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark notifications as read' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
