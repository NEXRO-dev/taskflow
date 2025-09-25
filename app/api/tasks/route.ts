import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getTasks, createTask, TaskData } from '@/lib/turso';

// GET: ユーザーのタスク・予定を取得
export async function GET() {
  try {
    console.log('GET /api/tasks called');
    
    // 一時的にログインチェックを無効化してデバッグ
    let userId = 'debug-user';
    try {
      const authResult = await auth();
      if (authResult && authResult.userId) {
        userId = authResult.userId;
      }
    } catch (authError) {
      console.warn('Auth failed, using debug user:', authError);
    }

    console.log('Using userId:', userId);
    const tasks = await getTasks(userId);
    console.log('Retrieved tasks:', tasks.length);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return NextResponse.json({ 
      error: 'Failed to get tasks', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: 新しいタスク・予定を作成
export async function POST(request: Request) {
  try {
    console.log('POST /api/tasks called');
    
    // 一時的にログインチェックを無効化してデバッグ
    let userId = 'debug-user';
    try {
      const authResult = await auth();
      if (authResult && authResult.userId) {
        userId = authResult.userId;
      }
    } catch (authError) {
      console.warn('Auth failed, using debug user:', authError);
    }

    const body = await request.json();
    const taskData: TaskData = {
      ...body,
      userId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const taskId = await createTask(taskData);
    if (!taskId) {
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({ id: taskId, message: 'Task created successfully' });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
