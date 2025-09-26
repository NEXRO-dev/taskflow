'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface InviteData {
  teamId: string;
  teamName?: string;
  email: string;
  role: string;
  timestamp: number;
  valid: boolean;
  error?: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.token) {
      decodeInviteToken(params.token as string);
    }
  }, [params.token]);

  const decodeInviteToken = (token: string) => {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
      const { teamId, email, role, timestamp } = decoded;
      
      // 7日間の有効期限チェック
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const isValid = Date.now() - timestamp < sevenDaysInMs;
      
      setInviteData({
        teamId,
        email,
        role,
        timestamp,
        valid: isValid,
        error: isValid ? undefined : '招待の有効期限が切れています'
      });
    } catch (err) {
      setInviteData({
        teamId: '',
        email: '',
        role: '',
        timestamp: 0,
        valid: false,
        error: '無効な招待リンクです'
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!inviteData || !user) return;

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: inviteData.teamId,
          email: inviteData.email,
          role: inviteData.role,
          token: params.token
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAccepted(true);
        // 3秒後にダッシュボードにリダイレクト
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(result.error || '招待の受け入れに失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setAccepting(false);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'owner': return 'オーナー';
      case 'admin': return '管理者';
      case 'member': return 'メンバー';
      case 'viewer': return '閲覧者';
      default: return 'メンバー';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">招待を確認中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <UsersIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">
            チーム招待を受け入れるには、まずログインしてください。
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待が見つかりません</h1>
          <p className="text-gray-600">
            無効な招待リンクです。
          </p>
        </div>
      </div>
    );
  }

  if (!inviteData.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待の有効期限切れ</h1>
          <p className="text-gray-600 mb-6">
            {inviteData.error}
          </p>
          <p className="text-sm text-gray-500">
            チーム管理者に再招待を依頼してください。
          </p>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">チーム参加完了！</h1>
          <p className="text-gray-600 mb-6">
            チームに正常に参加しました。
          </p>
          <p className="text-sm text-gray-500">
            まもなくダッシュボードに移動します...
          </p>
        </div>
      </div>
    );
  }

  // メールアドレスのマッチング確認
  const emailMatches = user.primaryEmailAddress?.emailAddress === inviteData.email;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <UsersIcon className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">チーム招待</h1>
        </div>

        {/* コンテンツ */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">招待詳細</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">招待されたメール:</span>
                <span className="text-sm font-medium">{inviteData.email}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">役割:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(inviteData.role)}`}>
                  {getRoleDisplayName(inviteData.role)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">有効期限:</span>
                <span className="text-sm text-gray-500">
                  {new Date(inviteData.timestamp + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>

          {!emailMatches && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">メールアドレスが一致しません</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    招待されたメールアドレス（{inviteData.email}）と現在ログインしているアカウント（{user.primaryEmailAddress?.emailAddress}）が異なります。
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={acceptInvitation}
              disabled={accepting || !emailMatches}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                emailMatches 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {accepting ? '参加中...' : 'チームに参加する'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
