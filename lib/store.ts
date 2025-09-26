import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: string; // 時間を追加 (HH:MM形式)
  createdAt: Date;
  subtasks: Subtask[];
  project?: string;
  xpValue: number;
  reminder?: number; // リマインダー (分前)
  userId: string; // ユーザーIDを追加
  type: 'task' | 'event'; // タスクか予定かを区別
  endDate?: Date; // 予定の終了日時（予定の場合）
  endTime?: string; // 予定の終了時間（予定の場合）
  location?: string; // 予定の場所（予定の場合）
  isAllDay?: boolean; // 終日予定かどうか
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple' | 'pink' | 'indigo' | 'gray'; // 予定の色（予定の場合）
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface UserStats {
  totalXP: number;
  level: number;
  completedTasks: number;
  streak: number;
  badges: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  progress: number; // 0-100の進捗率
  startDate?: Date;
  endDate?: Date;
  teamMembers: string[]; // ユーザーIDの配列
  createdAt: Date;
  updatedAt: Date;
  userId: string; // プロジェクトオーナー
}

// 分析データ用インターフェース
export interface Analytics {
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  monthlyStats: MonthlyStat[];
  productivityTrends: ProductivityTrend[];
  timeTracking: TimeEntry[];
}

export interface DailyStat {
  date: string; // YYYY-MM-DD形式
  tasksCompleted: number;
  tasksCreated: number;
  timeSpent: number; // 分
  focusTime: number; // 分
  productivityScore: number; // 0-100
}

export interface WeeklyStat {
  weekStart: string; // YYYY-MM-DD形式
  weekEnd: string;
  tasksCompleted: number;
  averageProductivity: number;
  totalTimeSpent: number;
  streak: number; // 連続完了日数
}

export interface MonthlyStat {
  month: string; // YYYY-MM形式
  tasksCompleted: number;
  goalsAchieved: number;
  averageProductivity: number;
  totalTimeSpent: number;
}

export interface ProductivityTrend {
  date: string;
  score: number;
  category: 'task_completion' | 'time_management' | 'goal_progress' | 'consistency';
}

export interface TimeEntry {
  id: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 分
  category: 'work' | 'break' | 'meeting' | 'learning' | 'planning';
  tags: string[];
  userId: string;
}

// 目標管理用インターフェース
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'career' | 'health' | 'learning' | 'habit';
  type: 'quantitative' | 'qualitative' | 'habit';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  targetDate: Date;
  currentValue: number;
  targetValue: number;
  unit: string; // 'times', 'hours', 'kg', '%', etc.
  keyResults: KeyResult[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface KeyResult {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  dueDate: Date;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; // 週X回、月X回など
  category: 'health' | 'productivity' | 'learning' | 'social' | 'personal';
  streak: number; // 連続日数
  longestStreak: number;
  completions: HabitCompletion[];
  isActive: boolean;
  createdAt: Date;
  userId: string;
}

export interface HabitCompletion {
  id: string;
  date: string; // YYYY-MM-DD形式
  completed: boolean;
  note?: string;
}

// チーム管理用インターフェース
export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  ownerId: string; // チームオーナーのユーザーID
  members: TeamMember[];
  projects: string[]; // プロジェクトIDの配列
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  permissions: TeamPermissions;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface TeamPermissions {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canViewAnalytics: boolean;
}

export interface TeamSettings {
  isPublic: boolean;
  allowMemberInvites: boolean;
  defaultProjectVisibility: 'public' | 'team' | 'private';
  notifications: {
    projectUpdates: boolean;
    memberJoined: boolean;
    taskAssignments: boolean;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamMember['role'];
  invitedBy: string; // ユーザーID
  expiresAt: Date;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  type: 'project_created' | 'project_updated' | 'member_joined' | 'member_left' | 'task_assigned' | 'task_completed';
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  userStats: UserStats;
  currentView: 'dashboard' | 'list' | 'kanban' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'settings';
  isDarkMode: boolean;
  currentUserId: string | null;
  isLoading: boolean;
  lastSynced: Date | null;
  
  // Pro プラン機能用データ
  analytics: Analytics;
  goals: Goal[];
  habits: Habit[];
  timeEntries: TimeEntry[];
  
  // Team プラン機能用データ
  teams: Team[];
  currentTeamId: string | null;
  teamInvitations: TeamInvitation[];
  teamActivities: TeamActivity[];
  
  // Client-side actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'xpValue' | 'userId'>) => Promise<void>;
  addEvent: (event: Omit<Task, 'id' | 'createdAt' | 'xpValue' | 'userId' | 'completed' | 'subtasks'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  
  // Project management actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectTasks: (projectId: string) => Task[];
  getProjectProgress: (projectId: string) => number;
  
  // Server sync actions
  syncFromServer: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setProjects: (projects: Project[]) => void;
  
  // Analytics functions
  updateAnalytics: () => void;
  getProductivityScore: (date: string) => number;
  getTimeSpentToday: () => number;
  getWeeklyProgress: () => WeeklyStat | null;
  
  // Goals functions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, newValue: number) => void;
  completeKeyResult: (goalId: string, keyResultId: string) => void;
  completeMilestone: (goalId: string, milestoneId: string) => void;
  
  // Habits functions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'userId' | 'streak' | 'longestStreak' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  markHabitComplete: (habitId: string, date: string, note?: string) => void;
  
  // Time tracking functions
  startTimeTracking: (description: string, category: TimeEntry['category'], taskId?: string) => string;
  stopTimeTracking: (entryId: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'userId'>) => void;
  
  // Team management functions
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  setCurrentTeam: (teamId: string | null) => void;
  getCurrentTeam: () => Team | null;
  
  // Team member management
  inviteMember: (teamId: string, email: string, role: TeamMember['role']) => void;
  acceptInvitation: (invitationId: string) => void;
  declineInvitation: (invitationId: string) => void;
  removeMember: (teamId: string, memberId: string) => void;
  updateMemberRole: (teamId: string, memberId: string, role: TeamMember['role']) => void;
  updateMemberPermissions: (teamId: string, memberId: string, permissions: Partial<TeamPermissions>) => void;
  
  // Team activity functions
  addTeamActivity: (activity: Omit<TeamActivity, 'id' | 'createdAt'>) => void;
  getTeamActivities: (teamId: string, limit?: number) => TeamActivity[];
  
  // Local-only actions
  addXP: (amount: number) => void;
  setView: (view: 'dashboard' | 'list' | 'kanban' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'settings') => void;
  generateSubtasks: (taskTitle: string) => string[];
  clearAllTasks: () => void;
  toggleDarkMode: () => void;
  setCurrentUserId: (userId: string | null) => void;
  getUserTasks: () => Task[];
  getUserEvents: () => Task[];
  getAllItems: () => Task[];
}

// API関数
async function apiCall(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}

// 空の分析データ生成関数
function generateDemoAnalytics(): Analytics {
  return {
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    productivityTrends: [],
    timeTracking: [],
  };
}

function generateDemoGoals(): Goal[] {
  return [];
}

function generateDemoHabits(): Habit[] {
  return [];
}

function generateDemoTimeEntries(): TimeEntry[] {
  return [];
}

function getTimeEntryTags(category: TimeEntry['category']): string[] {
  const tagMap = {
    work: ['development', 'frontend', 'backend'],
    meeting: ['team', 'collaboration'],
    learning: ['skill-up', 'research'],
    planning: ['strategy', 'organization'],
    break: ['wellness'],
  };
  
  return tagMap[category] || [];
}

// チーム管理用ヘルパー関数
function getDefaultPermissions(role: TeamMember['role']): TeamPermissions {
  switch (role) {
    case 'owner':
      return {
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canInviteMembers: true,
        canManageMembers: true,
        canManageSettings: true,
        canViewAnalytics: true,
      };
    case 'admin':
      return {
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canInviteMembers: true,
        canManageMembers: true,
        canManageSettings: false,
        canViewAnalytics: true,
      };
    case 'member':
      return {
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: false,
        canInviteMembers: false,
        canManageMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
      };
    case 'viewer':
      return {
        canCreateProjects: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canInviteMembers: false,
        canManageMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
      };
    default:
      return getDefaultPermissions('member');
  }
}

function generateTeamId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateInvitationId(): string {
  return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      userStats: {
        totalXP: 0,
        level: 1,
        completedTasks: 0,
        streak: 0,
        badges: []
      },
      currentView: 'dashboard',
      isDarkMode: false,
      currentUserId: null,
      isLoading: false,
      lastSynced: null,
      
      // Pro プラン機能用データの初期化
      analytics: generateDemoAnalytics(),
      goals: generateDemoGoals(),
      habits: generateDemoHabits(),
      timeEntries: generateDemoTimeEntries(),
      
      // Team プラン機能用データの初期化
      teams: [],
      currentTeamId: null,
      teamInvitations: [],
      teamActivities: [],

      // サーバーからデータを同期
      syncFromServer: async () => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.warn('ユーザーIDが設定されていません');
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          console.log('Syncing from server...');
          const data = await apiCall('/api/tasks');
          console.log('Server response:', data);
          
          if (data && data.tasks) {
            const serverTasks = data.tasks.map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              endDate: task.endDate ? new Date(task.endDate) : undefined,
              createdAt: new Date(task.createdAt),
            }));
            
            set({ 
              tasks: serverTasks,
              lastSynced: new Date(),
              isLoading: false 
            });
            console.log('Sync completed, tasks loaded:', serverTasks.length);
          } else {
            console.warn('Invalid server response:', data);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('サーバー同期に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      // タスクリストを設定（サーバーからの同期用）
      setTasks: (tasks) => {
        set({ tasks });
      },

      // プロジェクトリストを設定（サーバーからの同期用）
      setProjects: (projects) => {
        set({ projects });
      },

      // プロジェクト管理機能
      addProject: async (projectData) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.error('ユーザーIDが設定されていません');
          return;
        }
        
        try {
          set({ isLoading: true });
          
          const newProject: Project = {
            ...projectData,
            id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUserId,
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // 実際のAPIではプロジェクトをサーバーに保存
          // 今は仮でローカルに追加
          set((state) => ({
            projects: [...state.projects, newProject],
            isLoading: false
          }));
          
          console.log('プロジェクトが作成されました:', newProject.name);
        } catch (error) {
          console.error('プロジェクト作成に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      updateProject: async (id, updates) => {
        try {
          set({ isLoading: true });
          
          const updatedProject = {
            ...updates,
            updatedAt: new Date(),
          };
          
          set((state) => ({
            projects: state.projects.map(project => 
              project.id === id 
                ? { ...project, ...updatedProject }
                : project
            ),
            isLoading: false
          }));
          
          console.log('プロジェクトが更新されました:', id);
        } catch (error) {
          console.error('プロジェクト更新に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      deleteProject: async (id) => {
        try {
          set({ isLoading: true });
          
          set((state) => ({
            projects: state.projects.filter(project => project.id !== id),
            tasks: state.tasks.map(task => 
              task.project === id 
                ? { ...task, project: undefined }
                : task
            ),
            isLoading: false
          }));
          
          console.log('プロジェクトが削除されました:', id);
        } catch (error) {
          console.error('プロジェクト削除に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      getProjectTasks: (projectId) => {
        const { tasks } = get();
        return tasks.filter(task => task.project === projectId);
      },

      getProjectProgress: (projectId) => {
        const { tasks } = get();
        const projectTasks = tasks.filter(task => task.project === projectId);
        
        if (projectTasks.length === 0) return 0;
        
        const completedTasks = projectTasks.filter(task => task.completed).length;
        return Math.round((completedTasks / projectTasks.length) * 100);
      },

      addTask: async (taskData) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.error('ユーザーIDが設定されていません');
          return;
        }
        
        try {
          set({ isLoading: true });
          
          const newTask = {
            ...taskData,
            userId: currentUserId,
            xpValue: taskData.priority === 'high' ? 30 : taskData.priority === 'medium' ? 20 : 10,
             type: 'task' as const,
             completed: false,
             subtasks: [],
             id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
           };

          const result = await apiCall('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(newTask),
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('タスク作成に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      addEvent: async (eventData) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.error('ユーザーIDが設定されていません');
          return;
        }

        try {
          set({ isLoading: true });
          
          const newEvent = {
            ...eventData,
            userId: currentUserId,
            xpValue: 0,
             type: 'event' as const,
             completed: false,
             subtasks: [],
             id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
           };

          const result = await apiCall('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(newEvent),
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('予定作成に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        try {
          set({ isLoading: true });
          
          await apiCall(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('タスク更新に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      deleteTask: async (id) => {
        try {
          set({ isLoading: true });
          
          await apiCall(`/api/tasks/${id}`, {
            method: 'DELETE',
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('タスク削除に失敗しました:', error);
          set({ isLoading: false });
        }
      },

      toggleTask: async (id) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        await get().updateTask(id, { completed: !task.completed });
      },

      toggleSubtask: async (taskId, subtaskId) => {
        try {
          const { tasks } = get();
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;

          const subtask = task.subtasks.find(s => s.id === subtaskId);
          if (!subtask) return;

          await apiCall(`/api/subtasks/${subtaskId}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: !subtask.completed }),
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('サブタスク更新に失敗しました:', error);
        }
      },

      addSubtask: async (taskId, title) => {
        try {
          await apiCall('/api/subtasks', {
            method: 'POST',
            body: JSON.stringify({ taskId, title }),
          });
          
          // 成功したらサーバーから最新データを同期
          await get().syncFromServer();
        } catch (error) {
          console.error('サブタスク作成に失敗しました:', error);
        }
      },

      // ローカルのみの操作
      addXP: (amount) => {
        set((state) => {
          const newTotalXP = state.userStats.totalXP + amount;
          const newLevel = Math.floor(newTotalXP / 100) + 1;
          return {
            userStats: {
              ...state.userStats,
              totalXP: newTotalXP,
              level: newLevel
            }
          };
        });
      },

      setView: (view) => {
        set({ currentView: view });
      },

      generateSubtasks: (taskTitle) => {
        const suggestions = [
          `${taskTitle}の計画を立てる`,
          `必要な資料を集める`,
          `進捗を確認する`,
          `完了を報告する`
        ];
        return suggestions;
      },

      clearAllTasks: () => {
        set({ tasks: [] });
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setCurrentUserId: (userId) => {
        set({ currentUserId: userId });
      },

      getUserTasks: () => {
        const { tasks, currentUserId } = get();
        return currentUserId ? tasks.filter(task => task.userId === currentUserId && task.type === 'task') : [];
      },

      getUserEvents: () => {
        const { tasks, currentUserId } = get();
        return currentUserId ? tasks.filter(task => task.userId === currentUserId && task.type === 'event') : [];
      },

      getAllItems: () => {
        const { tasks, currentUserId } = get();
        return currentUserId ? tasks.filter(task => task.userId === currentUserId) : [];
      },

      // Analytics functions
      updateAnalytics: () => {
        // 現在のタスクデータを基に分析データを更新
        const { tasks } = get();
        const today = new Date().toISOString().split('T')[0];
        const completedToday = tasks.filter(t => 
          t.completed && 
          t.createdAt && 
          new Date(t.createdAt).toISOString().split('T')[0] === today
        ).length;
        
        // 簡単な実装：今日の統計を更新
        set((state) => ({
          analytics: {
            ...state.analytics,
            dailyStats: state.analytics.dailyStats.map(stat => 
              stat.date === today 
                ? { ...stat, tasksCompleted: completedToday }
                : stat
            )
          }
        }));
      },

      getProductivityScore: (date) => {
        const { analytics } = get();
        const stat = analytics.dailyStats.find(s => s.date === date);
        return stat?.productivityScore || 0;
      },

      getTimeSpentToday: () => {
        const { analytics } = get();
        const today = new Date().toISOString().split('T')[0];
        const stat = analytics.dailyStats.find(s => s.date === today);
        return stat?.timeSpent || 0;
      },

      getWeeklyProgress: () => {
        const { analytics } = get();
        return analytics.weeklyStats[analytics.weeklyStats.length - 1] || null;
      },

      // Goals functions
      addGoal: (goalData) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        const newGoal: Goal = {
          ...goalData,
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          goals: [...state.goals, newGoal]
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map(goal => 
            goal.id === id 
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          )
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter(goal => goal.id !== id)
        }));
      },

      updateGoalProgress: (id, newValue) => {
        set((state) => ({
          goals: state.goals.map(goal => 
            goal.id === id 
              ? { ...goal, currentValue: newValue, updatedAt: new Date() }
              : goal
          )
        }));
      },

      completeKeyResult: (goalId, keyResultId) => {
        set((state) => ({
          goals: state.goals.map(goal => 
            goal.id === goalId 
              ? {
                  ...goal,
                  keyResults: goal.keyResults.map(kr => 
                    kr.id === keyResultId 
                      ? { ...kr, completed: true }
                      : kr
                  ),
                  updatedAt: new Date()
                }
              : goal
          )
        }));
      },

      completeMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map(goal => 
            goal.id === goalId 
              ? {
                  ...goal,
                  milestones: goal.milestones.map(m => 
                    m.id === milestoneId 
                      ? { ...m, completed: true, completedAt: new Date() }
                      : m
                  ),
                  updatedAt: new Date()
                }
              : goal
          )
        }));
      },

      // Habits functions
      addHabit: (habitData) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        const newHabit: Habit = {
          ...habitData,
          id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUserId,
          streak: 0,
          longestStreak: 0,
          completions: [],
          createdAt: new Date(),
        };

        set((state) => ({
          habits: [...state.habits, newHabit]
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map(habit => 
            habit.id === id 
              ? { ...habit, ...updates }
              : habit
          )
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter(habit => habit.id !== id)
        }));
      },

      markHabitComplete: (habitId, date, note) => {
        set((state) => ({
          habits: state.habits.map(habit => {
            if (habit.id !== habitId) return habit;

            const updatedCompletions = habit.completions.map(c => 
              c.date === date 
                ? { ...c, completed: true, note }
                : c
            );

            // 新しい完了記録を追加
            if (!updatedCompletions.find(c => c.date === date)) {
              updatedCompletions.push({
                id: `${habitId}-${date}`,
                date,
                completed: true,
                note,
              });
            }

            // ストリーク計算
            const sortedCompletions = updatedCompletions
              .filter(c => c.completed)
              .sort((a, b) => b.date.localeCompare(a.date));
            
            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            let currentDate = today;
            
            for (const completion of sortedCompletions) {
              if (completion.date === currentDate) {
                streak++;
                const prevDate = new Date(currentDate);
                prevDate.setDate(prevDate.getDate() - 1);
                currentDate = prevDate.toISOString().split('T')[0];
              } else {
                break;
              }
            }

            return {
              ...habit,
              completions: updatedCompletions,
              streak,
              longestStreak: Math.max(habit.longestStreak, streak),
            };
          })
        }));
      },

      // Time tracking functions
      startTimeTracking: (description, category, taskId) => {
        const { currentUserId } = get();
        if (!currentUserId) return '';

        const entryId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newEntry: TimeEntry = {
          id: entryId,
          taskId,
          description,
          startTime: new Date(),
          duration: 0,
          category,
          tags: getTimeEntryTags(category),
          userId: currentUserId,
        };

        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry]
        }));

        return entryId;
      },

      stopTimeTracking: (entryId) => {
        const now = new Date();
        set((state) => ({
          timeEntries: state.timeEntries.map(entry => 
            entry.id === entryId 
              ? {
                  ...entry,
                  endTime: now,
                  duration: Math.floor((now.getTime() - entry.startTime.getTime()) / 60000)
                }
              : entry
          )
        }));
      },

      addTimeEntry: (entryData) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        const newEntry: TimeEntry = {
          ...entryData,
          id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUserId,
        };

        set((state) => ({
          timeEntries: [...state.timeEntries, newEntry]
        }));
      },

      // Team management functions
      createTeam: (teamData) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        const newTeam: Team = {
          ...teamData,
          id: generateTeamId(),
          ownerId: currentUserId,
          members: [
            {
              id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: currentUserId,
              email: 'owner@example.com', // 実際には現在のユーザーのメールアドレス
              name: 'Team Owner', // 実際には現在のユーザーの名前
              role: 'owner',
              status: 'active',
              permissions: getDefaultPermissions('owner'),
              joinedAt: new Date(),
              lastActiveAt: new Date(),
            }
          ],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          teams: [...state.teams, newTeam],
          currentTeamId: newTeam.id
        }));

        // チーム作成アクティビティを追加
        get().addTeamActivity({
          teamId: newTeam.id,
          userId: currentUserId,
          type: 'project_created',
          description: `チーム "${newTeam.name}" が作成されました`,
          metadata: { teamName: newTeam.name }
        });
      },

      updateTeam: (id, updates) => {
        set((state) => ({
          teams: state.teams.map(team => 
            team.id === id 
              ? { ...team, ...updates, updatedAt: new Date() }
              : team
          )
        }));
      },

      deleteTeam: (id) => {
        set((state) => ({
          teams: state.teams.filter(team => team.id !== id),
          currentTeamId: state.currentTeamId === id ? null : state.currentTeamId
        }));
      },

      setCurrentTeam: (teamId) => {
        set({ currentTeamId: teamId });
      },

      getCurrentTeam: () => {
        const { teams, currentTeamId } = get();
        return currentTeamId ? teams.find(team => team.id === currentTeamId) || null : null;
      },

      // Team member management
      inviteMember: (teamId, email, role) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        const invitation: TeamInvitation = {
          id: generateInvitationId(),
          teamId,
          email,
          role,
          invitedBy: currentUserId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
          createdAt: new Date(),
          status: 'pending'
        };

        set((state) => ({
          teamInvitations: [...state.teamInvitations, invitation]
        }));

        // 招待アクティビティを追加
        get().addTeamActivity({
          teamId,
          userId: currentUserId,
          type: 'member_joined',
          description: `${email} がチームに招待されました`,
          metadata: { email, role }
        });
      },

      acceptInvitation: (invitationId) => {
        const { currentUserId, teamInvitations } = get();
        if (!currentUserId) return;

        const invitation = teamInvitations.find(inv => inv.id === invitationId);
        if (!invitation || invitation.status !== 'pending') return;

        // 招待を受諾済みに更新
        set((state) => ({
          teamInvitations: state.teamInvitations.map(inv =>
            inv.id === invitationId
              ? { ...inv, status: 'accepted' as const }
              : inv
          )
        }));

        // チームにメンバーを追加
        const newMember: TeamMember = {
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: currentUserId,
          email: invitation.email,
          name: 'New Member', // 実際にはユーザー情報から取得
          role: invitation.role,
          status: 'active',
          permissions: getDefaultPermissions(invitation.role),
          joinedAt: new Date(),
          lastActiveAt: new Date(),
        };

        set((state) => ({
          teams: state.teams.map(team =>
            team.id === invitation.teamId
              ? {
                  ...team,
                  members: [...team.members, newMember],
                  updatedAt: new Date()
                }
              : team
          )
        }));

        // メンバー参加アクティビティを追加
        get().addTeamActivity({
          teamId: invitation.teamId,
          userId: currentUserId,
          type: 'member_joined',
          description: `${invitation.email} がチームに参加しました`,
          metadata: { email: invitation.email, role: invitation.role }
        });
      },

      declineInvitation: (invitationId) => {
        set((state) => ({
          teamInvitations: state.teamInvitations.map(inv =>
            inv.id === invitationId
              ? { ...inv, status: 'declined' as const }
              : inv
          )
        }));
      },

      removeMember: (teamId, memberId) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        set((state) => ({
          teams: state.teams.map(team =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.filter(member => member.id !== memberId),
                  updatedAt: new Date()
                }
              : team
          )
        }));

        // メンバー削除アクティビティを追加
        get().addTeamActivity({
          teamId,
          userId: currentUserId,
          type: 'member_left',
          description: 'メンバーがチームから削除されました',
          metadata: { memberId }
        });
      },

      updateMemberRole: (teamId, memberId, role) => {
        set((state) => ({
          teams: state.teams.map(team =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.map(member =>
                    member.id === memberId
                      ? {
                          ...member,
                          role,
                          permissions: getDefaultPermissions(role)
                        }
                      : member
                  ),
                  updatedAt: new Date()
                }
              : team
          )
        }));
      },

      updateMemberPermissions: (teamId, memberId, permissions) => {
        set((state) => ({
          teams: state.teams.map(team =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.map(member =>
                    member.id === memberId
                      ? {
                          ...member,
                          permissions: { ...member.permissions, ...permissions }
                        }
                      : member
                  ),
                  updatedAt: new Date()
                }
              : team
          )
        }));
      },

      // Team activity functions
      addTeamActivity: (activityData) => {
        const activity: TeamActivity = {
          ...activityData,
          id: generateActivityId(),
          createdAt: new Date()
        };

        set((state) => ({
          teamActivities: [...state.teamActivities, activity]
        }));
      },

      getTeamActivities: (teamId, limit = 20) => {
        const { teamActivities } = get();
        return teamActivities
          .filter(activity => activity.teamId === teamId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit);
      }
    }),
    {
      name: 'taskflow-storage',
      partialize: (state) => ({
        userStats: state.userStats,
        currentView: state.currentView,
        isDarkMode: state.isDarkMode,
        currentUserId: state.currentUserId,
        // タスクデータはサーバーから同期するため、ローカルには保存しない
      }),
    }
  )
);
