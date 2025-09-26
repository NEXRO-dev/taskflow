import { useState } from 'react';
import PremiumGate from './PremiumGate';
import { useTaskStore } from '@/lib/store';
import type { TeamMember as StoreTeamMember } from '@/lib/store';
import { 
  PlusIcon, 
  UsersIcon, 
  CogIcon, 
  ShieldCheckIcon,
  EnvelopeIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
  tasksCompleted: number;
  projects: string[];
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
}

const ROLE_CONFIG = {
  owner: {
    label: 'オーナー',
    color: 'bg-purple-100 text-purple-800',
    description: 'すべての権限を持ちます',
  },
  admin: {
    label: '管理者',
    color: 'bg-red-100 text-red-800',
    description: 'メンバー管理と設定変更が可能',
  },
  member: {
    label: 'メンバー',
    color: 'bg-blue-100 text-blue-800',
    description: 'プロジェクト参加とタスク管理が可能',
  },
  viewer: {
    label: '閲覧者',
    color: 'bg-gray-100 text-gray-800',
    description: '読み取り専用アクセス',
  },
};

const STATUS_CONFIG = {
  active: { label: 'アクティブ', color: 'text-green-600', icon: CheckCircleIcon },
  pending: { label: '招待中', color: 'text-yellow-600', icon: ClockIcon },
  inactive: { label: '非アクティブ', color: 'text-gray-600', icon: ExclamationTriangleIcon },
};

function TeamContent() {
  const { 
    teams, 
    currentTeamId, 
    teamInvitations, 
    createTeam,
    inviteMember: storeInviteMember,
    removeMember,
    updateMemberRole,
    setCurrentTeam,
    getCurrentTeam
  } = useTaskStore();

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StoreTeamMember['role']>('member');
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'settings'>('members');

  const currentTeam = getCurrentTeam();
  const members = currentTeam?.members || [];
  const invitations = teamInvitations.filter(inv => inv.teamId === currentTeamId && inv.status === 'pending');

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    createTeam({
      name: newTeamName,
      description: newTeamDescription,
      projects: [],
      settings: {
        isPublic: false,
        allowMemberInvites: true,
        defaultProjectVisibility: 'team',
        notifications: {
          projectUpdates: true,
          memberJoined: true,
          taskAssignments: true,
        }
      }
    });

    setNewTeamName('');
    setNewTeamDescription('');
    setShowCreateTeamModal(false);
  };

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeam) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      // メール送信API呼び出し
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          teamId: currentTeam.id,
          teamName: currentTeam.name,
          inviterName: 'Team Owner', // 実際には現在のユーザー名を取得
          role: inviteRole
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Zustandストアにも招待を追加
        storeInviteMember(currentTeam.id, inviteEmail, inviteRole);
        
        setInviteSuccess(true);
        setInviteEmail('');
        setInviteRole('member');
        
        // 3秒後にモーダルを閉じる
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(false);
        }, 3000);
      } else {
        setInviteError(result.error || 'メール送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setInviteError('ネットワークエラーが発生しました');
    } finally {
      setInviteLoading(false);
    }
  };


  const getLastActiveText = (lastActive?: Date) => {
    if (!lastActive) return '未知';
    
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'オンライン';
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return lastActive.toLocaleDateString('ja-JP');
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">チーム管理</h1>
          <p className="text-gray-600 mt-2">
            {currentTeam ? `${currentTeam.name} - ${currentTeam.description}` : 'チームを選択または作成してください'}
          </p>
        </div>
            <div className="flex items-center space-x-3">
              {teams.length > 0 && (
                <select
                  value={currentTeamId || ''}
                  onChange={(e) => setCurrentTeam(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">チームを選択</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
              
              
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                新規チーム
              </button>
              {currentTeam && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  メンバー招待
                </button>
              )}
            </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総メンバー数</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">招待中</p>
              <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">管理者</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.role === 'admin' || m.role === 'owner').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'members', label: 'メンバー', count: members.length },
          { key: 'invitations', label: '招待', count: invitations.length },
          { key: 'settings', label: '設定', count: 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* メンバー一覧 */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メンバー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役割
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終アクティブ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完了タスク
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロジェクト
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => {
                  const StatusIcon = STATUS_CONFIG[member.status].icon;
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserCircleIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ROLE_CONFIG[member.role].color}`}>
                          {ROLE_CONFIG[member.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`h-4 w-4 mr-2 ${STATUS_CONFIG[member.status].color}`} />
                          <span className={`text-sm ${STATUS_CONFIG[member.status].color}`}>
                            {STATUS_CONFIG[member.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getLastActiveText(member.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {/* Tasks completed - would need to be calculated from store */}
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Projects count - would need to be calculated from store */}
                        0個
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 招待一覧 */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-xl shadow-sm border">
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">招待がありません</h3>
              <p className="text-gray-600 mb-6">新しいメンバーを招待してチームを拡大しましょう</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                メンバーを招待
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      役割
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      招待者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      招待日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      有効期限
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => {
                    const daysLeft = getDaysUntilExpiry(invitation.expiresAt);
                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ROLE_CONFIG[invitation.role].color}`}>
                            {ROLE_CONFIG[invitation.role].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* Get inviter name from store - simplified for now */}
                          招待者
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invitation.createdAt.toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={daysLeft <= 1 ? 'text-red-600' : 'text-gray-500'}>
                            {daysLeft}日後
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 mr-3">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 設定 */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">チーム設定</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">権限設定</h4>
              <div className="space-y-3">
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color} mr-3`}>
                        {config.label}
                      </span>
                      <span className="text-sm text-gray-600">{config.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">招待設定</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">招待リンクの有効期間</span>
                  <p className="text-sm text-gray-600">7日間</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  変更
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チーム作成モーダル */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-6">新しいチームを作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  チーム名
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="チーム名を入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="チームの説明を入力"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateTeam}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                チーム作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 招待モーダル */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            {inviteSuccess ? (
              <div className="text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">招待を送信しました！</h2>
                <p className="text-gray-600 mb-4">
                  {inviteEmail} に招待メールを送信しました。
                </p>
                <p className="text-sm text-gray-500">
                  このモーダルは自動的に閉じます...
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6">メンバーを招待</h2>
                
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{inviteError}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={inviteLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="example@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      役割
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as StoreTeamMember['role'])}
                      disabled={inviteLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="viewer">閲覧者</option>
                      <option value="member">メンバー</option>
                      <option value="admin">管理者</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      {ROLE_CONFIG[inviteRole].description}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <EnvelopeIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700 font-medium">メール招待について</p>
                        <p className="text-sm text-blue-600 mt-1">
                          指定されたメールアドレスに招待リンクが送信されます。招待の有効期限は7日間です。
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteError(null);
                    }}
                    disabled={inviteLoading}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={inviteMember}
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {inviteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        送信中...
                      </>
                    ) : (
                      '招待を送信'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* チームがない場合の表示 */}
      {!currentTeam && teams.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">チームを始めましょう</h3>
          <p className="text-gray-500 mb-6">
            新しいチームを作成してメンバーと協力しましょう
          </p>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            最初のチームを作成
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeamView() {
  return (
    <PremiumGate featureName="team">
      <TeamContent />
    </PremiumGate>
  );
}
