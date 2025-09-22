'use client';

// import { motion } from 'framer-motion'; // Removed animations
import { useTaskStore } from '@/lib/store';
import Link from 'next/link';
import { 
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Users,
  FolderOpen,
  Target,
  Zap,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';

// プロフィール情報の型定義
interface Profile {
  name: string;
  email: string;
  country_code: string;
  plan: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'ダッシュボード', href: '/dashboard', view: 'dashboard', plan: 'Free' },
  { icon: CheckSquare, label: 'タスク', href: '/tasks', view: 'list', plan: 'Free' },
  { icon: Calendar, label: 'カレンダー', href: '/calendar', view: 'calendar', plan: 'Free' },
  { icon: FolderOpen, label: 'プロジェクト', href: '/projects', view: 'projects', plan: 'Pro' },
  { icon: BarChart3, label: '分析', href: '/analytics', view: 'analytics', plan: 'Pro' },
  { icon: Target, label: '目標', href: '/goals', view: 'goals', plan: 'Pro' },
  { icon: Users, label: 'チーム', href: '/team', view: 'team', plan: 'Team' },
];

const bottomNavItems = [
  { icon: Settings, label: '設定', href: '/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { currentView, setView, userStats, clearAllTasks, isDarkMode } = useTaskStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: '田中太郎',
    email: 'tanaka@example.com',
    country_code: '+81',
    plan: 'Free'
  });

  // プランに基づいて機能を表示するかどうかを判定
  const isFeatureAvailable = (requiredPlan: string) => {
    const planHierarchy = ['Free', 'Pro', 'Team', 'Business'];
    const userPlanIndex = planHierarchy.indexOf(profile.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    return userPlanIndex >= requiredPlanIndex;
  };

  // プロフィール情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name || '田中太郎',
            email: data.email || 'tanaka@example.com',
            country_code: data.country_code || '+81',
            plan: data.plan || 'Free'
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();

    // プロフィール更新イベントを監視
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleClearAllTasks = () => {
    if (window.confirm('本当に全てのタスクを削除しますか？この操作は元に戻せません。')) {
      clearAllTasks();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 shadow-sm z-40 flex-col transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-r border-gray-700' 
            : 'bg-white border-r border-gray-200'
        } ${isCollapsed ? 'w-20' : 'w-70'}`}
      >
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 ${
        isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
      }`}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TaskFlow</h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Business</p>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{profile.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h3>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{profile.plan} Plan</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button 
            onClick={() => {
              // グローバル関数を使用してタスク追加フォームを開く
              if (typeof window !== 'undefined' && (window as any).openTaskForm) {
                (window as any).openTaskForm();
              }
            }}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>新しいタスク</span>
          </button>
          
          {/* 全タスク削除ボタン（タスク画面のみ表示） */}
          {currentView === 'list' && (
            <button 
              onClick={handleClearAllTasks}
              className="w-full bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>全てのタスクを削除</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isAvailable = isFeatureAvailable(item.plan);
          return (
            <button
              key={item.view}
              onClick={() => {
                if (isAvailable) {
                  setView(item.view as any);
                } else {
                  // アップグレードが必要な場合の処理
                  alert(`${item.label}機能は${item.plan}プラン以上でご利用いただけます。`);
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAvailable
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : currentView === item.view
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              disabled={!isAvailable}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {!isAvailable && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {item.plan}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {bottomNavItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setView('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'settings'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </aside>
    </>
  );
}
