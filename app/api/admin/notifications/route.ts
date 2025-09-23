import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/turso';
import { initializeDatabase } from '@/lib/turso';

// 管理者用：通知を作成
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { userId, title, message, type } = await request.json();
    
    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      );
    }
    
    const notificationId = await createNotification(
      userId, 
      title, 
      message, 
      type || 'info'
    );
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      notificationId
    });
    
  } catch (error) {
    console.error('POST /api/admin/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
