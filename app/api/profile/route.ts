import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile, initializeDatabase } from '@/lib/turso';

// プロフィール情報を取得
export async function GET() {
  try {
    // データベースを初期化（初回のみ）
    await initializeDatabase();
    
    const profile = await getProfile();
    
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
    const profileData = await request.json();
    
    // 必要なフィールドをチェック
    const { name, email, phone, country_code, bio } = profileData;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const success = await updateProfile({
      name,
      email,
      phone: phone || '',
      country_code: country_code || '+81',
      bio: bio || ''
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // 更新後のプロフィールを返す
    const updatedProfile = await getProfile();
    return NextResponse.json(updatedProfile);
    
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
