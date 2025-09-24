import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clerkの設定が存在するかを判定するユーティリティ
export function isClerkConfigured(): boolean {
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  
  if (!publishable || !secret) return false;
  const looksLikePk = publishable.startsWith('pk_');
  const looksLikeSk = secret.startsWith('sk_');
  return looksLikePk && looksLikeSk;
}
