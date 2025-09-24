'use client';

import { useState } from 'react';
import { useTaskStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { CheckCircle, Clock, AlertCircle, Calendar, List } from 'lucide-react';

export default function TaskList() {
  const { getAllItems } = useTaskStore();
  const items = getAllItems(); // タスクと予定の両方
  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'events'>('all');

  console.log('TaskList rendered, total items:', items.length, items);

  // フィルターを適用
  const filteredItems = activeFilter === 'all' 
    ? items 
    : activeFilter === 'tasks' 
    ? items.filter(item => item.type === 'task')
    : items.filter(item => item.type === 'event');

  // タスクのみをフィルター（予定は完了概念がないため）
  const tasks = filteredItems.filter(item => item.type === 'task');
  const events = filteredItems.filter(item => item.type === 'event');
  
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
      {/* フィルタータブ */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <List className="h-4 w-4" />
            <span>すべて</span>
          </button>
          <button
            onClick={() => setActiveFilter('tasks')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'tasks'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>タスク</span>
          </button>
          <button
            onClick={() => setActiveFilter('events')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'events'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>予定</span>
          </button>
        </div>
      </div>

      {/* フィルター後のアイテムが0の場合 */}
      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeFilter === 'tasks' ? (
                <CheckCircle className="h-6 w-6 text-gray-400" />
              ) : activeFilter === 'events' ? (
                <Calendar className="h-6 w-6 text-gray-400" />
              ) : (
                <List className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeFilter === 'tasks' 
                ? 'タスクがありません' 
                : activeFilter === 'events' 
                ? '予定がありません' 
                : 'アイテムがありません'}
            </h3>
            <p className="text-gray-600">
              新しい{activeFilter === 'tasks' ? 'タスク' : activeFilter === 'events' ? '予定' : 'アイテム'}を追加してください。
            </p>
          </div>
        </div>
      )}

      {/* タスク・予定の表示 */}
      {filteredItems.length > 0 && (
        <div className="space-y-4">
          {/* 統計カード */}
          {(overdueTasks.length > 0 || todayTasks.length > 0 || completedTasks.length > 0) && (
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
          )}

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

            {/* Today's Events */}
            {todayEvents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>今日の予定</span>
                </h2>
                <div className="space-y-3">
                  {todayEvents.map((event, index) => (
                    <TaskCard key={event.id} task={event} index={index} />
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

            {/* Upcoming Events */}
            {upcomingEvents.filter(event => !todayEvents.includes(event)).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-blue-700">今後の予定</h2>
                <div className="space-y-3">
                  {upcomingEvents
                    .filter(event => !todayEvents.includes(event))
                    .sort((a, b) => {
                      if (!a.dueDate && !b.dueDate) return 0;
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    })
                    .map((event, index) => (
                      <TaskCard key={event.id} task={event} index={index} />
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
      )}
    </div>
  );
}