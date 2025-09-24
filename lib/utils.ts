import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clerkの設定が存在するかを判定するユーティリティ
export function isClerkConfigured(): boolean {
  // クライアントサイドではNEXT_PUBLIC_のみアクセス可能
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // クライアントサイドでは公開キーのみで判定
  if (typeof window !== 'undefined') {
    return !!(publishable && publishable.startsWith('pk_'));
  }
  
  // サーバーサイドでは両方チェック
  const secret = process.env.CLERK_SECRET_KEY;
  if (!publishable || !secret) return false;
  const looksLikePk = publishable.startsWith('pk_');
  const looksLikeSk = secret.startsWith('sk_');
  return looksLikePk && looksLikeSk;
}
