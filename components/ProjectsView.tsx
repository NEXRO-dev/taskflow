import { useState, useEffect } from 'react';
import { useTaskStore, Project } from '@/lib/store';
import PremiumGate from './PremiumGate';
import { 
  PlusIcon, 
  EllipsisVerticalIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  FolderIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const PROJECT_COLORS = [
  { name: 'blue', class: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'green', class: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
  { name: 'purple', class: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'orange', class: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'pink', class: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-700' },
  { name: 'indigo', class: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-700' },
  { name: 'red', class: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
  { name: 'yellow', class: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' },
];

const PROJECT_STATUSES = [
  { value: 'active', label: 'アクティブ', color: 'text-green-600 bg-green-100' },
  { value: 'on_hold', label: '保留中', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'completed', label: '完了', color: 'text-blue-600 bg-blue-100' },
  { value: 'cancelled', label: 'キャンセル', color: 'text-red-600 bg-red-100' },
] as const;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (projectData: any) => void;
}

function ProjectModal({ isOpen, onClose, project, onSave }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0].class,
    status: 'active' as 'active' | 'completed' | 'on_hold' | 'cancelled',
    startDate: '',
    endDate: '',
    teamMembers: [] as string[]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate ? format(project.startDate, 'yyyy-MM-dd') : '',
        endDate: project.endDate ? format(project.endDate, 'yyyy-MM-dd') : '',
        teamMembers: project.teamMembers
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: PROJECT_COLORS[0].class,
        status: 'active' as 'active' | 'completed' | 'on_hold' | 'cancelled',
        startDate: '',
        endDate: '',
        teamMembers: []
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };
    
    onSave(projectData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {project ? 'プロジェクトを編集' : '新しいプロジェクト'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* プロジェクト名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト名
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="プロジェクト名を入力"
              />
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="プロジェクトの説明を入力"
              />
            </div>

            {/* カラー選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                プロジェクトカラー
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.class }))}
                    className={`w-8 h-8 rounded-full border-4 transition-all hover:scale-110 ${
                      color.class
                    } ${
                      formData.color === color.class
                        ? 'border-gray-900 shadow-xl scale-110 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'completed' | 'on_hold' | 'cancelled' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 日付 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了予定日
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {project ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { getProjectTasks, getProjectProgress, updateProject, deleteProject } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const tasks = getProjectTasks(project.id);
  const progress = getProjectProgress(project.id);
  
  const colorInfo = PROJECT_COLORS.find(c => c.class === project.color) || PROJECT_COLORS[0];
  const statusInfo = PROJECT_STATUSES.find(s => s.value === project.status)!;

  const handleStatusChange = (newStatus: typeof project.status) => {
    updateProject(project.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm(`プロジェクト「${project.name}」を削除しますか？関連するタスクからプロジェクトの関連付けが解除されます。`)) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${colorInfo.class}`}></div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // 編集モーダルを開く処理（親コンポーネントで実装）
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  編集
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  削除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ステータス */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* 説明 */}
      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* 進捗 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">進捗</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colorInfo.class}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
          <div className="text-xs text-gray-500">総タスク</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</div>
          <div className="text-xs text-gray-500">完了</div>
        </div>
      </div>

      {/* 日付情報 */}
      {(project.startDate || project.endDate) && (
        <div className="border-t pt-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {project.startDate && project.endDate ? (
              <span>
                {format(project.startDate, 'MM/dd', { locale: ja })} - {format(project.endDate, 'MM/dd', { locale: ja })}
              </span>
            ) : project.startDate ? (
              <span>{format(project.startDate, 'MM/dd開始', { locale: ja })}</span>
            ) : project.endDate ? (
              <span>{format(project.endDate, 'MM/dd終了予定', { locale: ja })}</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsContent() {
  const { projects, addProject, updateProject } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.status === 'active';
    if (filter === 'completed') return project.status === 'completed';
    return true;
  });

  const handleCreateProject = (projectData: any) => {
    addProject(projectData);
  };

  const handleUpdateProject = (projectData: any) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
    }
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">プロジェクト</h1>
          <p className="text-gray-600 mt-1">プロジェクトを管理して作業を整理しましょう</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新規プロジェクト
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総プロジェクト</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">完了</p>
              <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'すべて' },
          { key: 'active', label: 'アクティブ' },
          { key: 'completed', label: '完了' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* プロジェクト一覧 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">プロジェクトがありません</h3>
          <p className="text-gray-500 mb-6">最初のプロジェクトを作成して作業を整理しましょう</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規プロジェクト
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
            />
          ))}
        </div>
      )}

      {/* モーダル */}
      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />

      <ProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSave={handleUpdateProject}
      />
    </div>
  );
}

export default function ProjectsView() {
  return (
    <PremiumGate featureName="プロジェクト管理">
      <ProjectsContent />
    </PremiumGate>
  );
}