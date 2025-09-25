import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateTask, deleteTask, TaskData } from '@/lib/turso';

// PUT: タスク・予定を更新
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const taskData: Partial<TaskData> = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const success = await updateTask(params.id, taskData);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: タスク・予定を削除
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await deleteTask(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
