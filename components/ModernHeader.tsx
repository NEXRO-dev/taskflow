'use client';

// import { motion, AnimatePresence } from 'framer-motion'; // Removed animations
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  ChevronDown,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  LogOut,
  Menu
} from 'lucide-react';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
}

export default function ModernHeader({ onMenuToggle }: ModernHeaderProps) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState({
    name: '田中太郎',
    email: 'tanaka@example.com',
    country_code: '+81',
    plan: 'Free'
  });

  const notifications = [
    { id: 1, title: 'タスクが完了しました', time: '2分前', unread: true },
    { id: 2, title: '新しいチームメンバーが参加', time: '1時間前', unread: true },
    { id: 3, title: 'プロジェクト期限が近づいています', time: '3時間前', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // プロフィール情報を取得
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || user.firstName || 'ユーザー',
        email: user.primaryEmailAddress?.emailAddress || '',
        country_code: '+81',
        plan: 'Free'
      });
    }
  }, [user]);

  // 名前の最初の文字を取得（アバター用）
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  // ログアウト機能
  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // プロフィール機能
  const handleProfile = () => {
    setShowProfileMenu(false);
    // プロフィールページに移動（現在は設定画面のプロフィールタブ）
    router.push('/dashboard?tab=profile');
  };

  // 設定機能
  const handleSettings = () => {
    setShowProfileMenu(false);
    // 設定画面に移動
    router.push('/dashboard?tab=settings');
  };

  // 言語設定機能
  const handleLanguage = () => {
    setShowProfileMenu(false);
    // 言語設定ページに移動（現在は設定画面の言語タブ）
    router.push('/dashboard?tab=language');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
    
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Search */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="タスクやプロジェクトを検索..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Sun className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">通知</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    すべて表示
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{getInitial(profile.name)}</span>
            </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.plan || 'Free'} Plan</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
                
                <div className="py-2">
                  <button 
                    onClick={handleProfile}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <User className="h-4 w-4" />
                    <span>プロフィール</span>
                  </button>
                  <button 
                    onClick={handleSettings}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span>設定</span>
                  </button>
                  <button 
                    onClick={handleLanguage}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Globe className="h-4 w-4" />
                    <span>言語設定</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="検索..."
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>
      </div>
    </header>
  );
}
