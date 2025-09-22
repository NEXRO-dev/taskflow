'use client';

import { useTaskStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function TaskList() {
  const { tasks } = useTaskStore();

  console.log('TaskList rendered, total tasks:', tasks.length, tasks);

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  console.log('Pending tasks:', pendingTasks.length, 'Completed tasks:', completedTasks.length);
  
  const todayTasks = pendingTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  const overdueTasks = pendingTasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && !task.completed;
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            タスクがありません
          </h3>
          <p className="text-gray-600 mb-6">
            新しいタスクを追加して始めましょう
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).openTaskForm) {
                (window as any).openTaskForm();
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            最初のタスクを作成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overdueTasks.length > 0 && (
          <div className="glass rounded-xl p-4 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">期限切れ</p>
                <p className="text-lg font-bold text-red-900">{overdueTasks.length}件</p>
              </div>
            </div>
          </div>
        )}

        {todayTasks.length > 0 && (
          <div className="glass rounded-xl p-4 border-l-4 border-amber-500">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-700">今日期限</p>
                <p className="text-lg font-bold text-amber-900">{todayTasks.length}件</p>
              </div>
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="glass rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700">完了</p>
                <p className="text-lg font-bold text-green-900">{completedTasks.length}件</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-red-700 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>期限切れタスク</span>
            </h2>
            <div className="space-y-3">
              {overdueTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-amber-700 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>今日期限のタスク</span>
            </h2>
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.filter(task => !todayTasks.includes(task) && !overdueTasks.includes(task)).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">今後のタスク</h2>
            <div className="space-y-3">
              {pendingTasks
                .filter(task => !todayTasks.includes(task) && !overdueTasks.includes(task))
                .map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-green-700 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>完了済みタスク</span>
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}