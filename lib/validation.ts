import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Zodスキーマでバリデーション定義
export const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[+\-\s0-9()]*$/, 'Phone number contains invalid characters')
    .optional()
    .or(z.literal('')),
  
  country_code: z.string()
    .regex(/^\+[1-9]\d{0,3}$/, 'Invalid country code format'),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal(''))
});

export const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  
  priority: z.enum(['low', 'medium', 'high']),
  
  due_date: z.string()
    .datetime('Invalid date format')
    .optional()
    .or(z.literal('')),
  
  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .or(z.literal(''))
});

export const settingsSchema = z.object({
  dark_mode: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  task_reminders: z.boolean().optional(),
  weekly_report: z.boolean().optional(),
  language: z.enum(['ja', 'en']).optional()
});

// HTMLサニタイゼーション
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // HTMLタグを全て除去
    ALLOWED_ATTR: []
  });
}

// テキストサニタイゼーション（XSS防止）
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML文字を除去
    .replace(/javascript:/gi, '') // JavaScript URLを除去
    .replace(/on\w+=/gi, '') // イベントハンドラーを除去
    .trim();
}

// SQLインジェクション対策用エスケープ
export function escapeSqlInput(input: string): string {
  return input.replace(/'/g, "''"); // シングルクオートをエスケープ
}

// 統合バリデーション関数
export function validateAndSanitizeProfile(data: any) {
  // まずZodでバリデーション
  const result = profileSchema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }

  // サニタイゼーション
  const sanitized = {
    name: sanitizeText(result.data.name),
    email: result.data.email, // Emailは既にZodでバリデーション済み
    phone: result.data.phone ? sanitizeText(result.data.phone) : '',
    country_code: result.data.country_code,
    bio: result.data.bio ? sanitizeHtml(result.data.bio) : ''
  };

  return sanitized;
}

export function validateAndSanitizeTask(data: any) {
  const result = taskSchema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }

  return {
    title: sanitizeText(result.data.title),
    description: result.data.description ? sanitizeHtml(result.data.description) : '',
    priority: result.data.priority,
    due_date: result.data.due_date || null,
    category: result.data.category ? sanitizeText(result.data.category) : ''
  };
}

// パスワード強度チェック
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// IPアドレスのバリデーション
export function validateIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
