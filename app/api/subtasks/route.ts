import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSubtask, SubtaskData } from '@/lib/turso';

// POST: 新しいサブタスクを作成
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const subtaskData: SubtaskData = {
      ...body
    };

    const subtaskId = await createSubtask(subtaskData);
    if (!subtaskId) {
      return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
    }

    return NextResponse.json({ id: subtaskId, message: 'Subtask created successfully' });
  } catch (error) {
    console.error('Failed to create subtask:', error);
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
  }
}
