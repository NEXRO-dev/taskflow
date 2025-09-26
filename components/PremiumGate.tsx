import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { LockClosedIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';

interface PremiumGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

const FEATURE_CONFIG = {
  projects: {
    title: 'プロジェクト管理',
    description: 'チームでタスクをプロジェクト別に整理し、進捗を共有できます',
    icon: UsersIcon,
    requiredPlan: 'Team',
  },
  analytics: {
    title: '詳細分析・レポート',
    description: '個人の生産性パターンと詳細な統計を確認できます',
    icon: StarIcon,
    requiredPlan: 'Pro',
  },
  goals: {
    title: '個人目標・習慣管理',
    description: '長期目標の設定と習慣形成をサポートします',
    icon: StarIcon,
    requiredPlan: 'Pro',
  },
  team: {
    title: 'チーム機能',
    description: 'チームメンバーとの協働とコラボレーション機能です',
    icon: UsersIcon,
    requiredPlan: 'Team',
  },
};

export default function PremiumGate({ featureName, children, fallback }: PremiumGateProps) {
  const { 
    canAccessProjects, 
    canAccessAnalytics, 
    canAccessGoals, 
    canAccessTeam, 
    getUpgradeMessage,
    subscription 
  } = useSubscription();

  // featureNameから対応する設定を取得
  const getFeatureKey = (name: string): keyof typeof FEATURE_CONFIG | null => {
    if (!name || typeof name !== 'string') return null;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('プロジェクト') || lowerName.includes('project')) return 'projects';
    if (lowerName.includes('分析') || lowerName.includes('analytics')) return 'analytics';
    if (lowerName.includes('目標') || lowerName.includes('goal')) return 'goals';
    if (lowerName.includes('チーム') || lowerName.includes('team')) return 'team';
    return null;
  };

  const featureKey = getFeatureKey(featureName);
  const config = featureKey ? FEATURE_CONFIG[featureKey] : null;
  const IconComponent = config?.icon || StarIcon;

  // 機能へのアクセス権限をチェック
  const hasAccess = (() => {
    if (!featureKey) return true; // 不明な機能は許可
    switch (featureKey) {
      case 'projects': return canAccessProjects();
      case 'analytics': return canAccessAnalytics();
      case 'goals': return canAccessGoals();
      case 'team': return canAccessTeam();
      default: return false;
    }
  })();

  if (hasAccess) {
    return <>{children}</>;
  }

  // カスタムフォールバックが提供されている場合はそれを使用
  if (fallback) {
    return <>{fallback}</>;
  }

  // デフォルトのアップグレード促進UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
          <LockClosedIcon className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {config?.title || featureName}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {config?.description || `${featureName}機能をご利用いただくには、プランのアップグレードが必要です。`}
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              {config?.requiredPlan || 'Pro'}プラン以上で利用可能
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {getUpgradeMessage(config?.title || featureName)}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard?tab=subscription'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            プランをアップグレード
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
          >
            戻る
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            現在のプラン: <span className="font-medium capitalize">{subscription.plan}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
