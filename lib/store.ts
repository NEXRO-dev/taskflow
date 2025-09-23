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

interface TaskStore {
  tasks: Task[];
  userStats: UserStats;
  currentView: 'dashboard' | 'list' | 'kanban' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'settings';
  isDarkMode: boolean;
  currentUserId: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'xpValue' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addXP: (amount: number) => void;
  setView: (view: 'dashboard' | 'list' | 'kanban' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'settings') => void;
  generateSubtasks: (taskTitle: string) => string[];
  clearAllTasks: () => void;
  toggleDarkMode: () => void;
  setCurrentUserId: (userId: string | null) => void;
  getUserTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
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

      addTask: (taskData) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.error('ユーザーIDが設定されていません');
          return;
        }
        
        console.log('Store addTask called with:', taskData);
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          xpValue: taskData.priority === 'high' ? 30 : taskData.priority === 'medium' ? 20 : 10,
          userId: currentUserId,
        };
        console.log('Created new task:', newTask);
        set((state) => {
          const newState = {
            tasks: [...state.tasks, newTask]
          };
          console.log('Updated state, total tasks:', newState.tasks.length);
          return newState;
        });
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      toggleTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const isCompleting = !task.completed;
        
        set((state) => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        }));

        if (isCompleting) {
          get().addXP(task.xpValue);
        }
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map(subtask =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  )
                }
              : task
          )
        }));
      },

      addSubtask: (taskId, title) => {
        const newSubtask: Subtask = {
          id: crypto.randomUUID(),
          title,
          completed: false
        };
        
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, subtasks: [...task.subtasks, newSubtask] }
              : task
          )
        }));
      },

      addXP: (amount) => {
        set((state) => {
          const newXP = state.userStats.totalXP + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          const newCompletedTasks = state.userStats.completedTasks + 1;
          
          return {
            userStats: {
              ...state.userStats,
              totalXP: newXP,
              level: newLevel,
              completedTasks: newCompletedTasks
            }
          };
        });
      },

      setView: (view) => {
        set({ currentView: view });
      },

      generateSubtasks: (taskTitle: string) => {
        const lowerTitle = taskTitle.toLowerCase();
        
        // Simple AI simulation for subtask generation
        if (lowerTitle.includes('会議') || lowerTitle.includes('ミーティング') || lowerTitle.includes('打ち合わせ') || lowerTitle.includes('meeting') || lowerTitle.includes('call')) {
          return [
            'アジェンダの準備',
            'ビデオ通話のセットアップ',
            'カレンダー招待の送信',
            'プレゼン資料の準備',
            'フォローアップメモの送信'
          ];
        }
        
        if (lowerTitle.includes('プロジェクト') || lowerTitle.includes('開発') || lowerTitle.includes('project') || lowerTitle.includes('develop')) {
          return [
            'プロジェクト構造の計画',
            '初期ワイヤーフレームの作成',
            '開発環境のセットアップ',
            'コア機能の実装',
            'テスト・デバッグ',
            '本番環境へのデプロイ'
          ];
        }
        
        if (lowerTitle.includes('勉強') || lowerTitle.includes('学習') || lowerTitle.includes('study') || lowerTitle.includes('learn')) {
          return [
            '学習資料の収集',
            '学習スケジュールの作成',
            'ノート作成',
            '練習問題の実施',
            '復習とまとめ'
          ];
        }
        
        return [
          '小さなステップに分解',
          '要件の調査',
          'メインタスクの実行',
          'レビューと仕上げ'
        ];
      },

      clearAllTasks: () => {
        set(() => ({
          tasks: []
        }));
      },

      toggleDarkMode: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode
        }));
      },

      setCurrentUserId: (userId) => {
        set({ currentUserId: userId });
      },

      getUserTasks: () => {
        const { tasks, currentUserId } = get();
        return currentUserId ? tasks.filter(task => task.userId === currentUserId) : [];
      }
    }),
    {
      name: 'taskflow-storage',
    }
  )
);