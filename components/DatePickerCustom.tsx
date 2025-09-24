'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
}

export default function DatePickerCustom({ value, onChange, label, placeholder, min }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Parse initial value
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // 月曜始まりに調整

    const days = [];
    
    // 前月の日付を追加
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // 今月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // 次月の日付を追加（42個になるまで）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return value && date.toDateString() === selectedDate.toDateString();
  };

  const isDisabled = (date: Date): boolean => {
    if (min) {
      const minDate = new Date(min);
      return date < minDate;
    }
    return false;
  };

  const quickDates = [
    { label: '今日', date: new Date() },
    { label: '明日', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: '来週', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  ];

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
  const monthDays = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className={`${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {value ? formatDisplayDate(selectedDate) : (placeholder || '日付を選択')}
            </span>
          </div>
          <Calendar className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <>
            {/* オーバーレイ */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* カレンダー */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              <div className="p-4">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <h3 className="font-medium text-gray-900">
                    {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">{day}</span>
                    </div>
                  ))}
                </div>

                {/* 日付グリッド */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {monthDays.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled(day.date) && handleDateSelect(day.date)}
                      disabled={isDisabled(day.date)}
                      className={`
                        h-8 w-8 text-sm rounded-lg transition-all flex items-center justify-center
                        ${!day.isCurrentMonth 
                          ? 'text-gray-300 hover:bg-gray-50' 
                          : isSelected(day.date)
                          ? 'bg-gray-900 text-white'
                          : isToday(day.date)
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : isDisabled(day.date)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {day.date.getDate()}
                    </button>
                  ))}
                </div>

                {/* クイック選択 */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">よく使う日付</div>
                  <div className="grid grid-cols-3 gap-2">
                    {quickDates.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (!isDisabled(item.date)) {
                            handleDateSelect(item.date);
                          }
                        }}
                        disabled={isDisabled(item.date)}
                        className="px-3 py-1.5 text-xs rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 完了ボタン */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    完了
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setCurrentMonth(today);
                      onChange(formatDate(today));
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg"
                  >
                    今日
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
