'use client';

import { useState } from 'react';
// import { motion } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { useTaskStore } from '@/lib/store';
import { format, isSameDay } from 'date-fns';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function CalendarView() {
  const { tasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tasksWithDates = tasks.filter(task => task.dueDate);
  
  const getTasksForDate = (date: Date) => {
    return tasksWithDates.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getDaysWithTasks = () => {
    return tasksWithDates.map(task => new Date(task.dueDate!));
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const modifiers = {
    hasTask: getDaysWithTasks(),
  };

  const modifiersStyles = {
    hasTask: {
      backgroundColor: 'rgb(59 130 246 / 0.1)',
      color: 'rgb(59 130 246)',
      fontWeight: 'bold',
    },
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">タスクカレンダー</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="calendar-custom"
              showOutsideDays
            />
          </div>

          {/* Selected Date Tasks */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate ? format(selectedDate, 'yyyy年M月d日') : '日付を選択してください'}
            </h3>

            {selectedDate && selectedDateTasks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">この日にスケジュールされたタスクはありません</p>
              </div>
            )}

            {/* スクロール可能なタスクリスト - カレンダーの高さに合わせる */}
            <div className="flex-1 max-h-[280px] overflow-y-auto space-y-3 pr-2">
              {selectedDateTasks.map((task, index) => {
                const isOverdue = new Date(task.dueDate!) < new Date() && !task.completed;
                const isToday = isSameDay(new Date(task.dueDate!), new Date());
                
                return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.completed
                      ? 'bg-green-50 border-green-500'
                      : isOverdue
                      ? 'bg-red-50 border-red-500'
                      : isToday
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.completed ? 'line-through text-green-700' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {task.priority === 'high' ? '高優先' : task.priority === 'medium' ? '中優先' : '低優先'}
                        </span>
                        
                        {task.dueTime && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{task.dueTime}</span>
                          </div>
                        )}
                        
                        <span className="text-xs text-blue-600 font-medium">
                          +{task.xpValue} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Task Distribution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: '総タスク数',
            value: tasksWithDates.length,
            icon: Calendar,
            color: 'blue'
          },
          {
            label: '完了',
            value: tasksWithDates.filter(t => t.completed).length,
            icon: CheckCircle,
            color: 'green'
          },
          {
            label: '今日期限',
            value: tasksWithDates.filter(t => !t.completed && isSameDay(new Date(t.dueDate!), new Date())).length,
            icon: Clock,
            color: 'amber'
          },
          {
            label: '期限切れ',
            value: tasksWithDates.filter(t => !t.completed && new Date(t.dueDate!) < new Date()).length,
            icon: AlertTriangle,
            color: 'red'
          }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'
              }`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}