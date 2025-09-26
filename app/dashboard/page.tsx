'use client';

import { useTaskStore } from '@/lib/store';
import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ModernHeader from '@/components/ModernHeader';
import DashboardWidgets from '@/components/DashboardWidgets';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import AddTaskForm from '@/components/AddTaskForm';
import SettingsView from '@/components/SettingsView';
import ProjectsView from '@/components/ProjectsView';
import AnalyticsView from '@/components/AnalyticsView';
import GoalsView from '@/components/GoalsView';
import TeamView from '@/components/TeamView';
import useAutoSync from '@/hooks/useAutoSync';
import useMigration from '@/hooks/useMigration';
import MigrationModal from '@/components/MigrationModal';

function DashboardContent() {
  const { currentView, isDarkMode, setView, setCurrentUserId, isLoading } = useTaskStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 自動同期フックを使用
  useAutoSync();
  
  // マイグレーション機能を使用
  const { 
    migrationStatus, 
    migrationData, 
    migrateData, 
    skipMigration, 
    hasMigrationData 
  } = useMigration();

  useEffect(() => {
    const enabled = isClerkConfigured();
    
    // Clerkが設定されていない場合は、ローディング状態を表示するのみ
    // リダイレクトはしない（無限ループを防止）
    if (!enabled) {
      console.warn('Clerk is not configured. Please check environment variables.');
      return;
    }
    
    // Clerkが設定されている場合は認証状態をチェック
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn && user) {
      setCurrentUserId(user.id);
    }
  }, [isLoaded, isSignedIn, user, router, setCurrentUserId]);

  // URLパラメータに基づいてビューを設定
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const tab = searchParams.get('tab');
      if (tab) {
        // URLパラメータのtabに基づいてビューを設定
        switch (tab) {
          case 'profile':
          case 'subscription':
          case 'notifications':
          case 'appearance':
          case 'language':
          case 'security':
          case 'data':
          case 'settings':
            setView('settings');
            break;
          case 'dashboard':
            setView('dashboard');
            break;
          case 'list':
            setView('list');
            break;
          case 'calendar':
            setView('calendar');
            break;
          case 'projects':
            setView('projects');
            break;
          case 'analytics':
            setView('analytics');
            break;
          case 'goals':
            setView('goals');
            break;
          case 'team':
            setView('team');
            break;
          default:
            setView('dashboard');
        }
      } else {
        setView('dashboard'); // デフォルトビューを設定
      }
    }
  }, [setView, isLoaded, isSignedIn, searchParams]);

  // ビュー変更時にURLをクリアする機能
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const tab = searchParams.get('tab');
      // 設定関連のタブでない場合、URLパラメータをクリア
      if (currentView !== 'settings' && tab && ['profile', 'subscription', 'notifications', 'appearance', 'language', 'security', 'data', 'settings'].includes(tab)) {
        router.replace('/dashboard');
      }
    }
  }, [currentView, isLoaded, isSignedIn, searchParams, router]);

  // Clerkが未設定の場合は設定エラーを表示
  const enabled = isClerkConfigured();
  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">認証設定エラー</h3>
          <p className="text-gray-600 mb-4">
            Clerkの環境変数が設定されていません。<br />
            開発を続行するには、以下の環境変数を<code className="bg-gray-100 px-1 rounded">.env.local</code>に設定してください：
          </p>
          <div className="bg-gray-100 p-3 rounded text-left text-sm font-mono">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...<br />
            CLERK_SECRET_KEY=sk_test_...
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">認証中...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardWidgets />;
      case 'list':
        return <TaskList />;
      case 'kanban':
        return <TaskList />;
      case 'calendar':
        return <CalendarView />;
      case 'projects':
        return <ProjectsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'goals':
        return <GoalsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardWidgets />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar 
        isOpen={true} 
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <ModernHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6 pb-24">
          <div className="opacity-100">
            {isLoading && (
              <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 border">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">同期中...</span>
                </div>
              </div>
            )}
            {renderCurrentView()}
          </div>
        </main>
      </div>

      <AddTaskForm />
      
      {/* マイグレーションモーダル */}
      <MigrationModal
        isOpen={hasMigrationData && migrationStatus === 'idle'}
        onClose={() => {}}
        onMigrate={migrateData}
        onSkip={skipMigration}
        taskCount={migrationData.length}
        isLoading={migrationStatus === 'migrating'}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
