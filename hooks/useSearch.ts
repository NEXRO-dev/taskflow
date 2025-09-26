import { useState, useMemo, useCallback } from 'react';
import { useTaskStore } from '@/lib/store';
import type { Task, Project } from '@/lib/store';

export interface SearchResult {
  type: 'task' | 'event' | 'project';
  id: string;
  title: string;
  description?: string;
  score: number; // 検索スコア（関連度）
  originalItem: Task | Project;
}

export interface SearchFilters {
  includeCompleted: boolean;
  priority?: 'low' | 'medium' | 'high';
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: 'task' | 'event' | 'project' | 'all';
}

export function useSearch() {
  const { tasks, projects } = useTaskStore();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    includeCompleted: false,
    type: 'all',
  });
  const [isSearching, setIsSearching] = useState(false);

  // 検索ロジック
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // タスク・予定検索
    if (filters.type === 'all' || filters.type === 'task' || filters.type === 'event') {
      tasks.forEach(task => {
        // タイプフィルター（予定とタスクを分ける）
        if (filters.type === 'task' && task.type !== 'task') return;
        if (filters.type === 'event' && task.type !== 'event') return;
        
        // 完了済みタスクの除外（予定には完了状態がないので、タスクのみ適用）
        if (task.type === 'task' && !filters.includeCompleted && task.completed) return;
        
        // 優先度フィルター（タスクのみ適用）
        if (task.type === 'task' && filters.priority && task.priority !== filters.priority) return;
        
        // 日付範囲フィルター
        if (filters.dateRange) {
          const itemDate = task.dueDate || task.createdAt;
          if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) return;
        }

        let score = 0;
        const title = task.title.toLowerCase();
        const description = task.description?.toLowerCase() || '';
        const project = task.project?.toLowerCase() || '';
        const location = task.location?.toLowerCase() || '';

        // タイトルでの完全一致（最高スコア）
        if (title === searchTerm) score += 100;
        // タイトルでの部分一致
        else if (title.includes(searchTerm)) score += 50;
        // タイトルでの単語一致
        else if (title.split(' ').some(word => word.includes(searchTerm))) score += 30;

        // 説明での一致
        if (description.includes(searchTerm)) score += 20;
        
        // プロジェクト名での一致
        if (project.includes(searchTerm)) score += 15;

        // 場所での一致（予定の場合）
        if (task.type === 'event' && location.includes(searchTerm)) score += 15;

        // サブタスクでの一致（タスクのみ）
        if (task.type === 'task') {
          task.subtasks.forEach(subtask => {
            if (subtask.title.toLowerCase().includes(searchTerm)) score += 10;
          });
        }

        if (score > 0) {
          results.push({
            type: task.type, // 'task' または 'event'
            id: task.id,
            title: task.title,
            description: task.description,
            score,
            originalItem: task,
          });
        }
      });
    }

    // プロジェクト検索
    if (filters.type === 'all' || filters.type === 'project') {
      projects.forEach(project => {
        let score = 0;
        const name = project.name.toLowerCase();
        const description = project.description?.toLowerCase() || '';

        // プロジェクト名での完全一致
        if (name === searchTerm) score += 100;
        // プロジェクト名での部分一致
        else if (name.includes(searchTerm)) score += 50;
        // プロジェクト名での単語一致
        else if (name.split(' ').some(word => word.includes(searchTerm))) score += 30;

        // 説明での一致
        if (description.includes(searchTerm)) score += 20;

        if (score > 0) {
          results.push({
            type: 'project',
            id: project.id,
            title: project.name,
            description: project.description,
            score,
            originalItem: project,
          });
        }
      });
    }

    // スコアでソート
    return results.sort((a, b) => b.score - a.score);
  }, [query, tasks, projects, filters]);

  // 検索実行
  const performSearch = useCallback((searchQuery: string) => {
    setIsSearching(true);
    setQuery(searchQuery);
    
    // 検索処理をシミュレート（実際のAPIコールの場合はここで実行）
    setTimeout(() => {
      setIsSearching(false);
    }, 100);
  }, []);

  // 検索クリア
  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
  }, []);

  // フィルター更新
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 検索候補（オートコンプリート用）
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const allTerms = new Set<string>();

    // タスクタイトルから候補を抽出
    tasks.forEach(task => {
      const words = task.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.includes(searchTerm) && word.length > 2) {
          allTerms.add(word);
        }
      });
    });

    // プロジェクト名から候補を抽出
    projects.forEach(project => {
      const words = project.name.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.includes(searchTerm) && word.length > 2) {
          allTerms.add(word);
        }
      });
    });

    return Array.from(allTerms).slice(0, 5);
  }, [query, tasks, projects]);

  // 統計情報
  const searchStats = useMemo(() => {
    return {
      totalResults: searchResults.length,
      taskResults: searchResults.filter(r => r.type === 'task').length,
      eventResults: searchResults.filter(r => r.type === 'event').length,
      projectResults: searchResults.filter(r => r.type === 'project').length,
    };
  }, [searchResults]);

  return {
    query,
    searchResults,
    suggestions,
    searchStats,
    filters,
    isSearching,
    performSearch,
    clearSearch,
    updateFilters,
    setQuery,
  };
}

export default useSearch;
