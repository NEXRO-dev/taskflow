import { useState, useEffect } from 'react';
import PremiumGate from './PremiumGate';
import { 
  PlusIcon, 
  TrophyIcon, 
  ArrowPathIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface KeyResult {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'team' | 'project';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  startDate: Date;
  targetDate: Date;
  keyResults: KeyResult[];
  createdAt: Date;
}

const GOAL_CATEGORIES = {
  personal: { label: '個人目標', color: 'bg-blue-500', textColor: 'text-blue-700' },
  team: { label: 'チーム目標', color: 'bg-green-500', textColor: 'text-green-700' },
  project: { label: 'プロジェクト目標', color: 'bg-purple-500', textColor: 'text-purple-700' },
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    // サンプル目標データ
    const sampleGoals: Goal[] = [
      {
        id: '1',
        title: 'Q4売上目標達成',
        description: '第4四半期の売上目標1000万円を達成する',
        category: 'team',
        priority: 'high',
        status: 'active',
        progress: 75,
        startDate: new Date('2025-10-01'),
        targetDate: new Date('2025-12-31'),
        keyResults: [
          {
            id: '1-1',
            title: '新規顧客獲得',
            currentValue: 45,
            targetValue: 60,
            unit: '社',
            progress: 75,
          },
          {
            id: '1-2',
            title: '平均受注単価',
            currentValue: 150,
            targetValue: 200,
            unit: '万円',
            progress: 75,
          },
          {
            id: '1-3',
            title: 'リピート率',
            currentValue: 65,
            targetValue: 80,
            unit: '%',
            progress: 81,
          },
        ],
        createdAt: new Date('2025-09-15'),
      },
      {
        id: '2',
        title: 'スキルアップ計画',
        description: 'React・TypeScriptの習得とポートフォリオ充実',
        category: 'personal',
        priority: 'medium',
        status: 'active',
        progress: 60,
        startDate: new Date('2025-09-01'),
        targetDate: new Date('2026-03-31'),
        keyResults: [
          {
            id: '2-1',
            title: 'オンライン講座修了',
            currentValue: 3,
            targetValue: 5,
            unit: 'コース',
            progress: 60,
          },
          {
            id: '2-2',
            title: 'GitHub貢献',
            currentValue: 120,
            targetValue: 200,
            unit: 'コミット',
            progress: 60,
          },
        ],
        createdAt: new Date('2025-08-25'),
      },
      {
        id: '3',
        title: 'Webサイトリニューアル',
        description: 'コーポレートサイトの完全リニューアルプロジェクト',
        category: 'project',
        priority: 'high',
        status: 'completed',
        progress: 100,
        startDate: new Date('2025-06-01'),
        targetDate: new Date('2025-09-30'),
        keyResults: [
          {
            id: '3-1',
            title: 'ページ数',
            currentValue: 25,
            targetValue: 25,
            unit: 'ページ',
            progress: 100,
          },
          {
            id: '3-2',
            title: 'パフォーマンススコア',
            currentValue: 95,
            targetValue: 90,
            unit: '点',
            progress: 100,
          },
        ],
        createdAt: new Date('2025-05-15'),
      },
    ];
    setGoals(sampleGoals);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return goal.status === 'completed';
    return goal.status === 'active';
  });

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'paused':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ArrowPathIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysRemaining = (targetDate: Date) => {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">目標管理</h1>
          <p className="text-gray-600 mt-2">OKR形式で目標を設定し、進捗を追跡しましょう</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          新しい目標
        </button>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">完了した目標</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">進行中の目標</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均進捗率</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length || 0)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今月期限</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => {
                  const now = new Date();
                  return g.targetDate.getMonth() === now.getMonth() && 
                         g.targetDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'active', label: '進行中', count: goals.filter(g => g.status === 'active').length },
          { key: 'completed', label: '完了', count: goals.filter(g => g.status === 'completed').length },
          { key: 'all', label: 'すべて', count: goals.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* 目標一覧 */}
      <div className="space-y-6">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* 目標ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center">
                    {getStatusIcon(goal.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${GOAL_CATEGORIES[goal.category].color} text-white`}>
                        {GOAL_CATEGORIES[goal.category].label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[goal.priority]}`}>
                        {goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="text-gray-600">{goal.description}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 進捗バーとメタ情報 */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">進捗</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>開始: {goal.startDate.toLocaleDateString('ja-JP')}</span>
                  <span>
                    期限: {goal.targetDate.toLocaleDateString('ja-JP')} 
                    {goal.status !== 'completed' && (
                      <span className={`ml-2 ${getDaysRemaining(goal.targetDate) < 7 ? 'text-red-600' : 'text-gray-500'}`}>
                        (残り{getDaysRemaining(goal.targetDate)}日)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* キーリザルト */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">キーリザルト</h4>
                <div className="space-y-3">
                  {goal.keyResults.map((kr) => (
                    <div key={kr.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">{kr.title}</span>
                        <span className="text-sm text-gray-600">
                          {kr.currentValue} / {kr.targetValue} {kr.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(kr.progress)}`}
                          style={{ width: `${kr.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {kr.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">目標がありません</h3>
          <p className="text-gray-600 mb-6">新しい目標を設定して成長を追跡しましょう</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            最初の目標を作成
          </button>
        </div>
      )}
    </div>
  );
}

export default function GoalsView() {
  return (
    <PremiumGate featureName="goals">
      <GoalsContent />
    </PremiumGate>
  );
}
