import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendTeamInvitationEmail, sendInvitationConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, teamId, teamName, inviterName, role } = body;

    // バリデーション
    if (!email || !teamId || !teamName || !inviterName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // 招待URL生成（実際のアプリURLに変更してください）
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteToken = generateInviteToken(teamId, email, role);
    const inviteUrl = `${appUrl}/invite/${inviteToken}`;

    // 招待メール送信
    await sendTeamInvitationEmail({
      to: email,
      teamName,
      inviterName,
      inviteUrl,
      role
    });

    // 招待者への確認メール送信（オプション）
    try {
      // 実際の実装では、userIdから招待者のメールアドレスを取得
      const inviterEmail = 'inviter@example.com'; // 実際にはデータベースから取得
      await sendInvitationConfirmationEmail({
        to: inviterEmail,
        teamName,
        invitedEmail: email,
        role
      });
    } catch (confirmationError) {
      console.warn('Failed to send confirmation email:', confirmationError);
      // 確認メールの失敗はメインの処理に影響しない
    }

    return NextResponse.json({ 
      success: true, 
      message: '招待メールを送信しました',
      inviteUrl // デバッグ用（本番では削除）
    });

  } catch (error) {
    console.error('Failed to send invitation:', error);
    
    // エラーの種類に応じて適切なレスポンスを返す
    if (error instanceof Error) {
      if (error.message.includes('メール送信に失敗')) {
        return NextResponse.json(
          { error: 'メール送信に失敗しました。しばらく後に再試行してください。' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: '招待の送信に失敗しました' },
      { status: 500 }
    );
  }
}

// 招待トークン生成
function generateInviteToken(teamId: string, email: string, role: string): string {
  // 実際の実装では、JWTやより安全な方法を使用
  const data = {
    teamId,
    email,
    role,
    timestamp: Date.now(),
    // セキュリティのため、実際にはランダムなソルトを追加
    nonce: Math.random().toString(36).substr(2, 9)
  };
  
  // Base64エンコード（実際にはJWT等を使用してください）
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}
