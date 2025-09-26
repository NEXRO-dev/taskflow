import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY environment variable is not set' 
      }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY === 're_your_api_key_here') {
      return NextResponse.json({ 
        error: 'Please replace RESEND_API_KEY with your actual API key' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ 
        error: 'testEmail is required' 
      }, { status: 400 });
    }

    // Resendクライアント初期化
    const resend = new Resend(process.env.RESEND_API_KEY);

    // テストメール送信
    const { data, error } = await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>',
      to: [testEmail],
      subject: 'Resend設定テスト - TaskFlow',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>設定テスト</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              color: #667eea;
              margin-bottom: 30px;
            }
            .success {
              background: #d4edda;
              color: #155724;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #28a745;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 設定テスト成功！</h1>
            </div>
            
            <div class="success">
              <strong>✅ Resend設定が正常に動作しています！</strong>
            </div>
            
            <p>こんにちは！</p>
            
            <p>TaskFlowアプリのResendメール送信設定が正常に完了しました。</p>
            
            <h3>設定内容：</h3>
            <ul>
              <li>✅ Resend APIキーが正しく設定されました</li>
              <li>✅ メール送信機能が動作しています</li>
              <li>✅ チーム招待メールの準備が整いました</li>
            </ul>
            
            <p>これで実際のチーム招待機能を使用できます！</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              TaskFlow - チーム協働プラットフォーム<br>
              このメールは設定テスト用に自動送信されました。
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
TaskFlow設定テスト

Resend設定が正常に動作しています！

設定内容：
- Resend APIキーが正しく設定されました
- メール送信機能が動作しています  
- チーム招待メールの準備が整いました

これで実際のチーム招待機能を使用できます！

TaskFlow - チーム協働プラットフォーム
      `
    });

    if (error) {
      console.error('Test email sending error:', error);
      return NextResponse.json({ 
        error: 'メール送信に失敗しました',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'テストメールを送信しました！',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({ 
      error: 'APIエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

