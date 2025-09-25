import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: string;
  createdAt: Date;
  subtasks: any[];
  project?: string;
  xpValue: number;
  reminder?: number;
  userId: string;
  type: 'task' | 'event';
  endDate?: Date;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
}

interface LegacyStore {
  state: {
    tasks: LegacyTask[];
    userStats: any;
    currentView: string;
    isDarkMode: boolean;
    currentUserId: string | null;
  };
  version: number;
}

export function useMigration() {
  const { user } = useUser();
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'completed' | 'error'>('idle');
  const [migrationData, setMigrationData] = useState<LegacyTask[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    checkForLegacyData();
  }, [user?.id]);

  const checkForLegacyData = () => {
    try {
      setMigrationStatus('checking');
      
      // ローカルストレージから古いデータを取得
      const legacyData = localStorage.getItem('taskflow-storage');
      if (!legacyData) {
        setMigrationStatus('completed');
        return;
      }

      const parsed: LegacyStore = JSON.parse(legacyData);
      const tasks = parsed.state?.tasks || [];
      
      // 現在のユーザー以外のタスクまたは、ユーザーIDが設定されていないタスクをフィルタ
      const userTasks = tasks.filter(task => 
        !task.userId || task.userId === user?.id
      );

      if (userTasks.length > 0) {
        setMigrationData(userTasks);
        setMigrationStatus('idle'); // マイグレーション可能な状態
      } else {
        setMigrationStatus('completed');
      }
    } catch (error) {
      console.error('Legacy data check failed:', error);
      setMigrationStatus('error');
    }
  };

  const migrateData = async () => {
    if (!user?.id || migrationData.length === 0) return;

    try {
      setMigrationStatus('migrating');

      // 各タスクをサーバーに送信
      for (const task of migrationData) {
        const taskData = {
          ...task,
          userId: user.id, // 現在のユーザーIDに設定
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          endDate: task.endDate ? new Date(task.endDate) : undefined,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        };

        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error(`Failed to migrate task: ${task.title}`);
        }
      }

      // マイグレーション完了後、ローカルストレージをクリア
      const currentData: LegacyStore = JSON.parse(localStorage.getItem('taskflow-storage') || '{"state":{}}');
      if (currentData.state) {
        currentData.state.tasks = [];
        localStorage.setItem('taskflow-storage', JSON.stringify(currentData));
      }

      setMigrationStatus('completed');
      setMigrationData([]);
      
      // ページをリロードして新しいデータを表示
      window.location.reload();
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
    }
  };

  const skipMigration = () => {
    setMigrationStatus('completed');
    setMigrationData([]);
  };

  return {
    migrationStatus,
    migrationData,
    migrateData,
    skipMigration,
    hasMigrationData: migrationData.length > 0,
  };
}

export default useMigration;
