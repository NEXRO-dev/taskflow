'use client';

import { useState } from 'react';
import { useTaskStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { CheckCircle, Clock, AlertCircle, Calendar, List } from 'lucide-react';

export default function TaskList() {
  const { getAllItems } = useTaskStore();
  const items = getAllItems(); // タスクと予定の両方

  console.log('TaskList rendered, total items:', items.length, items);

  // タスクと予定を分離
  const tasks = items.filter(item => item.type === 'task');
  const events = items.filter(item => item.type === 'event');
  
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
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    
    // 今日の日付を正規化（時間を00:00:00に設定）
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const taskDateNormalized = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    
    // 今日より前の日付のみを期限切れとする（今日は含まない）
    return taskDateNormalized < todayNormalized && !task.completed;
  });

  // 今日の予定
  const todayEvents = events.filter(event => {
    if (!event.dueDate) return false;
    const today = new Date();
    const eventDate = new Date(event.dueDate);
    return eventDate.toDateString() === today.toDateString();
  });

  // 今後の予定
  const upcomingEvents = events.filter(event => {
    if (!event.dueDate) return false;
    const today = new Date();
    const eventDate = new Date(event.dueDate);
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const eventDateNormalized = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return eventDateNormalized >= todayNormalized;
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            タスクや予定がありません
          </h3>
          <p className="text-gray-600 mb-6">
            新しいタスクや予定を追加して始めましょう
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).openTaskForm) {
                (window as any).openTaskForm();
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            最初のアイテムを作成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">タスク・予定</h1>
        <p className="text-gray-600">すべてのタスクと予定を管理</p>
      </div>

      {/* 左右分割レイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：予定 */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">予定</h2>
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                {events.length}件
              </span>
            </div>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">予定がありません</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 今日の予定 */}
                {todayEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      今日の予定
                    </h3>
                    <div className="space-y-3">
                      {todayEvents.map((event, index) => (
                        <TaskCard key={event.id} task={event} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 今後の予定 */}
                {upcomingEvents.filter(event => !todayEvents.includes(event)).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      今後の予定
                    </h3>
                    <div className="space-y-3">
                      {upcomingEvents.filter(event => !todayEvents.includes(event)).map((event, index) => (
                        <TaskCard key={event.id} task={event} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右側：タスク */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">タスク</h2>
              </div>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                {tasks.length}件
              </span>
            </div>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">タスクがありません</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 期限切れタスク */}
                {overdueTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      期限切れ ({overdueTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {overdueTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 今日のタスク */}
                {todayTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <Clock className="h-4 w-4 mr-2" />
                      今日期限 ({todayTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {todayTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* その他の未完了タスク */}
                {pendingTasks.filter(task => !overdueTasks.includes(task) && !todayTasks.includes(task)).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                      未完了
                    </h3>
                    <div className="space-y-3">
                      {pendingTasks.filter(task => !overdueTasks.includes(task) && !todayTasks.includes(task)).map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 完了済みタスク */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center sticky top-0 bg-white pb-2 -mt-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      完了済み ({completedTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}