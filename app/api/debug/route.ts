import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/turso';

// デバッグ用API（認証なし）
export async function GET() {
  try {
    console.log('Debug API called');
    
    // テストデータを返す
    const testTasks = [
      {
        id: 'test-1',
        userId: 'test-user',
        title: 'テストタスク',
        description: 'これはテストです',
        completed: false,
        priority: 'medium',
        type: 'task',
        xpValue: 20,
        createdAt: new Date(),
        subtasks: []
      }
    ];
    
    console.log('Returning test tasks:', testTasks);
    return NextResponse.json({ tasks: testTasks, message: 'Debug API working' });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug API failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
