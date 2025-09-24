import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { securityMonitor } from '@/lib/security-monitor';

// セキュリティ統計を取得（管理者用）
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    // TODO: 管理者権限のチェックを実装
    // const isAdmin = await checkAdminPermissions(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const stats = securityMonitor.getSecurityStats();
    const recentEvents = securityMonitor.getRecentEvents(20);

    return NextResponse.json({
      stats,
      recentEvents: recentEvents.map(event => ({
        ...event,
        // IP アドレスの一部をマスク
        ip: event.ip.replace(/\.\d+$/, '.***')
      }))
    });

  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Failed to get security data' },
      { status: 500 }
    );
  }
}

// IPアドレスのブロック解除（管理者用）
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    // TODO: 管理者権限のチェックを実装
    
    const { ip } = await request.json();
    
    if (!ip) {
      return NextResponse.json({ error: 'IP address required' }, { status: 400 });
    }

    const success = securityMonitor.unblockIP(ip);
    
    if (success) {
      return NextResponse.json({ message: 'IP unblocked successfully' });
    } else {
      return NextResponse.json({ error: 'IP not found in blocked list' }, { status: 404 });
    }

  } catch (error) {
    console.error('Security unblock error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock IP' },
      { status: 500 }
    );
  }
}
