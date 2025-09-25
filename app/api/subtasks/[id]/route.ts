import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateSubtask, deleteSubtask } from '@/lib/turso';

// PUT: サブタスクを更新
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
    const updates = {
      title: body.title,
      completed: body.completed
    };

    const success = await updateSubtask(params.id, updates);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subtask updated successfully' });
  } catch (error) {
    console.error('Failed to update subtask:', error);
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

// DELETE: サブタスクを削除
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

    const success = await deleteSubtask(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Failed to delete subtask:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
