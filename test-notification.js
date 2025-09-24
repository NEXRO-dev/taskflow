// 通知作成テスト用スクリプト
// 使用方法: node test-notification.js

const testNotifications = [
  {
    userId: 'default_user',
    title: 'FlowCraftへようこそ！',
    message: 'FlowCraftをご利用いただき、ありがとうございます。効率的なタスク管理を始めましょう。',
    type: 'info'
  },
  {
    userId: 'default_user',
    title: '新しい機能がリリースされました',
    message: 'カレンダー機能が追加されました。タスクの期限を視覚的に管理できます。',
    type: 'success'
  },
  {
    userId: 'default_user',
    title: 'メンテナンスのお知らせ',
    message: '明日の午前2時から4時までシステムメンテナンスを実施いたします。',
    type: 'warning'
  },
  {
    userId: 'default_user',
    title: 'プロフィール情報の更新をお願いします',
    message: 'より良いサービス提供のため、プロフィール情報の更新をお願いいたします。',
    type: 'info'
  },
  {
    userId: 'default_user',
    title: 'セキュリティアップデート',
    message: 'セキュリティを向上させるため、パスワードの更新をお勧めします。',
    type: 'error'
  }
];

async function createTestNotifications() {
  console.log('通知作成テストを開始します...\n');
  
  for (let i = 0; i < testNotifications.length; i++) {
    const notification = testNotifications[i];
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 通知 ${i + 1} 作成成功:`, notification.title);
        console.log(`   ID: ${result.notificationId}`);
        console.log(`   タイプ: ${notification.type}`);
        console.log('');
      } else {
        const error = await response.json();
        console.log(`❌ 通知 ${i + 1} 作成失敗:`, error.error);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ 通知 ${i + 1} 作成エラー:`, error.message);
      console.log('');
    }
    
    // 少し間隔を空ける
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('通知作成テストが完了しました！');
  console.log('ダッシュボードの通知アイコンを確認してください。');
}

// スクリプト実行
createTestNotifications().catch(console.error);
