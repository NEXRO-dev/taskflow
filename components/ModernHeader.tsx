'use client';

// import { motion, AnimatePresence } from 'framer-motion'; // Removed animations
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  Search, 
  Bell, 
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Keyboard,
  Mail,
  X
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useTaskStore } from '@/lib/store';
import SearchResults from './SearchResults';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
}

export default function ModernHeader({ onMenuToggle }: ModernHeaderProps) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { setView } = useTaskStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpScreen, setHelpScreen] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // 検索機能
  const {
    query,
    searchResults,
    suggestions,
    searchStats,
    isSearching,
    performSearch,
    clearSearch,
    setQuery,
  } = useSearch();
  const [profile, setProfile] = useState({
    name: '田中太郎',
    email: 'tanaka@example.com',
    country_code: '+81',
    plan: 'Free' // 本番環境：全ユーザーをFreeプランに制限
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // 検索結果のクリック処理
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'task') {
      setView('list');
    } else if (result.type === 'event') {
      setView('calendar'); // 予定はカレンダー画面に移動
    } else if (result.type === 'project') {
      setView('projects');
    }
    setShowSearchResults(false);
    clearSearch();
  };

  // 検索入力の処理
  const handleSearchInput = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setShowSearchResults(true);
      performSearch(value);
    } else {
      setShowSearchResults(false);
    }
  };

  // 検索のクリア
  const handleClearSearch = () => {
    clearSearch();
    setShowSearchResults(false);
  };

  // キーボードショートカットの実装
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + キーの組み合わせをチェック
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            // 新しいタスク作成（実装予定）
            console.log('新しいタスクを作成');
            break;
          case 'k':
            event.preventDefault();
            // 検索フィールドにフォーカス
            const searchInput = document.querySelector('input[placeholder*="検索"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'd':
            event.preventDefault();
            // ダッシュボードに戻る
            router.push('/dashboard');
            break;
          case ',':
            event.preventDefault();
            // 設定を開く
            router.push('/dashboard?tab=settings');
            break;
          case '?':
            event.preventDefault();
            // ヘルプを開く
            setShowHelp(true);
            setHelpScreen('guide');
            break;
        }
      }
      
      // Escapeキーでヘルプや検索を閉じる
      if (event.key === 'Escape') {
        if (showSearchResults) {
          setShowSearchResults(false);
        } else if (helpScreen) {
          setHelpScreen(null);
        } else if (showHelp) {
          setShowHelp(false);
        }
      }
    };

    // イベントリスナーを追加
    document.addEventListener('keydown', handleKeyDown);

    // クリーンアップ
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, helpScreen, showHelp]);

  // 通知データを取得
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const userId = user?.id || 'default_user';
      const response = await fetch(`/api/notifications?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // 通知を既読にする
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // ローカル状態を更新
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // すべての通知を既読にする
  const markAllAsRead = async () => {
    try {
      const userId = user?.id || 'default_user';
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 通知を取得
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // プロフィール情報を取得
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

  // ヘルプ機能
  const handleHelp = () => {
    setShowHelp(!showHelp);
    setHelpScreen(null);
  };

  // ヘルプ項目のクリック処理
  const handleHelpItemClick = (screen: string) => {
    setHelpScreen(screen);
  };

  // ヘルプ画面を閉じる
  const handleCloseHelpScreen = () => {
    setHelpScreen(null);
  };

  // ヘルプ画面のレンダリング
  const renderHelpScreen = () => {
    if (!helpScreen) return null;

    const screens = {
      guide: {
        title: '使い方ガイド',
        icon: <BookOpen className="h-6 w-6 text-blue-600" />,
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">基本操作</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ダッシュボードでタスクの概要を確認</li>
                <li>• サイドバーから各機能にアクセス</li>
                <li>• 検索バーでタスクやプロジェクトを検索</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">タスク管理</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 新しいタスクを作成</li>
                <li>• タスクの優先度を設定</li>
                <li>• 期限とリマインダーを設定</li>
              </ul>
            </div>
          </div>
        )
      },
      faq: {
        title: 'よくある質問',
        icon: <MessageCircle className="h-6 w-6 text-green-600" />,
        content: (
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Q: タスクを削除するには？</h4>
              <p className="text-sm text-gray-600">A: タスク一覧で削除したいタスクの右側にある削除ボタンをクリックしてください。</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Q: プロフィールを変更するには？</h4>
              <p className="text-sm text-gray-600">A: 右上のプロフィールアイコンをクリックし、「設定」からプロフィールを編集できます。</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Q: データは安全ですか？</h4>
              <p className="text-sm text-gray-600">A: はい、すべてのデータは暗号化され、安全に保存されています。</p>
            </div>
          </div>
        )
      },
      shortcuts: {
        title: 'キーボードショートカット',
        icon: <Keyboard className="h-6 w-6 text-purple-600" />,
        content: (
          <div className="space-y-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2 text-sm">Windows / Linux</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">新しいタスクを作成</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl + N</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">検索を開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl + K</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">ダッシュボードに戻る</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl + D</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">設定を開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl + ,</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">ヘルプを開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl + ?</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Mac</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">新しいタスクを作成</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘ + N</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">検索を開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘ + K</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">ダッシュボードに戻る</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘ + D</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">設定を開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘ + ,</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">ヘルプを開く</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘ + ?</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">共通ショートカット</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">ヘルプを閉じる</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Escape</kbd>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">タスクを完了/未完了</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Space</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">タスクを削除</span>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Delete</kbd>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-700">すべて選択</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">Ctrl</kbd>
                      <span className="text-xs text-gray-500">/</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">⌘</kbd>
                      <span className="text-xs text-gray-500">+</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-xs rounded">A</kbd>
                    </div>
                    <span className="text-xs text-orange-600">準備中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      contact: {
        title: 'お問い合わせ',
        icon: <Mail className="h-6 w-6 text-orange-600" />,
        content: (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">サポートチームに連絡</h4>
              <p className="text-sm text-orange-800 mb-3">お困りのことがございましたら、お気軽にお問い合わせください。</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">support@taskflow.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">24時間以内に回答いたします</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">よくある問題</h4>
              <p className="text-sm text-gray-600">まずは上記の「よくある質問」をご確認ください。解決しない場合は、お問い合わせください。</p>
            </div>
          </div>
        )
      }
    };

    const screen = screens[helpScreen as keyof typeof screens];
    if (!screen) return null;

    return (
      <div className="help-dropdown absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center space-x-3">
          <button 
            onClick={handleCloseHelpScreen}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            {screen.icon}
            <h3 className="font-semibold text-gray-900 text-sm">{screen.title}</h3>
          </div>
        </div>
        
        <div className="px-4 py-4">
          {screen.content}
        </div>
      </div>
    );
  };

  // クリック外しでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.help-dropdown') && !target.closest('[data-help-button]')) {
        setShowHelp(false);
      }
      if (!target.closest('.profile-dropdown') && !target.closest('[data-profile-button]')) {
        setShowProfileMenu(false);
      }
      if (!target.closest('.notification-dropdown') && !target.closest('[data-notification-button]')) {
        setShowNotifications(false);
      }
      // 検索結果のクリック外し処理
      if (!target.closest('.search-container') && !target.closest('input[placeholder*="検索"]')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
            <div className="relative search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="タスクやプロジェクトを検索..."
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => query.trim() && setShowSearchResults(true)}
                className="pl-10 pr-10 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* 検索結果 */}
              <SearchResults
                results={searchResults}
                onResultClick={handleSearchResultClick}
                onClose={() => setShowSearchResults(false)}
                isVisible={showSearchResults}
                query={query}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={handleHelp}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="ヘルプ"
              data-help-button
            >
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-notification-button
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
                  <div className="notification-dropdown absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">通知</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      すべて既読
                    </button>
                  )}
                </div>
                
                {loadingNotifications ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">読み込み中...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">通知はありません</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="px-4 py-2 border-t border-gray-200">
                  <button 
                    onClick={fetchNotifications}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    更新
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
              data-profile-button
            >
            {user?.imageUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                <Image 
                  src={user.imageUrl} 
                  alt={profile.name || 'ユーザー'} 
                  width={32}
                  height={32}
                  className="w-full h-full object-cover aspect-square"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{getInitial(profile.name)}</span>
              </div>
            )}
              <div className="hidden md:block text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32" title={profile.name}>
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500">{profile.plan || 'Team'} Plan</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="profile-dropdown absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-start space-x-3">
                    {user?.imageUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image 
                          src={user.imageUrl} 
                          alt={profile.name || 'ユーザー'} 
                          width={48}
                          height={48}
                          className="w-full h-full object-cover aspect-square"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-base">{getInitial(profile.name)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate" title={profile.name}>
                        {profile.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1" title={profile.email}>
                        {profile.email}
                      </p>
                    </div>
                  </div>
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

          {/* Help Dropdown */}
          {showHelp && !helpScreen && (
            <div className="help-dropdown absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">ヘルプ & サポート</h3>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => handleHelpItemClick('guide')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>使い方ガイド</span>
                </button>
                <button 
                  onClick={() => handleHelpItemClick('faq')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>よくある質問</span>
                </button>
                <button 
                  onClick={() => handleHelpItemClick('shortcuts')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>キーボードショートカット</span>
                </button>
                <button 
                  onClick={() => handleHelpItemClick('contact')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>お問い合わせ</span>
                </button>
              </div>
            </div>
          )}

          {/* Help Screen */}
          {helpScreen && renderHelpScreen()}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4">
        <div className="relative search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="検索..."
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => query.trim() && setShowSearchResults(true)}
            className="pl-10 pr-10 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* モバイル検索結果 */}
          <SearchResults
            results={searchResults}
            onResultClick={handleSearchResultClick}
            onClose={() => setShowSearchResults(false)}
            isVisible={showSearchResults}
            query={query}
          />
        </div>
      </div>
    </header>
  );
}
