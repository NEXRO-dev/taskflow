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

  // 開発用: 特定のIPのレート制限をリセット
  resetIP(ip: string) {
    delete this.store[ip];
  }

  // 開発用: 全てのレート制限をリセット
  resetAll() {
    this.store = {};
  }
}

// 異なる用途に応じたレート制限設定
// 開発環境では制限を緩和
const isDevelopment = process.env.NODE_ENV === 'development';

export const generalLimiter = new RateLimiter(60000, isDevelopment ? 1000 : 100); // 開発時: 1分間に1000リクエスト、本番: 100リクエスト
export const authLimiter = new RateLimiter(900000, isDevelopment ? 50 : 5); // 開発時: 15分間に50回、本番: 5回
export const apiLimiter = new RateLimiter(60000, isDevelopment ? 500 : 50); // 開発時: 1分間に500リクエスト、本番: 50リクエスト

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

// 開発用: Rate Limitをリセットする関数
export function resetRateLimits() {
  generalLimiter.resetAll();
  authLimiter.resetAll();
  apiLimiter.resetAll();
  console.log('Rate limits reset for development');
}

// 定期クリーンアップを設定
setInterval(() => {
  generalLimiter.cleanup();
  authLimiter.cleanup();
  apiLimiter.cleanup();
}, 300000); // 5分ごと
