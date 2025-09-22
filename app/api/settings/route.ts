import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, initializeDatabase } from '@/lib/turso';

// 設定情報を取得
export async function GET() {
  try {
    // データベースを初期化（初回のみ）
    await initializeDatabase();
    
    const settings = await getSettings();
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' }, 
      { status: 500 }
    );
  }
}

// 設定情報を更新
export async function PUT(request: NextRequest) {
  try {
    const settingsData = await request.json();
    
    // 有効な設定フィールドのみを抽出
    const validFields = ['dark_mode', 'email_notifications', 'push_notifications', 'task_reminders', 'weekly_report', 'language'];
    const filteredSettings: any = {};
    
    for (const field of validFields) {
      if (field in settingsData) {
        filteredSettings[field] = settingsData[field];
      }
    }

    if (Object.keys(filteredSettings).length === 0) {
      return NextResponse.json(
        { error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    const success = await updateSettings(filteredSettings);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // 更新後の設定を返す
    const updatedSettings = await getSettings();
    return NextResponse.json(updatedSettings);
    
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
