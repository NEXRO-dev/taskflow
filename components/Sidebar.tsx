'use client';

// import { motion } from 'framer-motion'; // Removed animations
import { useTaskStore } from '@/lib/store';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import packageJson from '../package.json';
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
  Trash2,
  MessageSquare
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
  { icon: CheckSquare, label: 'タスク・予定', href: '/tasks', view: 'list', plan: 'Free' },
  { icon: Calendar, label: 'カレンダー', href: '/calendar', view: 'calendar', plan: 'Free' },
  { icon: BarChart3, label: '分析', href: '/analytics', view: 'analytics', plan: 'Pro' },
  { icon: Target, label: '目標', href: '/goals', view: 'goals', plan: 'Pro' },
  { icon: FolderOpen, label: 'プロジェクト', href: '/projects', view: 'projects', plan: 'Team' },
  { icon: Users, label: 'チーム', href: '/team', view: 'team', plan: 'Team' },
];

const bottomNavItems = [
  { icon: Settings, label: '設定', href: '/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ isOpen = true, onClose, onCollapseChange }: SidebarProps) {
  const { currentView, setView, userStats, clearAllTasks, isDarkMode } = useTaskStore();
  const { user } = useUser();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReleaseDate, setShowReleaseDate] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    country_code: '+81',
    plan: 'Free' // 本番環境：全ユーザーをFreeプランに制限
  });

  // プランに基づいて機能を表示するかどうかを判定
  const isFeatureAvailable = (requiredPlan: string) => {
    const planHierarchy = ['Free', 'Pro', 'Team', 'Business'];
    const userPlanIndex = planHierarchy.indexOf(profile.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    return userPlanIndex >= requiredPlanIndex;
  };

  // Clerkのユーザー情報を設定
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || user.firstName || 'ユーザー',
        email: user.primaryEmailAddress?.emailAddress || '',
        country_code: '+81',
        plan: 'Free' // 本番環境：全ユーザーをFreeプランに制限
      });
    }
  }, [user]);

  const handleClearAllTasks = () => {
    if (window.confirm('本当に全てのタスクを削除しますか？この操作は元に戻せません。')) {
      clearAllTasks();
    }
  };

  // ナビゲーションアイテムクリック時の処理
  const handleNavClick = (view: 'dashboard' | 'list' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'kanban' | 'settings') => {
    setView(view);
    // 設定画面以外に移動する場合はURLをクリア
    if (view !== 'settings') {
      router.replace('/dashboard');
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
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 ${
        isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
      }`}>
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FlowCraft</h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>for Business</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => {
            const newCollapsed = !isCollapsed;
            setIsCollapsed(newCollapsed);
            onCollapseChange?.(newCollapsed);
          }}
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
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          {user?.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
              <Image 
                src={user.imageUrl} 
                alt={profile.name || 'ユーザー'} 
                width={40}
                height={40}
                className="w-full h-full object-cover aspect-square"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={profile.name || 'ユーザー'}>
                {profile.name || 'ユーザー'}
              </h3>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{profile.plan} Plan</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
        <button 
          onClick={() => {
            // グローバル関数を使用してタスク追加フォームを開く
            if (typeof window !== 'undefined' && (window as any).openTaskForm) {
              (window as any).openTaskForm();
            }
          }}
          className={`w-full ${isCollapsed ? 'p-2' : 'px-4 py-2'} bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center ${isCollapsed ? '' : 'space-x-2'}`}
          title={isCollapsed ? '新しいタスク' : ''}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>新しいタスク</span>}
        </button>
        
        {/* 全タスク削除ボタン（タスク画面のみ表示） */}
        {currentView === 'list' && (
          <button 
            onClick={handleClearAllTasks}
            className={`w-full ${isCollapsed ? 'p-2' : 'px-4 py-2'} bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center ${isCollapsed ? '' : 'space-x-2'}`}
            title={isCollapsed ? '全てのタスクを削除' : ''}
          >
            <Trash2 className="h-4 w-4" />
            {!isCollapsed && <span>全てのタスクを削除</span>}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isAvailable = isFeatureAvailable(item.plan);
          return (
            <button
              key={item.view}
              onClick={() => {
                if (isAvailable) {
                  handleNavClick(item.view as 'dashboard' | 'list' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'kanban' | 'settings');
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

      {/* Version Info */}
      {!isCollapsed && (
        <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`rounded-lg p-3 text-center ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              FlowCraft
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              v{packageJson.version} <span 
                className="bg-green-400 text-gray-900 px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-green-500 transition-colors"
                onClick={() => setShowReleaseDate(!showReleaseDate)}
                title="クリックで正式リリース予定日を表示"
              >β版</span>
            </div>
            {showReleaseDate && (
              <div className={`text-xs mt-2 px-2 py-1 rounded ${
                isDarkMode 
                  ? 'bg-blue-900 text-blue-200 border border-blue-700' 
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                🚀 正式リリース予定: 2025/10/05
              </div>
            )}
            <button
              onClick={() => window.open('https://forms.gle/your-feedback-form-url', '_blank')}
              className={`w-full mt-3 flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 hover:text-white border border-gray-500' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>フィードバック</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
        {bottomNavItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setView('settings')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'} rounded-lg text-sm font-medium transition-all ${
              currentView === 'settings'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title={isCollapsed ? item.label : ''}
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
