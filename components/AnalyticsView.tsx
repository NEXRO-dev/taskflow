import { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import PremiumGate from './PremiumGate';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CalendarIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  weeklyProgress: number[];
  topCategories: { name: string; count: number }[];
  productivityScore: number;
  streak: number;
}

function AnalyticsContent() {
  const { getAllItems } = useTaskStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    tasksCompleted: 45,
    totalTasks: 67,
    completionRate: 67,
    averageCompletionTime: 2.3,
    weeklyProgress: [12, 15, 18, 22, 25, 28, 30],
    topCategories: [
      { name: '開発', count: 15 },
      { name: 'デザイン', count: 12 },
      { name: 'ミーティング', count: 8 },
      { name: 'レビュー', count: 6 },
    ],
    productivityScore: 85,
    streak: 7,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // 実際のデータ分析ロジックをここに実装
    // 現在はサンプルデータを使用
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">分析・レポート</h1>
          <p className="text-gray-600 mt-2">あなたの生産性と進捗を詳しく分析します</p>
        </div>
        
        {/* 期間選択 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === 'week' ? '週' : range === 'month' ? '月' : '四半期'}
            </button>
          ))}
        </div>
      </div>

      {/* メイン統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">完了率</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.completionRate}%</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5% 先月比</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">生産性スコア</p>
              <p className={`text-3xl font-bold ${getScoreColor(analytics.productivityScore)}`}>
                {analytics.productivityScore}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">優秀</span>
              </div>
            </div>
            <div className={`p-3 ${getScoreBgColor(analytics.productivityScore)} rounded-lg`}>
              <ChartBarIcon className={`h-8 w-8 ${getScoreColor(analytics.productivityScore)}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均完了時間</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.averageCompletionTime}日</p>
              <div className="flex items-center mt-2">
                <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-0.5日 改善</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">連続達成日数</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.streak}日</p>
              <div className="flex items-center mt-2">
                <CalendarIcon className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">継続中</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 週次進捗グラフ */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">週次進捗</h3>
          <div className="space-y-4">
            {analytics.weeklyProgress.map((value, index) => {
              const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
              const percentage = (value / Math.max(...analytics.weeklyProgress)) * 100;
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-8 text-sm text-gray-600">{dayNames[index]}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium text-gray-900 text-right">{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* トップカテゴリー */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">タスクカテゴリー分析</h3>
          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              const percentage = (category.count / analytics.totalTasks) * 100;
              
              return (
                <div key={category.name} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${colors[index]} mr-3`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-600">{category.count}件</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 詳細レポート */}
        <div className="bg-white rounded-xl p-6 shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">詳細レポート</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {analytics.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600">完了タスク</div>
              <div className="text-xs text-blue-500 mt-1">
                総タスク数: {analytics.totalTasks}
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Math.round(analytics.averageCompletionTime * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">平均完了時間（日）</div>
              <div className="text-xs text-green-500 mt-1">
                前月比 -12%
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {analytics.streak}
              </div>
              <div className="text-sm text-gray-600">連続達成日数</div>
              <div className="text-xs text-purple-500 mt-1">
                過去最高: 14日
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">今月のハイライト</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 完了率が先月比で5%向上しました</li>
              <li>• 平均完了時間が0.5日短縮されました</li>
              <li>• 7日間の連続達成を記録中です</li>
              <li>• 開発カテゴリーのタスクが最も多く完了されています</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  return (
    <PremiumGate feature="analytics">
      <AnalyticsContent />
    </PremiumGate>
  );
}
