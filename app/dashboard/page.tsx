'use client';

import { useTaskStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ModernHeader from '@/components/ModernHeader';
import DashboardWidgets from '@/components/DashboardWidgets';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import AddTaskForm from '@/components/AddTaskForm';
import SettingsView from '@/components/SettingsView';

export default function DashboardPage() {
  const { currentView, isDarkMode, setView, setCurrentUserId } = useTaskStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  // 認証チェックとユーザーID設定
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && isSignedIn && user) {
      setCurrentUserId(user.id);
    }
  }, [isLoaded, isSignedIn, user, router, setCurrentUserId]);

  // キーボードショートカット
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (typeof window !== 'undefined' && (window as any).openTaskForm) {
          (window as any).openTaskForm();
        }
      }

      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoaded, isSignedIn]);

  // ローディング状態
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

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!isSignedIn) {
    return null;
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
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">プロジェクト管理</h2>
            <p className="text-gray-600">プロジェクト機能は開発中です</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">分析</h2>
            <p className="text-gray-600">分析機能は開発中です</p>
          </div>
        );
      case 'goals':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">目標設定</h2>
            <p className="text-gray-600">目標設定機能は開発中です</p>
          </div>
        );
      case 'team':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">チーム管理</h2>
            <p className="text-gray-600">チーム管理機能は開発中です</p>
          </div>
        );
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardWidgets />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-72">
        <ModernHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          <div className="opacity-100">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      <AddTaskForm />
    </div>
  );
}