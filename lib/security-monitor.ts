// セキュリティ監視とログ機能
import { NextRequest } from 'next/server';

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_REQUEST = 'suspicious_request',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  INVALID_INPUT = 'invalid_input',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt'
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  ip: string;
  userAgent: string;
  userId?: string;
  endpoint: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private suspiciousIPs = new Map<string, number>();
  private blockedIPs = new Set<string>();

  // セキュリティイベントをログに記録
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);
    
    // コンソールにログ出力
    console.warn(`[SECURITY ALERT] ${event.type}:`, {
      ip: event.ip,
      endpoint: event.endpoint,
      severity: event.severity,
      details: event.details
    });

    // 重要度が高い場合の追加処理
    if (event.severity === 'high' || event.severity === 'critical') {
      this.handleHighSeverityEvent(securityEvent);
    }

    // 古いログをクリア（メモリ節約）
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }
  }

  // 高重要度イベントの処理
  private handleHighSeverityEvent(event: SecurityEvent) {
    // IPアドレスを監視対象に追加
    const count = this.suspiciousIPs.get(event.ip) || 0;
    this.suspiciousIPs.set(event.ip, count + 1);

    // 一定回数を超えたらブロック
    if (count >= 5) {
      this.blockedIPs.add(event.ip);
      console.error(`[SECURITY] IP ${event.ip} has been blocked due to repeated security violations`);
    }
  }

  // IPアドレスがブロックされているかチェック
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // 疑わしいリクエストかどうかをチェック
  isSuspiciousRequest(request: NextRequest): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.url;

    // 疑わしいUser-Agent
    const suspiciousUserAgents = [
      'sqlmap', 'nmap', 'nikto', 'burp', 'dirbuster', 'gobuster',
      'python-requests', 'curl', 'wget'
    ];
    
    if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      reasons.push('Suspicious user agent detected');
    }

    // SQLインジェクション試行の検出
    const sqlInjectionPatterns = [
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /'\s*or\s*'/i,
      /admin'\s*--/i,
      /drop\s+table/i,
      /insert\s+into/i
    ];

    if (sqlInjectionPatterns.some(pattern => pattern.test(url))) {
      reasons.push('SQL injection attempt detected');
    }

    // XSS試行の検出
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i
    ];

    if (xssPatterns.some(pattern => pattern.test(url))) {
      reasons.push('XSS attempt detected');
    }

    // パストラバーサル試行の検出
    if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
      reasons.push('Path traversal attempt detected');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  // 最近のセキュリティイベントを取得
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  // セキュリティ統計を取得
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    blockedIPs: number;
    suspiciousIPs: number;
  } {
    const eventsByType: Record<string, number> = {};
    
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      eventsByType,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size
    };
  }

  // IPアドレスのブロックを解除（管理者用）
  unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }

  // 定期クリーンアップ
  cleanup() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // 24時間以上古いイベントを削除
    this.events = this.events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return (now - eventTime) < oneDay;
    });

    // 疑わしいIPのカウントをリセット（24時間後）
    this.suspiciousIPs.clear();
  }
}

// シングルトンインスタンス
export const securityMonitor = new SecurityMonitor();

// リクエストからセキュリティ情報を抽出
export function extractSecurityInfo(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const endpoint = request.nextUrl.pathname;

  return { ip, userAgent, endpoint };
}

// セキュリティヘルパー関数
export function logSecurityEvent(
  request: NextRequest,
  type: SecurityEventType,
  details: string,
  severity: SecurityEvent['severity'] = 'medium',
  blocked: boolean = false,
  userId?: string
) {
  const { ip, userAgent, endpoint } = extractSecurityInfo(request);
  
  securityMonitor.logSecurityEvent({
    type,
    ip,
    userAgent,
    endpoint,
    details,
    severity,
    blocked,
    userId
  });
}

// 定期クリーンアップを設定
setInterval(() => {
  securityMonitor.cleanup();
}, 3600000); // 1時間ごと
