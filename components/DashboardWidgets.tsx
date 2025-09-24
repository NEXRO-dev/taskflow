'use client';

import { useTaskStore } from '@/lib/store';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target,
  Zap,
  Calendar,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Star,
  CalendarDays,
  ListTodo
} from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';


export default function DashboardWidgets() {
  const { getUserTasks, getUserEvents, userStats, setView } = useTaskStore();
  const tasks = getUserTasks();
  const events = getUserEvents();

  console.log('DashboardWidgets rendered, total tasks:', tasks.length, tasks);
  
  
  // 緊急デバッグ: 常に何かを表示する
  if (!tasks) {
    console.log('Tasks is null or undefined');
    return <div className="p-6 bg-white rounded-xl">Loading...</div>;
  }

  // Statistics calculations
  const totalTasks = tasks.length;
  const totalEvents = events.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const todayTasks = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length;
  const todayEvents = events.filter(e => e.dueDate && isToday(new Date(e.dueDate))).length;
  const overdueTasks = tasks.filter(t => {
    if (!t.completed && t.dueDate) {
      const today = new Date();
      const taskDate = new Date(t.dueDate);
      
      // 日付を正規化（時間を00:00:00に設定）
      const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const taskDateNormalized = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      
      return taskDateNormalized < todayNormalized;
    }
    return false;
  }).length;
  const weeklyTasks = tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate))).length;
  const monthlyCompleted = tasks.filter(t => t.completed && t.createdAt && isThisMonth(new Date(t.createdAt))).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statsCards = [
    {
      title: '今日のタスク',
      value: todayTasks,
      icon: CheckCircle,
      color: 'blue',
      action: () => setView('list')
    },
    {
      title: '期限切れ',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'red',
      action: () => setView('list')
    },
    {
      title: '今日の予定',
      value: todayEvents,
      icon: Calendar,
      color: 'green',
      action: () => setView('calendar')
    },
    {
      title: '今週のタスク',
      value: weeklyTasks,
      icon: CalendarDays,
      color: 'purple',
      action: () => setView('list')
    }
  ];

  const recentTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 10); // 表示数を10個に増加

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
      
        {statsCards.map((stat, index) => (
          <div
            key={stat.title}
            onClick={stat.action}
            className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-${stat.color}-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">
                {stat.title === '今日のタスク' && todayTasks > 0 && `今日期限: ${todayTasks}件`}
                {stat.title === '期限切れ' && overdueTasks > 0 && '要対応'}
                {stat.title === '今日の予定' && todayEvents > 0 && '本日スケジュール'}
                {stat.title === '今週のタスク' && weeklyTasks > 0 && '今週期限'}
                {stat.value === 0 && 'なし'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div 
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">進捗概要</h3>
              <p className="text-sm text-gray-600">タスクの完了状況</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
              <div className="text-sm text-gray-600">全体完了率</div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* 今日の進捗 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">今日のタスク</span>
                <span className="text-sm text-gray-600">
                  {tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.completed).length} / {todayTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${todayTasks > 0 ? (tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.completed).length / todayTasks) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {todayTasks > 0 ? `${Math.round((tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.completed).length / todayTasks) * 100)}%` : '0%'} 完了
              </div>
            </div>

            {/* 今週の進捗 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">今週のタスク</span>
                <span className="text-sm text-gray-600">
                  {tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)) && t.completed).length} / {weeklyTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${weeklyTasks > 0 ? (tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)) && t.completed).length / weeklyTasks) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {weeklyTasks > 0 ? `${Math.round((tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)) && t.completed).length / weeklyTasks) * 100)}%` : '0%'} 完了
              </div>
            </div>

            {/* 全体の進捗 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">全体のタスク</span>
                <span className="text-sm text-gray-600">
                  {completedTasks} / {totalTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completionRate}% 完了
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div 
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">直近のタスク</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">タスクがありません</p>
              </div>
            ) : (
              recentTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(task.dueDate), 'MM/dd')}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">+{task.xpValue}pt</div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setView('list')}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              タスク一覧を見る →
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">今日の概要</h3>
            <p className="text-gray-600">
              {todayTasks > 0 ? `今日は${todayTasks}個のタスクがあります` : '今日のタスクはすべて完了しています'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-sm text-gray-600">{completedTasks}件完了</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-sm text-gray-600">{pendingTasks}件進行中</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

