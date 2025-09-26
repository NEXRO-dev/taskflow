import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export type SubscriptionPlan = 'free' | 'pro' | 'team';

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt?: Date;
  features: {
    maxProjects: number;
    maxTeamMembers: number;
    analyticsAccess: boolean;
    goalsAccess: boolean;
    teamCollaboration: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
  };
}

// プランごとの機能制限
const PLAN_FEATURES = {
  free: {
    maxProjects: 0,
    maxTeamMembers: 1,
    analyticsAccess: false,
    goalsAccess: false,
    timeTrackingAccess: false,
    advancedFiltersAccess: false,
    teamCollaboration: false,
    advancedReports: false,
    prioritySupport: false,
  },
  pro: {
    maxProjects: 0, // プロジェクト管理はTeamプランのみ
    maxTeamMembers: 1,
    analyticsAccess: true, // 詳細分析・レポート
    goalsAccess: true, // 個人目標・習慣管理
    timeTrackingAccess: true, // タイムトラッキング
    advancedFiltersAccess: true, // 高度な検索・フィルター
    teamCollaboration: false,
    advancedReports: true,
    prioritySupport: true,
  },
  team: {
    maxProjects: 50, // プロジェクト管理はTeamプランの主力機能
    maxTeamMembers: 20,
    analyticsAccess: true,
    goalsAccess: true,
    timeTrackingAccess: true,
    advancedFiltersAccess: true,
    teamCollaboration: true, // チーム協働機能
    advancedReports: true,
    prioritySupport: true,
  },
};

export function useSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    plan: 'free',
    isActive: true,
    features: PLAN_FEATURES.free,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    loadSubscriptionStatus();
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      
      // TODO: 実際のサブスクリプションAPIを呼び出す
      // 現在はモックデータを使用
      
      // Clerkのユーザーメタデータからプラン情報を取得
      const planFromMetadata = user?.publicMetadata?.plan as SubscriptionPlan || 'free';
      
      // 本番環境設定：全ユーザーをFreeプランに制限
      const currentPlan: SubscriptionPlan = 'free'; // 全ユーザーをFreeプランに制限
      
      const subscriptionData: SubscriptionStatus = {
        plan: currentPlan,
        isActive: true,
        expiresAt: currentPlan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30日後
        features: PLAN_FEATURES[currentPlan],
      };

      setSubscription(subscriptionData);
      console.log('🎯 Subscription Status:', {
        plan: currentPlan,
        features: subscriptionData.features,
        canAccessProjects: subscriptionData.features.maxProjects > 0,
        canAccessAnalytics: subscriptionData.features.analyticsAccess,
        canAccessGoals: subscriptionData.features.goalsAccess,
        canAccessTeam: subscriptionData.features.teamCollaboration
      });
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      // エラー時はフリープランにフォールバック
      setSubscription({
        plan: 'free',
        isActive: true,
        features: PLAN_FEATURES.free,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: keyof typeof PLAN_FEATURES.free): boolean => {
    return subscription.features[feature] as boolean;
  };

  const canAccessProjects = (): boolean => {
    return subscription.plan !== 'free' || subscription.features.maxProjects > 0;
  };

  const canAccessAnalytics = (): boolean => {
    return hasFeature('analyticsAccess');
  };

  const canAccessGoals = (): boolean => {
    return hasFeature('goalsAccess');
  };

  const canAccessTeam = (): boolean => {
    return hasFeature('teamCollaboration');
  };

  const getUpgradeMessage = (feature: string): string => {
    const { plan } = subscription;
    
    if (plan === 'free') {
      return `${feature}機能を利用するにはProプランまたはTeamプランにアップグレードしてください。`;
    }
    
    if (plan === 'pro') {
      return `この機能はTeamプラン限定です。Teamプランにアップグレードしてください。`;
    }
    
    return '利用可能な機能です。';
  };

  return {
    subscription,
    isLoading,
    hasFeature,
    canAccessProjects,
    canAccessAnalytics,
    canAccessGoals,
    canAccessTeam,
    getUpgradeMessage,
    refresh: loadSubscriptionStatus,
  };
}

export default useSubscription;
