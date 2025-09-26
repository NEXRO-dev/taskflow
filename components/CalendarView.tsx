'use client';

import { useState } from 'react';
import { useTaskStore } from '@/lib/store';
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isToday, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, X, CheckCircle, Flag } from 'lucide-react';

export default function CalendarView() {
  const { getAllItems, toggleTask } = useTaskStore();
  const items = getAllItems();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 色に応じたスタイルを取得する関数
  const getEventColorStyles = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-500';
      case 'pink':
        return 'bg-pink-100 text-pink-800 border-pink-500';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-500';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-500';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-500'; // デフォルトは青
    }
  };

  // 月間カレンダーの日付を取得（月曜始まり）
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // 月名のヘッダーを作成
  const getMonthHeader = () => {
    return format(currentMonth, 'yyyy年M月');
  };

  // 指定日のアイテムを取得
  const getItemsForDate = (date: Date) => {
    const targetDateString = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    return items.filter(item => {
      if (!item.dueDate) return false;
      const itemDateString = item.dueDate.getFullYear() + '-' + 
        String(item.dueDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(item.dueDate.getDate()).padStart(2, '0');
      return itemDateString === targetDateString;
    });
  };

  // 月移動
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  // 今月に戻る
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(null);
  };

  const weekDayNames = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              今月
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {getMonthHeader()}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-7">
            {weekDayNames.map((day) => (
              <div key={day} className="py-3 px-4 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-sm font-medium text-gray-500">{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 月間グリッド */}
        <div className="flex-1 bg-white">
          <div className="grid grid-cols-7 h-full" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
            {calendarDays.map((day, index) => {
              const dayItems = getItemsForDate(day);
              const events = dayItems.filter(item => item.type === 'event');
              const tasks = dayItems.filter(item => item.type === 'task');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                            <div
                              key={day.toISOString()}
                              className={`border-r border-b border-gray-200 last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col relative ${
                                isToday(day) ? 'bg-blue-50' : !isCurrentMonth ? 'bg-gray-50' : ''
                              }`}
                              onClick={() => setSelectedDate(day)}
                            >
                              {/* 日付表示 */}
                              <div className={`text-sm font-medium mb-1 ${
                                isToday(day) ? 'text-blue-600 font-bold' : 
                                !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {format(day, 'd')}
                              </div>

                              {/* タスクがある場合のバッジ表示（右上） */}
                              {tasks.length > 0 && (
                                <div className="absolute top-1.5 right-1.5">
                                  <div 
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium shadow-sm border ${
                                      tasks.filter(t => t.completed).length === tasks.length
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : tasks.filter(t => t.completed).length > 0
                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}
                                    title={`タスク${tasks.length}件 (完了: ${tasks.filter(t => t.completed).length}件)`}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>{tasks.length}</span>
                                  </div>
                                </div>
                              )}

                  <div className="space-y-1 flex-1 min-h-0">
                                {/* 予定のみ表示（最大4件） */}
                                {events.slice(0, 4).map((event) => (
                                  <div
                                    key={event.id}
                                    className={`px-2 py-1 rounded text-xs font-medium truncate border-l-2 ${getEventColorStyles(event.color)}`}
                                  >
                                    <div className="truncate">
                                      {!event.isAllDay && event.dueTime ? `${event.dueTime} ` : ''}
                                      {event.title}
                                    </div>
                                  </div>
                                ))}
                    
                    {/* 下部の情報表示 */}
                    <div className="flex items-center justify-end mt-auto pt-1">
                      {/* 表示しきれない予定がある場合 */}
                      {events.length > 4 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{events.length - 4}件
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 選択された日付の詳細モーダル */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(() => {
                const dayItems = getItemsForDate(selectedDate);
                const events = dayItems.filter(item => item.type === 'event');
                const tasks = dayItems.filter(item => item.type === 'task');

                if (dayItems.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">この日に予定やタスクはありません</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {/* 左側：予定 */}
                    <div className="flex flex-col">
                      <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        予定 ({events.length}件)
                      </h4>
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {events.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">予定はありません</p>
                          </div>
                        ) : (
                          events.map((event) => (
                            <div key={event.id} className={`p-3 rounded-lg border ${
                              event.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                              event.color === 'green' ? 'bg-green-50 border-green-200' :
                              event.color === 'red' ? 'bg-red-50 border-red-200' :
                              event.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                              event.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                              event.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                              event.color === 'pink' ? 'bg-pink-50 border-pink-200' :
                              event.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' :
                              event.color === 'gray' ? 'bg-gray-50 border-gray-200' :
                              'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm">{event.title}</h5>
                                  {event.description && (
                                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                  )}
                                  
                                  <div className="flex flex-col space-y-1 mt-2 text-xs text-gray-600">
                                    {event.dueTime && !event.isAllDay && (
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {event.dueTime}
                                        {event.endTime && ` - ${event.endTime}`}
                                      </span>
                                    )}
                                    
                                    {event.location && (
                                      <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {event.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* 右側：タスク */}
                    <div className="flex flex-col">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        タスク ({tasks.length}件)
                      </h4>
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {tasks.length === 0 ? (
                          <div className="text-center py-8">
                            <Flag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">タスクはありません</p>
                          </div>
                        ) : (
                          tasks.map((task) => (
                            <div key={task.id} className={`p-3 rounded-lg border ${
                              task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTask(task.id);
                                  }}
                                  className="mt-1 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  {task.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors"></div>
                                  )}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <h5 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </h5>
                                  {task.description && (
                                    <p className="text-xs text-gray-600 mt-1 truncate">{task.description}</p>
                                  )}
                                  
                                  <div className="flex flex-col space-y-1 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full self-start ${
                                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      <Flag className="h-3 w-3 inline mr-1" />
                                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                                    </span>
                                    
                                    {task.dueTime && (
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {task.dueTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}