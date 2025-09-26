// import { Resend } from 'resend'; // メール送信機能無効化のためコメントアウト

// Resendクライアントの初期化（現在無効化）
// const RESEND_API_KEY = process.env.RESEND_API_KEY;
// const resend = new Resend(RESEND_API_KEY || 're_placeholder_key_for_build');

// メール送信機能は現在無効化されています
console.log('メール送信機能は無効化されています');

export interface TeamInvitationEmailProps {
  to: string;
  teamName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}

// チーム招待メールテンプレート（現在無効化）
export const sendTeamInvitationEmail = async ({
  to,
  teamName,
  inviterName,
  inviteUrl,
  role
}: TeamInvitationEmailProps) => {
  try {
    // TODO: メール送信機能は現在無効化されています
    console.log('メール送信スキップ:', { to, teamName, inviterName, role });
    
    // 成功レスポンスを返す（実際には送信しない）
    return {
      success: true,
      data: { id: 'mock-email-id' },
      message: 'メール送信機能は現在無効化されています'
    };
    
    /*
    // 環境変数チェック
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Please set the API key in environment variables.');
    }
    const { data, error } = await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>', // 開発環境用ドメイン
      to: [to],
      subject: `${teamName}チームへの招待`,
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>チーム招待</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-card {
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 32px 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 32px 24px;
            }
            .invitation-info {
              background: #f8fafc;
              border-left: 4px solid #667eea;
              padding: 16px;
              margin: 24px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background: #667eea;
              color: white !important;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 24px 0;
              text-align: center;
            }
            .footer {
              background: #f8fafc;
              padding: 24px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .role-badge {
              display: inline-block;
              background: #e0e7ff;
              color: #3730a3;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <h1>🎉 チーム招待</h1>
              </div>
              
              <div class="content">
                <p>こんにちは！</p>
                
                <p><strong>${inviterName}</strong>さんから<strong>${teamName}</strong>チームに招待されました。</p>
                
                <div class="invitation-info">
                  <h3 style="margin-top: 0; color: #1e293b;">招待詳細</h3>
                  <p><strong>チーム名:</strong> ${teamName}</p>
                  <p><strong>招待者:</strong> ${inviterName}</p>
                  <p><strong>あなたの役割:</strong> <span class="role-badge">${getRoleDisplayName(role)}</span></p>
                </div>
                
                <p>以下のボタンをクリックして招待を受け入れ、チームに参加しましょう！</p>
                
                <div style="text-align: center;">
                  <a href="${inviteUrl}" class="cta-button">
                    チームに参加する
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
                  ※ この招待は7日間有効です。期限が切れた場合は、チーム管理者に再招待を依頼してください。
                </p>
                
                <p style="color: #64748b; font-size: 14px;">
                  このメールに心当たりがない場合は、このメールを無視してください。
                </p>
              </div>
              
              <div class="footer">
                <p>TaskFlow - チーム協働プラットフォーム</p>
                <p>このメールは自動送信されています。返信はできません。</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${teamName}チームへの招待

こんにちは！

${inviterName}さんから${teamName}チームに招待されました。

招待詳細:
- チーム名: ${teamName}
- 招待者: ${inviterName}
- あなたの役割: ${getRoleDisplayName(role)}

以下のリンクをクリックして招待を受け入れ、チームに参加しましょう：
${inviteUrl}

※ この招待は7日間有効です。
※ このメールに心当たりがない場合は、このメールを無視してください。

TaskFlow - チーム協働プラットフォーム
      `
    });

    if (error) {
      console.error('Email sending error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`メール送信に失敗しました: ${error.message || JSON.stringify(error)}`);
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
    */
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    // メール送信無効化時も成功を返す
    return {
      success: true,
      data: { id: 'mock-email-id' },
      message: 'メール送信機能は現在無効化されています'
    };
  }
};

// 役割の表示名を取得
function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'owner': return 'オーナー';
    case 'admin': return '管理者';
    case 'member': return 'メンバー';
    case 'viewer': return '閲覧者';
    default: return 'メンバー';
  }
}

// 招待確認メール（招待者向け）
// 招待確認メール（現在無効化）
export const sendInvitationConfirmationEmail = async ({
  to,
  teamName,
  invitedEmail,
  role
}: {
  to: string;
  teamName: string;
  invitedEmail: string;
  role: string;
}) => {
  try {
    // TODO: メール送信機能は現在無効化されています
    console.log('確認メール送信スキップ:', { to, teamName, invitedEmail, role });
    
    // 成功レスポンスを返す（実際には送信しない）
    return {
      success: true,
      data: { id: 'mock-confirmation-email-id' },
      message: 'メール送信機能は現在無効化されています'
    };
    
    /*
    // 環境変数チェック
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Please set the API key in environment variables.');
    }
    
    const { data, error } = await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>', // 開発環境用ドメイン
      to: [to],
      subject: `招待を送信しました - ${teamName}`,
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>招待送信確認</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-card {
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 32px 24px;
              text-align: center;
            }
            .content {
              padding: 32px 24px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1>招待を送信しました</h1>
              </div>
              
              <div class="content">
                <p><strong>${invitedEmail}</strong> に${teamName}チームへの招待を送信しました。</p>
                
                <p><strong>役割:</strong> ${getRoleDisplayName(role)}</p>
                
                <p>相手が招待を受け入れると、チームメンバーとして追加されます。</p>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                  招待は7日間有効です。期限が切れた場合は、再度招待を送信してください。
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Confirmation email error:', error);
      throw new Error('確認メール送信に失敗しました');
    }

    return { success: true, data };
    */
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // メール送信無効化時も成功を返す
    return {
      success: true,
      data: { id: 'mock-confirmation-email-id' },
      message: 'メール送信機能は現在無効化されています'
    };
  }
};
