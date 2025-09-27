// import { createClient } from "@libsql/client/web"; // 一時的に無効化

// Tursoクライアントの設定（一時的に無効化）
export const turso = null;

// Mock implementations for build success

export async function initializeDatabase() {
  console.log('Database initialization skipped (Turso disabled)');
}

export async function getNotifications(userId: string) {
  console.log('getNotifications called but Turso disabled');
  return [];
}

export async function createNotification(userId: string, title: string, message?: string, type: string = 'info') {
  console.log('createNotification called but Turso disabled');
  return null;
}

export async function markNotificationAsRead(notificationId: number) {
  console.log('markNotificationAsRead called but Turso disabled');
  return false;
}

export async function markAllNotificationsAsRead(userId: string) {
  console.log('markAllNotificationsAsRead called but Turso disabled');
  return false;
}

export async function getUnreadNotificationCount(userId: string) {
  console.log('getUnreadNotificationCount called but Turso disabled');
  return 0;
}

export async function getProfile(userId: string) {
  console.log('getProfile called but Turso disabled');
  return null;
}

export async function updateProfile(userId: string, profileData: any) {
  console.log('updateProfile called but Turso disabled');
  return true;
}

export async function getSettings() {
  console.log('getSettings called but Turso disabled');
  return {};
}

export async function updateSettings(settingsData: any) {
  console.log('updateSettings called but Turso disabled');
  return true;
}

export async function getTasks(userId: string) {
  console.log('getTasks called but Turso disabled');
  return [];
}

export async function createTask(taskData: any) {
  console.log('createTask called but Turso disabled');
  return { id: 'mock-task-id', ...taskData };
}

export async function updateTask(taskId: string, taskData: any) {
  console.log('updateTask called but Turso disabled');
  return true;
}

export async function deleteTask(taskId: string) {
  console.log('deleteTask called but Turso disabled');
  return true;
}

export async function createSubtask(subtaskData: any) {
  console.log('createSubtask called but Turso disabled');
  return { id: 'mock-subtask-id', ...subtaskData };
}

export async function updateSubtask(subtaskId: string, updates: any) {
  console.log('updateSubtask called but Turso disabled');
  return true;
}

export async function deleteSubtask(subtaskId: string) {
  console.log('deleteSubtask called but Turso disabled');
  return true;
}

// Type definitions for compatibility
export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: string;
  endDate?: Date;
  endTime?: string;
  type?: 'task' | 'event';
  isAllDay?: boolean;
  location?: string;
  project?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubtaskData {
  id?: string;
  task_id: string;
  title: string;
  completed?: boolean;
}