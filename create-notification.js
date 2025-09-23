// データベースに直接通知を挿入するスクリプト
import { createClient } from "@libsql/client/web";

// Tursoクライアントの設定（環境変数を直接設定）
const turso = createClient({
  url: "libsql://task-management-db-nexro-dev.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTg1Mzk5MDcsImlkIjoiYzdhNGY5OTYtNTMyMi00YzRiLWEzYjQtMDhkMjBjZDNiZGI2IiwicmlkIjoiYzQ3YmRjNGUtNDU1My00ZTc3LTg2NjktMDZlNzhjZDE5NjNlIn0.bzQ8UPUWzgOcVF-gEGW3-NAShtFxWJ0dGTryNE4twKWv6S0WzPhq5GdCj_WK_14T_Fm7xAyl8ADNWViFK4TLAA",
});

async function createNotification() {
  try {
    console.log('データベースに通知を作成中...');
    
    // 通知を挿入
    const result = await turso.execute({
      sql: `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `,
      args: [
        'default_user',
        '🎉 新機能リリース！',
        'キーボードショートカット機能が追加されました。Ctrl+?でヘルプを表示できます。',
        'success'
      ]
    });
    
    console.log('✅ 通知作成成功！');
    console.log('通知ID:', result.lastInsertRowid);
    
    // 作成された通知を確認
    const notifications = await turso.execute({
      sql: `
        SELECT id, title, message, type, is_read, created_at
        FROM notifications 
        WHERE user_id = 'default_user' 
        ORDER BY created_at DESC 
        LIMIT 5
      `
    });
    
    console.log('\n最新の通知一覧:');
    notifications.rows.forEach((row, index) => {
      console.log(`${index + 1}. [${row.type}] ${row.title}`);
      console.log(`   ${row.message}`);
      console.log(`   作成日時: ${row.created_at}`);
      console.log(`   既読: ${row.is_read ? 'Yes' : 'No'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

createNotification();
