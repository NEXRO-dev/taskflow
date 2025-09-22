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
        id TEXT PRIMARY KEY DEFAULT 'default_user',
        name TEXT NOT NULL DEFAULT '田中太郎',
        email TEXT DEFAULT 'tanaka@example.com',
        phone TEXT DEFAULT '90-1234-5678',
        country_code TEXT DEFAULT '+81',
        bio TEXT DEFAULT 'プロジェクトマネージャーとして働いています。効率的なタスク管理を心がけています。',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 設定テーブルを作成
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY DEFAULT 'default_user',
        dark_mode BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        task_reminders BOOLEAN DEFAULT TRUE,
        weekly_report BOOLEAN DEFAULT FALSE,
        language TEXT DEFAULT 'ja',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // デフォルトのユーザーデータを挿入（存在しない場合のみ）
    await turso.execute(`
      INSERT OR IGNORE INTO user_profiles (id) VALUES ('default_user')
    `);

    await turso.execute(`
      INSERT OR IGNORE INTO user_settings (user_id) VALUES ('default_user')
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// プロフィール情報を取得
export async function getProfile() {
  try {
    const result = await turso.execute(`
      SELECT * FROM user_profiles WHERE id = 'default_user'
    `);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

// プロフィール情報を更新
export async function updateProfile(profileData: {
  name: string;
  email: string;
  phone: string;
  country_code: string;
  bio: string;
}) {
  try {
    await turso.execute({
      sql: `
        UPDATE user_profiles 
        SET name = ?, email = ?, phone = ?, country_code = ?, bio = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 'default_user'
      `,
      args: [profileData.name, profileData.email, profileData.phone, profileData.country_code, profileData.bio]
    });
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
