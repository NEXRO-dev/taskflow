'use client';

import { Fragment } from 'react';
import { CheckSquare, FolderOpen, Calendar, Clock, User, Star, MapPin } from 'lucide-react';
import { SearchResult } from '@/hooks/useSearch';
import { Task, Project } from '@/lib/store';

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
  isVisible: boolean;
  query: string;
}

export default function SearchResults({ 
  results, 
  onResultClick, 
  onClose, 
  isVisible, 
  query 
}: SearchResultsProps) {
  if (!isVisible || !query.trim()) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            検索結果: "{query}"
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {results.length}件
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      {/* 検索結果 */}
      <div className="py-2">
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-400 mb-2">
              <CheckSquare className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">
              「{query}」に関する結果が見つかりませんでした
            </p>
            <p className="text-xs text-gray-400 mt-1">
              キーワードを変更して再度お試しください
            </p>
          </div>
        ) : (
          results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              onClick={() => onResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                {/* アイコン */}
                <div className="flex-shrink-0 mt-0.5">
                  {result.type === 'task' ? (
                    <CheckSquare className={`h-4 w-4 ${
                      (result.originalItem as Task).completed 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }`} />
                  ) : result.type === 'event' ? (
                    <Calendar className="h-4 w-4 text-purple-600" />
                  ) : (
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  )}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {highlightText(result.title, query)}
                    </h4>
                    
                    {/* タイプバッジ */}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      result.type === 'task' 
                        ? 'bg-green-100 text-green-700' 
                        : result.type === 'event'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {result.type === 'task' ? 'タスク' : result.type === 'event' ? '予定' : 'プロジェクト'}
                    </span>

                    {/* スコア表示（デバッグ用） */}
                    {process.env.NODE_ENV === 'development' && (
                      <span className="text-xs text-gray-400">
                        {result.score}
                      </span>
                    )}
                  </div>

                  {/* 説明 */}
                  {result.description && (
                    <p className="text-xs text-gray-600 truncate mb-2">
                      {highlightText(result.description, query)}
                    </p>
                  )}

                  {/* メタ情報 */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {result.type === 'task' && (
                      <>
                        {/* 優先度 */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          getPriorityColor((result.originalItem as Task).priority)
                        }`}>
                          {(result.originalItem as Task).priority === 'high' ? '高' :
                           (result.originalItem as Task).priority === 'medium' ? '中' : '低'}
                        </span>

                        {/* 期限 */}
                        {(result.originalItem as Task).dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate((result.originalItem as Task).dueDate!)}
                            </span>
                          </div>
                        )}

                        {/* プロジェクト */}
                        {(result.originalItem as Task).project && (
                          <div className="flex items-center space-x-1">
                            <FolderOpen className="h-3 w-3" />
                            <span className="truncate">
                              {(result.originalItem as Task).project}
                            </span>
                          </div>
                        )}

                        {/* 完了状態 */}
                        {(result.originalItem as Task).completed && (
                          <span className="text-green-600 font-medium">
                            ✓ 完了
                          </span>
                        )}
                      </>
                    )}

                    {result.type === 'event' && (
                      <>
                        {/* 開始日時 */}
                        {(result.originalItem as Task).dueDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDate((result.originalItem as Task).dueDate!)}
                              {(result.originalItem as Task).dueTime && ` ${(result.originalItem as Task).dueTime}`}
                            </span>
                          </div>
                        )}

                        {/* 終了日時 */}
                        {(result.originalItem as Task).endDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate((result.originalItem as Task).endDate!)}
                              {(result.originalItem as Task).endTime && ` ${(result.originalItem as Task).endTime}`}
                            </span>
                          </div>
                        )}

                        {/* 場所 */}
                        {(result.originalItem as Task).location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {(result.originalItem as Task).location}
                            </span>
                          </div>
                        )}

                      </>
                    )}

                    {result.type === 'project' && (
                      <>
                        {/* 作成日 */}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate((result.originalItem as Project).createdAt)}
                          </span>
                        </div>

                        {/* ステータス */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (result.originalItem as Project).status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : (result.originalItem as Project).status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {(result.originalItem as Project).status === 'active' ? 'アクティブ' :
                           (result.originalItem as Project).status === 'completed' ? '完了' : '一時停止'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 関連度インジケーター */}
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(result.score / 20)) }).map((_, i) => (
                      <Star key={i} className="h-2 w-2 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* フッター */}
      {results.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                タスク: {results.filter(r => r.type === 'task').length}件
              </span>
              <span>
                予定: {results.filter(r => r.type === 'event').length}件
              </span>
              <span>
                プロジェクト: {results.filter(r => r.type === 'project').length}件
              </span>
            </div>
            <div className="text-right">
              <span>Enter で選択 / Esc で閉じる</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
