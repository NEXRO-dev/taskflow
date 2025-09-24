import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile, initializeDatabase } from '@/lib/turso';
import { auth, currentUser } from '@clerk/nextjs/server';
import { validateAndSanitizeProfile } from '@/lib/validation';

// プロフィール情報を取得
export async function GET() {
  try {
    // データベースを初期化（初回のみ）
    await initializeDatabase();
    
    // ClerkからユーザーIDを取得
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    const profile = await getProfile(userId);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' }, 
      { status: 500 }
    );
  }
}

// プロフィール情報を更新
export async function PUT(request: NextRequest) {
  try {
    // ClerkからユーザーIDを取得
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    const rawData = await request.json();
    
    // 入力検証とサニタイゼーション
    let sanitizedData;
    try {
      sanitizedData = validateAndSanitizeProfile(rawData);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: (validationError as Error).message },
        { status: 400 }
      );
    }

    const success = await updateProfile(userId, sanitizedData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // 更新後のプロフィールを返す
    const updatedProfile = await getProfile(userId);
    return NextResponse.json(updatedProfile);
    
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
