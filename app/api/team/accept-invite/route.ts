import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, email, role, token } = body;

    // バリデーション
    if (!teamId || !email || !role || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // トークンの検証
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
      const { teamId: tokenTeamId, email: tokenEmail, role: tokenRole, timestamp } = decoded;
      
      // トークンの整合性チェック
      if (tokenTeamId !== teamId || tokenEmail !== email || tokenRole !== role) {
        return NextResponse.json(
          { error: 'Invalid invitation token' }, 
          { status: 400 }
        );
      }
      
      // 有効期限チェック（7日間）
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > sevenDaysInMs) {
        return NextResponse.json(
          { error: 'Invitation has expired' }, 
          { status: 400 }
        );
      }
    } catch (tokenError) {
      return NextResponse.json(
        { error: 'Invalid invitation token' }, 
        { status: 400 }
      );
    }

    // 実際の実装では、ここでZustandストアまたはデータベースに
    // チームメンバーとして追加する処理を行います
    
    // 現在は簡単な成功レスポンスを返します
    // 実際の実装では以下のような処理が必要です：
    // 1. チームが存在するかチェック
    // 2. ユーザーが既にメンバーでないかチェック
    // 3. チームにメンバーとして追加
    // 4. 招待ステータスを「accepted」に更新
    // 5. チームアクティビティログに記録

    console.log(`User ${userId} accepted invitation to team ${teamId} as ${role}`);

    return NextResponse.json({ 
      success: true, 
      message: 'チームに正常に参加しました',
      teamId,
      role
    });

  } catch (error) {
    console.error('Failed to accept invitation:', error);
    return NextResponse.json(
      { error: '招待の受け入れに失敗しました' },
      { status: 500 }
    );
  }
}
