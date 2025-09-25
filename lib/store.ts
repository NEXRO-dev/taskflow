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

interface TaskStore {
  tasks: Task[];
  userStats: UserStats;
  currentView: 'dashboard' | 'list' | 'kanban' | 'calendar' | 'projects' | 'analytics' | 'goals' | 'team' | 'settings';
  isDarkMode: boolean;
  currentUserId: string | null;
  isLoading: boolean;
  lastSynced: Date | null;
  
  // Client-side actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'xpValue' | 'userId'>) => Promise<void>;
  addEvent: (event: Omit<Task, 'id' | 'createdAt' | 'xpValue' | 'userId' | 'completed' | 'subtasks'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  
  // Server sync actions
  syncFromServer: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  
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
      isLoading: false,
      lastSynced: null,

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
