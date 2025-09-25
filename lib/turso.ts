import { createClient } from "@libsql/client/web";

// Tursoクライアントの設定
export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// データベースの初期化
export async function initializeDatabase() {
  try {
    // プロフィールテーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        country_code TEXT DEFAULT '+81',
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 設定テーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        dark_mode BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        task_reminders BOOLEAN DEFAULT TRUE,
        weekly_report BOOLEAN DEFAULT FALSE,
        language TEXT DEFAULT 'ja',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 通知テーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id)
      )
    `);

    // タスク・予定テーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        due_date DATETIME,
        due_time TEXT,
        end_date DATETIME,
        end_time TEXT,
        location TEXT,
        is_all_day BOOLEAN DEFAULT FALSE,
        color TEXT,
        reminder INTEGER,
        xp_value INTEGER DEFAULT 0,
        type TEXT CHECK(type IN ('task', 'event')) DEFAULT 'task',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id)
      )
    `);

    // サブタスクテーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // テーブル作成完了（デフォルトユーザーの挿入は削除）

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// 通知関連の関数
export async function getNotifications(userId: string) {
  try {
    const result = await turso.execute({
      sql: `
        SELECT id, title, message, type, is_read, created_at
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
      `,
      args: [userId]
    });
    
    return result.rows.map(row => ({
      id: row.id as number,
      title: row.title as string,
      message: row.message as string,
      type: row.type as string,
      is_read: Boolean(row.is_read),
      created_at: row.created_at as string
    }));
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

export async function createNotification(userId: string, title: string, message?: string, type: string = 'info') {
  try {
    const result = await turso.execute({
      sql: `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `,
      args: [userId, title, message || '', type]
    });
    
    return Number(result.lastInsertRowid);
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await turso.execute({
      sql: `
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ?
      `,
      args: [notificationId]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await turso.execute({
      sql: `
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ? AND is_read = FALSE
      `,
      args: [userId]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const result = await turso.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
      `,
      args: [userId]
    });
    
    return result.rows[0]?.count as number || 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
}

// プロフィール情報を取得
export async function getProfile(userId: string) {
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM user_profiles WHERE id = ?`,
      args: [userId]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

// プロフィール情報を更新
export async function updateProfile(userId: string, profileData: {
  name: string;
  email: string;
  phone: string;
  country_code: string;
  bio: string;
}) {
  try {
    // まず、ユーザーのプロフィールが存在するかチェック
    const existingProfile = await turso.execute({
      sql: `SELECT id FROM user_profiles WHERE id = ?`,
      args: [userId]
    });

    if (existingProfile.rows.length === 0) {
      // プロフィールが存在しない場合は新規作成
      await turso.execute({
        sql: `
          INSERT INTO user_profiles (id, name, email, phone, country_code, bio)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [userId, profileData.name, profileData.email, profileData.phone, profileData.country_code, profileData.bio]
      });
    } else {
      // プロフィールが存在する場合は更新
      await turso.execute({
        sql: `
          UPDATE user_profiles 
          SET name = ?, email = ?, phone = ?, country_code = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [profileData.name, profileData.email, profileData.phone, profileData.country_code, profileData.bio, userId]
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
}

// 設定情報を取得
export async function getSettings() {
  try {
    const result = await turso.execute(`
      SELECT * FROM user_settings WHERE user_id = 'default_user'
    `);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return null;
  }
}

// 設定情報を更新
export async function updateSettings(settingsData: {
  dark_mode?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  task_reminders?: boolean;
  weekly_report?: boolean;
  language?: string;
}) {
  try {
    const keys = Object.keys(settingsData);
    const values = Object.values(settingsData);
    const setClause = keys.map(key => `${key} = ?`).join(', ');

    await turso.execute({
      sql: `
        UPDATE user_settings 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = 'default_user'
      `,
      args: values
    });
    return true;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return false;
  }
}

// タスク・予定関連の関数
export interface TaskData {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: string;
  endDate?: Date;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  reminder?: number;
  xpValue?: number;
  type?: 'task' | 'event';
  subtasks?: SubtaskData[];
}

export interface SubtaskData {
  id?: string;
  taskId: string;
  title: string;
  completed?: boolean;
}

// タスク・予定を取得
export async function getTasks(userId: string) {
  try {
    const tasksResult = await turso.execute({
      sql: `
        SELECT * FROM tasks 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `,
      args: [userId]
    });

    const tasks = [];
    for (const row of tasksResult.rows) {
      // サブタスクも取得
      const subtasksResult = await turso.execute({
        sql: `
          SELECT * FROM subtasks 
          WHERE task_id = ? 
          ORDER BY created_at ASC
        `,
        args: [row.id]
      });

      const subtasks = subtasksResult.rows.map(subtaskRow => ({
        id: subtaskRow.id as string,
        title: subtaskRow.title as string,
        completed: Boolean(subtaskRow.completed)
      }));

      tasks.push({
        id: row.id as string,
        userId: row.user_id as string,
        title: row.title as string,
        description: row.description as string || undefined,
        completed: Boolean(row.completed),
        priority: row.priority as 'low' | 'medium' | 'high',
        dueDate: row.due_date ? new Date(row.due_date as string) : undefined,
        dueTime: row.due_time as string || undefined,
        endDate: row.end_date ? new Date(row.end_date as string) : undefined,
        endTime: row.end_time as string || undefined,
        location: row.location as string || undefined,
        isAllDay: Boolean(row.is_all_day),
        color: row.color as string || undefined,
        reminder: row.reminder as number || undefined,
        xpValue: row.xp_value as number || 0,
        type: row.type as 'task' | 'event',
        createdAt: new Date(row.created_at as string),
        subtasks
      });
    }

    return tasks;
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return [];
  }
}

// タスク・予定を作成
export async function createTask(taskData: TaskData) {
  try {
    const id = taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await turso.execute({
      sql: `
        INSERT INTO tasks (
          id, user_id, title, description, completed, priority,
          due_date, due_time, end_date, end_time, location, is_all_day,
          color, reminder, xp_value, type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        taskData.userId,
        taskData.title,
        taskData.description || null,
        taskData.completed || false,
        taskData.priority || 'medium',
        taskData.dueDate ? taskData.dueDate.toISOString() : null,
        taskData.dueTime || null,
        taskData.endDate ? taskData.endDate.toISOString() : null,
        taskData.endTime || null,
        taskData.location || null,
        taskData.isAllDay || false,
        taskData.color || null,
        taskData.reminder || null,
        taskData.xpValue || 0,
        taskData.type || 'task'
      ]
    });

    // サブタスクも作成
    if (taskData.subtasks) {
      for (const subtask of taskData.subtasks) {
        await createSubtask({
          ...subtask,
          taskId: id
        });
      }
    }

    return id;
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
}

// タスク・予定を更新
export async function updateTask(taskId: string, taskData: Partial<TaskData>) {
  try {
    const fields = [];
    const values = [];

    if (taskData.title !== undefined) {
      fields.push('title = ?');
      values.push(taskData.title);
    }
    if (taskData.description !== undefined) {
      fields.push('description = ?');
      values.push(taskData.description);
    }
    if (taskData.completed !== undefined) {
      fields.push('completed = ?');
      values.push(taskData.completed);
    }
    if (taskData.priority !== undefined) {
      fields.push('priority = ?');
      values.push(taskData.priority);
    }
    if (taskData.dueDate !== undefined) {
      fields.push('due_date = ?');
      values.push(taskData.dueDate ? taskData.dueDate.toISOString() : null);
    }
    if (taskData.dueTime !== undefined) {
      fields.push('due_time = ?');
      values.push(taskData.dueTime);
    }
    if (taskData.endDate !== undefined) {
      fields.push('end_date = ?');
      values.push(taskData.endDate ? taskData.endDate.toISOString() : null);
    }
    if (taskData.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(taskData.endTime);
    }
    if (taskData.location !== undefined) {
      fields.push('location = ?');
      values.push(taskData.location);
    }
    if (taskData.isAllDay !== undefined) {
      fields.push('is_all_day = ?');
      values.push(taskData.isAllDay);
    }
    if (taskData.color !== undefined) {
      fields.push('color = ?');
      values.push(taskData.color);
    }
    if (taskData.reminder !== undefined) {
      fields.push('reminder = ?');
      values.push(taskData.reminder);
    }

    if (fields.length === 0) return true;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId);

    await turso.execute({
      sql: `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      args: values
    });

    return true;
  } catch (error) {
    console.error('Failed to update task:', error);
    return false;
  }
}

// タスク・予定を削除
export async function deleteTask(taskId: string) {
  try {
    await turso.execute({
      sql: `DELETE FROM tasks WHERE id = ?`,
      args: [taskId]
    });
    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
}

// サブタスクを作成
export async function createSubtask(subtaskData: SubtaskData) {
  try {
    const id = subtaskData.id || `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await turso.execute({
      sql: `
        INSERT INTO subtasks (id, task_id, title, completed)
        VALUES (?, ?, ?, ?)
      `,
      args: [
        id,
        subtaskData.taskId,
        subtaskData.title,
        subtaskData.completed || false
      ]
    });

    return id;
  } catch (error) {
    console.error('Failed to create subtask:', error);
    return null;
  }
}

// サブタスクを更新
export async function updateSubtask(subtaskId: string, updates: { title?: string; completed?: boolean }) {
  try {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed);
    }

    if (fields.length === 0) return true;

    values.push(subtaskId);

    await turso.execute({
      sql: `UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?`,
      args: values
    });

    return true;
  } catch (error) {
    console.error('Failed to update subtask:', error);
    return false;
  }
}

// サブタスクを削除
export async function deleteSubtask(subtaskId: string) {
  try {
    await turso.execute({
      sql: `DELETE FROM subtasks WHERE id = ?`,
      args: [subtaskId]
    });
    return true;
  } catch (error) {
    console.error('Failed to delete subtask:', error);
    return false;
  }
}
