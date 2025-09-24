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
