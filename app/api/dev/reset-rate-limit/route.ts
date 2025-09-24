import { NextResponse } from 'next/server';
import { resetRateLimits } from '@/lib/rate-limit';

// 開発環境でのみ使用可能なRate Limitリセット機能
export async function POST() {
  // 開発環境でのみ許可
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    resetRateLimits();
    
    return NextResponse.json({
      message: 'Rate limits have been reset successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Rate limit reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    );
  }
}
