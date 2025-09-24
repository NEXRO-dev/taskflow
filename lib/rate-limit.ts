// Rate Limiting for API endpoints
import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  public maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs; // 1分間
    this.maxRequests = maxRequests; // 最大リクエスト数
  }

  // IPアドレスまたはユーザーIDでレート制限をチェック
  async checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = identifier;

    // 既存のレコードをチェック
    if (!this.store[key] || now > this.store[key].resetTime) {
      // 新しいウィンドウまたは期限切れ
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }

    // リクエスト数をチェック
    if (this.store[key].count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      };
    }

    // リクエスト数を増やす
    this.store[key].count++;
    return {
      success: true,
      remaining: this.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }

  // 古いエントリを定期的にクリア
  cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// 異なる用途に応じたレート制限設定
export const generalLimiter = new RateLimiter(60000, 100); // 1分間に100リクエスト
export const authLimiter = new RateLimiter(900000, 5); // 15分間に5回（ログイン試行）
export const apiLimiter = new RateLimiter(60000, 50); // API用: 1分間に50リクエスト

// リクエストからIPアドレスを取得
export function getClientIP(request: NextRequest): string {
  // Vercelの場合
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // フォールバック
  return request.headers.get('x-real-ip') || 
         request.headers.get('remote-addr') || 
         '127.0.0.1';
}

// レート制限ミドルウェア
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): Promise<{ success: boolean; response?: Response }> {
  const clientId = identifier || getClientIP(request);
  const result = await limiter.checkRateLimit(clientId);

  if (!result.success) {
    const response = new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: result.resetTime
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limiter.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
    return { success: false, response };
  }

  return { success: true };
}

// 定期クリーンアップを設定
setInterval(() => {
  generalLimiter.cleanup();
  authLimiter.cleanup();
  apiLimiter.cleanup();
}, 300000); // 5分ごと
