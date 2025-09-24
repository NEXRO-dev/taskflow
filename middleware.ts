import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { withRateLimit, apiLimiter, authLimiter, generalLimiter } from './lib/rate-limit';
import { securityMonitor, SecurityEventType, logSecurityEvent, extractSecurityInfo } from './lib/security-monitor';

// 保護されたルートを定義
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/profile(.*)',
  '/api/settings(.*)',
  '/api/security(.*)'
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // 保護されたルートへのアクセス時は認証チェック
  // ただし、Clerkが設定されていない場合はスキップ（無限ループ防止）
  if (isProtectedRoute(request)) {
    // 環境変数を直接チェック（isClerkConfiguredを使うとここでもループの可能性）
    const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY;
    
    if (hasClerkKeys) {
      const { userId } = await auth();
      if (!userId) {
        const signInUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  // 開発環境では一部のセキュリティチェックをスキップ
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDevAPI = request.nextUrl.pathname.startsWith('/api/dev/');
  
  // 開発用APIは全てのセキュリティチェックをスキップ
  if (isDevelopment && isDevAPI) {
    const response = NextResponse.next();
    return response;
  }

  const { ip } = extractSecurityInfo(request);

  // 開発環境では疑わしいリクエストチェックをスキップ
  if (!isDevelopment) {
    // ブロックされたIPをチェック
    if (securityMonitor.isIPBlocked(ip)) {
      logSecurityEvent(
        request,
        SecurityEventType.UNAUTHORIZED_ACCESS,
        'Request from blocked IP address',
        'critical',
        true
      );
      
      return new Response('Access Denied', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 疑わしいリクエストをチェック
    const suspiciousCheck = securityMonitor.isSuspiciousRequest(request);
    if (suspiciousCheck.suspicious) {
      const eventType = suspiciousCheck.reasons.includes('SQL injection') ? 
        SecurityEventType.SQL_INJECTION_ATTEMPT :
        suspiciousCheck.reasons.includes('XSS') ?
        SecurityEventType.XSS_ATTEMPT :
        SecurityEventType.SUSPICIOUS_REQUEST;

      logSecurityEvent(
        request,
        eventType,
        `Suspicious request: ${suspiciousCheck.reasons.join(', ')}`,
        'high',
        true
      );

      return new Response('Suspicious Request Blocked', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  const response = NextResponse.next();

  // セキュリティヘッダーを設定
  const securityHeaders = {
    // XSS攻撃を防ぐ
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // HTTPS強制
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.taskflow-pro.com https://*.clerk.accounts.dev https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://clerk.taskflow-pro.com https://*.clerk.accounts.dev https://api.clerk.com wss://ws-us3.pusher.com https://*.turso.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // リファラーポリシー
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // 権限ポリシー
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // クロスオリジンポリシー
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };

  // セキュリティヘッダーを設定
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate Limiting
  const pathname = request.nextUrl.pathname;
  
          // 認証関連のエンドポイント（サインインのみ）
          if (pathname.includes('/sign-in')) {
    const rateCheck = await withRateLimit(request, authLimiter);
    if (!rateCheck.success) {
      logSecurityEvent(
        request,
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        'Authentication endpoint rate limit exceeded',
        'medium',
        true
      );
      return rateCheck.response!;
    }
  }
  
  // API エンドポイント
  else if (pathname.startsWith('/api/')) {
    const rateCheck = await withRateLimit(request, apiLimiter);
    if (!rateCheck.success) {
      logSecurityEvent(
        request,
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        'API endpoint rate limit exceeded',
        'medium',
        true
      );
      return rateCheck.response!;
    }
  }
  
  // 一般ページ
  else {
    const rateCheck = await withRateLimit(request, generalLimiter);
    if (!rateCheck.success) {
      logSecurityEvent(
        request,
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        'General page rate limit exceeded',
        'low',
        true
      );
      return rateCheck.response!;
    }
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
