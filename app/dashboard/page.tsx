'use client';

import { motion } from 'framer-motion';
import { useTaskStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ModernHeader from '@/components/ModernHeader';
import DashboardWidgets from '@/components/DashboardWidgets';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import AddTaskForm from '@/components/AddTaskForm';
import SettingsView from '@/components/SettingsView';

export default function DashboardPage() {
  const { currentView, isDarkMode, setView } = useTaskStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  // URLパラメータに基づいてビューを設定
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'settings' || tab === 'language') {
      setView('settings');
    } else {
      setView('dashboard');
    }
  }, [searchParams, setView]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N でタスク追加（詳細フォーム）
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (typeof window !== 'undefined' && (window as any).openTaskForm) {
          (window as any).openTaskForm();
        }
      }

      // Escapeでメニューを閉じる
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderCurrentView = () => {
    console.log('Current view:', currentView);
    switch (currentView) {
      case 'dashboard':
        return <DashboardWidgets />;
      case 'list':
        return <TaskList />;
      case 'kanban':
        return <TaskList />; // Simplified for MVP
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
