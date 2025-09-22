'use client';

import { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion'; // Removed animations
import { useTaskStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon,
  Mail,
  Phone,
  Camera,
  Key,
  ChevronDown,
  CreditCard,
  Check,
  Crown,
  Star,
  Zap
} from 'lucide-react';

// Animations removed for better performance

export default function SettingsView() {
  const { isDarkMode, toggleDarkMode } = useTaskStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    weeklyReport: false
  });
  const [profile, setProfile] = useState({
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '90-1234-5678',
    countryCode: '+81',
    bio: 'プロジェクトマネージャーとして働いています。効率的なタスク管理を心がけています。'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [subscription, setSubscription] = useState({
    plan: 'Free',
    status: 'active',
    nextBillingDate: '2024-02-01',
    usage: {
      tasks: 150,
      taskLimit: 100,
      storage: 2.5,
      storageLimit: 5
    }
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウンの外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // URLパラメータに基づいてタブを設定
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    } else if (tab === 'settings') {
      setActiveTab('notifications');
    } else if (tab === 'language') {
      setActiveTab('language');
    }
  }, [searchParams]);

  // データベースからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // プロフィール情報を読み込み
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile({
            name: profileData.name || '田中太郎',
            email: profileData.email || 'tanaka@example.com',
            phone: profileData.phone || '90-1234-5678',
            countryCode: profileData.country_code || '+81',
            bio: profileData.bio || 'プロジェクトマネージャーとして働いています。効率的なタスク管理を心がけています。'
          });
        }

        // 設定情報を読み込み
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setNotifications({
            email: settingsData.email_notifications ?? true,
            push: settingsData.push_notifications ?? true,
            taskReminders: settingsData.task_reminders ?? true,
            weeklyReport: settingsData.weekly_report ?? false
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const countryCodes = [
    { code: '+81', country: '日本', flag: '🇯🇵' },
    { code: '+1', country: 'アメリカ', flag: '🇺🇸' },
    { code: '+82', country: '韓国', flag: '🇰🇷' },
    { code: '+86', country: '中国', flag: '🇨🇳' },
    { code: '+44', country: 'イギリス', flag: '🇬🇧' },
    { code: '+33', country: 'フランス', flag: '🇫🇷' },
    { code: '+49', country: 'ドイツ', flag: '🇩🇪' },
    { code: '+91', country: 'インド', flag: '🇮🇳' }
  ];

  const tabs = [
    { id: 'profile', label: 'プロフィール', icon: User },
    { id: 'subscription', label: 'サブスクリプション', icon: CreditCard },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'appearance', label: '外観', icon: Moon },
    { id: 'language', label: '言語', icon: Globe },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'data', label: 'データ管理', icon: Download }
  ];

  const handleNotificationChange = async (key: string) => {
    const newValue = !notifications[key as keyof typeof notifications];
    
    // UIを即座に更新
    setNotifications(prev => ({
      ...prev,
      [key]: newValue
    }));

    // データベースに保存
    try {
      const settingsKey = key === 'email' ? 'email_notifications' :
                          key === 'push' ? 'push_notifications' :
                          key === 'taskReminders' ? 'task_reminders' :
                          key === 'weeklyReport' ? 'weekly_report' : key;

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [settingsKey]: newValue
        })
      });

      if (!response.ok) {
        // 失敗した場合は元に戻す
        setNotifications(prev => ({
          ...prev,
          [key]: !newValue
        }));
        console.error('Failed to save notification setting');
        alert('設定の保存に失敗しました');
      }
    } catch (error) {
      // エラーが発生した場合は元に戻す
      setNotifications(prev => ({
        ...prev,
        [key]: !newValue
      }));
      console.error('Error saving notification setting:', error);
      alert('エラーが発生しました');
    }
  };

  const handleProfileUpdate = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCountryCodeChange = (code: string) => {
    setProfile(prev => ({
      ...prev,
      countryCode: code
    }));
    setShowCountryDropdown(false);
  };

  const getSelectedCountry = () => {
    return countryCodes.find(country => country.code === profile.countryCode) || countryCodes[0];
  };

  // サブスクリプションプランのデータ
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '',
      features: [
        'タスク管理 (最大100件)',
        '基本的なカレンダー表示',
        '5GBストレージ',
        'メール通知'
      ],
      taskLimit: 100,
      storageLimit: 5,
      icon: User,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 980,
      period: '月',
      features: [
        'タスク管理 (無制限)',
        '高度なカレンダー機能',
        '50GBストレージ',
        'プッシュ通知',
        'チームコラボレーション',
        '詳細なレポート'
      ],
      taskLimit: -1, // 無制限
      storageLimit: 50,
      icon: Star,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2980,
      period: '月',
      features: [
        'すべてのPro機能',
        '無制限ストレージ',
        '優先サポート',
        'SSO認証',
        'API アクセス',
        'カスタム統合'
      ],
      taskLimit: -1,
      storageLimit: -1,
      icon: Crown,
      popular: false
    }
  ];

  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setSubscription(prev => ({
        ...prev,
        plan: selectedPlan.name
      }));
      
      // 実際のプラン変更処理をここに実装
      alert(`${selectedPlan.name}プランに変更しました！`);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          country_code: profile.countryCode,
          bio: profile.bio
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('Profile saved successfully:', updatedProfile);
        
        // プロフィール更新イベントを発生
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: updatedProfile
        }));
        
        // 成功メッセージを表示（オプション）
        alert('プロフィールが保存されました！');
      } else {
        console.error('Failed to save profile');
        alert('プロフィールの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    // データエクスポート処理
    console.log('Exporting data...');
    // TODO: 実際のエクスポート処理を実装
  };

  const handleImportData = () => {
    // データインポート処理
    console.log('Importing data...');
    // TODO: 実際のインポート処理を実装
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-2xl">田</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-gray-600">{profile.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Pro Plan</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  />
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <div className="flex space-x-2">
                  {/* 国コード選択 */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center space-x-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white min-w-[120px]"
                    >
                      <span className="text-lg">{getSelectedCountry().flag}</span>
                      <span className="text-sm font-medium">({getSelectedCountry().code})</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    {/* ドロップダウンメニュー */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountryCodeChange(country.code)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                              profile.countryCode === country.code ? 'bg-gray-100' : ''
                            }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm font-medium">({country.code})</span>
                            <span className="text-sm text-gray-600">{country.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 電話番号入力 */}
                  <div className="flex-1 relative min-w-[200px]">
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      placeholder="90-1234-5678"
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-base"
                    />
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                placeholder="自己紹介を入力してください..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                <Save className="h-4 w-4" />
                <span>{saving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            {/* 現在のプラン */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">現在のプラン</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{subscription.plan} Plan</h4>
                    <p className="text-gray-500">ステータス: {subscription.status}</p>
                  </div>
                </div>
                {subscription.plan !== 'Free' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">次回請求日</p>
                    <p className="font-semibold">{subscription.nextBillingDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 使用状況 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用状況</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">タスク</span>
                    <span className="text-sm text-gray-500">
                      {subscription.usage.tasks} / {subscription.usage.taskLimit === -1 ? '無制限' : subscription.usage.taskLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subscription.usage.tasks > subscription.usage.taskLimit 
                          ? 'bg-red-500' 
                          : 'bg-gray-900'
                      }`}
                      style={{ 
                        width: subscription.usage.taskLimit === -1 
                          ? '20%' 
                          : `${Math.min((subscription.usage.tasks / subscription.usage.taskLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">ストレージ</span>
                    <span className="text-sm text-gray-500">
                      {subscription.usage.storage}GB / {subscription.usage.storageLimit === -1 ? '無制限' : `${subscription.usage.storageLimit}GB`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-900 h-2 rounded-full"
                      style={{ 
                        width: subscription.usage.storageLimit === -1 
                          ? '10%' 
                          : `${Math.min((subscription.usage.storage / subscription.usage.storageLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* プラン選択 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">プランを選択</h3>
              
              <div className="space-y-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = subscription.plan === plan.name;
                  
        return (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 transition-all duration-300 ${
              plan.popular
                ? 'border-blue-500 bg-blue-50'
                : isCurrentPlan
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
                      <div className="p-4 md:p-6">
                        {/* モバイル：縦並び、デスクトップ：横並び */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                          {/* プラン情報 */}
                          <div className="flex items-center space-x-3 md:space-x-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              plan.popular 
                                ? 'bg-blue-100' 
                                : isCurrentPlan 
                                  ? 'bg-green-100' 
                                  : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-5 w-5 md:h-6 md:w-6 ${
                                plan.popular 
                                  ? 'text-blue-600' 
                                  : isCurrentPlan 
                                    ? 'text-green-600' 
                                    : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h4 className="text-lg md:text-xl font-bold text-gray-900">{plan.name}</h4>
                                {plan.popular && (
                                  <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                                    人気
                                  </span>
                                )}
                                {isCurrentPlan && (
                                  <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                                    利用中
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline space-x-1 mt-1">
                                <span className="text-xl md:text-2xl font-bold text-gray-900">
                                  ¥{plan.price.toLocaleString()}
                                </span>
                                {plan.period && (
                                  <span className="text-sm text-gray-500">/{plan.period}</span>
                                )}
                              </div>
                              {/* モバイル用：基本機能を価格の下に表示 */}
                              <div className="mt-2 md:hidden space-y-1 text-sm text-gray-600">
                                <div>タスク: {plan.taskLimit === -1 ? '無制限' : `${plan.taskLimit}件`}</div>
                                <div>ストレージ: {plan.storageLimit === -1 ? '無制限' : `${plan.storageLimit}GB`}</div>
                              </div>
                            </div>
                          </div>

                          {/* デスクトップ用：右側に機能とボタン */}
                          <div className="hidden md:block text-right">
                            <div className="mb-4 space-y-1 text-sm text-gray-600">
                              <div>タスク: {plan.taskLimit === -1 ? '無制限' : `${plan.taskLimit}件`}</div>
                              <div>ストレージ: {plan.storageLimit === -1 ? '無制限' : `${plan.storageLimit}GB`}</div>
                            </div>
                            <button
                              onClick={() => !isCurrentPlan && handlePlanChange(plan.id)}
                              disabled={isCurrentPlan}
                              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                isCurrentPlan
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : plan.popular
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              {isCurrentPlan ? '利用中' : '選択'}
                            </button>
                          </div>

                          {/* モバイル用：ボタンを下部に配置 */}
                          <div className="md:hidden">
                            <button
                              onClick={() => !isCurrentPlan && handlePlanChange(plan.id)}
                              disabled={isCurrentPlan}
                              className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                                isCurrentPlan
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : plan.popular
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              {isCurrentPlan ? '現在利用中' : `${plan.name}プランを選択`}
                            </button>
                          </div>
                        </div>

                        {/* 機能詳細（展開可能） */}
                        {plan.features.length > 2 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              {plan.features.slice(2).map((feature, index) => (
                                <div key={index} className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 補足情報 */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">安心してお使いいただけます</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        いつでもプランの変更・解約が可能
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        アップグレード時は即座に機能が利用可能
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        30日間の返金保証付き（有料プラン）
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">メール通知</h4>
                    <p className="text-sm text-gray-600">重要な更新をメールで受け取ります</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">プッシュ通知</h4>
                    <p className="text-sm text-gray-600">ブラウザでのプッシュ通知を受け取ります</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">タスクリマインダー</h4>
                    <p className="text-sm text-gray-600">期限が近いタスクの通知を受け取ります</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('taskReminders')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.taskReminders ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.taskReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">週次レポート</h4>
                    <p className="text-sm text-gray-600">週単位の進捗レポートを受け取ります</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weeklyReport')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.weeklyReport ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">外観設定</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">テーマ</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => !isDarkMode || toggleDarkMode()}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        !isDarkMode
                          ? 'border-gray-900 bg-white'
                          : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                      <div className="text-sm font-medium text-gray-900">ライトモード</div>
                    </button>
                    <button
                      onClick={() => isDarkMode || toggleDarkMode()}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isDarkMode
                          ? 'border-gray-900 bg-gray-800 text-white'
                          : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <Moon className={`h-6 w-6 mx-auto mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ダークモード</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">言語設定</h3>
              <div className="space-y-3">
                {[
                  { code: 'ja', name: '日本語', flag: '🇯🇵' },
                  { code: 'en', name: 'English', flag: '🇺🇸' },
                  { code: 'ko', name: '한국어', flag: '🇰🇷' },
                  { code: 'zh', name: '中文', flag: '🇨🇳' }
                ].map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <span className="font-medium text-gray-900">{language.name}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      language.code === 'ja' ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                    }`}>
                      {language.code === 'ja' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">セキュリティ設定</h3>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">パスワード変更</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">現在のパスワード</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">パスワード確認</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>パスワードを更新</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">二要素認証</h4>
                  <p className="text-sm text-gray-600 mb-3">アカウントのセキュリティを向上させるために二要素認証を設定できます。</p>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    二要素認証を設定
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">データ管理</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">データエクスポート</h4>
                  <p className="text-sm text-gray-600 mb-3">すべてのタスクデータをJSONファイルとしてダウンロードできます。</p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>データをエクスポート</span>
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">データインポート</h4>
                  <p className="text-sm text-gray-600 mb-3">以前にエクスポートしたJSONファイルからデータを復元できます。</p>
                  <button
                    onClick={handleImportData}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>データをインポート</span>
                  </button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">危険な操作</h4>
                  <p className="text-sm text-red-700 mb-3">以下の操作は元に戻すことができません。慎重に実行してください。</p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>すべてのデータを削除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
      
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="h-6 w-6 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
          {/* Settings Navigation */}
          <div className="lg:w-1/4 flex-shrink-0">
            <nav className="space-y-2 lg:sticky lg:top-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:w-3/4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="pr-2">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
