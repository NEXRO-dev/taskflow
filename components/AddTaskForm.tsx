'use client';

import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed animations
import { useTaskStore } from '@/lib/store';
import { Plus, X, Calendar, Flag, Mic, MicOff } from 'lucide-react';

export default function AddTaskForm() {
  const { addTask, currentView } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState<number | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);

  // Voice recognition
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('このブラウザでは音声認識はサポートされていません');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      
      // Simple NLP parsing
      let parsedTitle = transcript;
      let parsedPriority: 'low' | 'medium' | 'high' = 'medium';
      let parsedDate = '';
      
      // Priority detection
      if (transcript.includes('緊急') || transcript.includes('重要') || transcript.includes('高優先')) {
        parsedPriority = 'high';
      } else if (transcript.includes('低優先') || transcript.includes('後で') || transcript.includes('時間がある時')) {
        parsedPriority = 'low';
      }
      
      // Date detection
      const dateRegex = /(明日|今日|来週|月曜日|火曜日|水曜日|木曜日|金曜日|土曜日|日曜日)/;
      const dateMatch = transcript.match(dateRegex);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        const today = new Date();
        
        if (dateStr === '明日') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          parsedDate = tomorrow.toISOString().split('T')[0];
        } else if (dateStr === '今日') {
          parsedDate = today.toISOString().split('T')[0];
        }
        
        // Remove date from title
        parsedTitle = transcript.replace(dateRegex, '').trim();
      }

      // Time detection
      const timeRegex = /(\d{1,2}時|\d{1,2}:\d{2}|午前\d{1,2}時|午後\d{1,2}時)/;
      const timeMatch = transcript.match(timeRegex);
      if (timeMatch) {
        const timeStr = timeMatch[1];
        let parsedTime = '';
        
        if (timeStr.includes('時')) {
          const hour = parseInt(timeStr.replace(/[午前午後時]/g, ''));
          const isAfternoon = timeStr.includes('午後');
          const finalHour = isAfternoon && hour < 12 ? hour + 12 : hour;
          parsedTime = `${finalHour.toString().padStart(2, '0')}:00`;
        } else if (timeStr.includes(':')) {
          parsedTime = timeStr;
        }
        
        if (parsedTime) {
          setDueTime(parsedTime);
          // Remove time from title
          parsedTitle = parsedTitle.replace(timeRegex, '').trim();
        }
      }
      
      setTitle(parsedTitle);
      setPriority(parsedPriority);
      if (parsedDate) setDueDate(parsedDate);
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit called', { step, title });
    
    // ステップ3の時のみタスクを作成
    if (step !== 3) {
      console.log('Not step 3, returning');
      return;
    }
    
    if (!title.trim()) {
      console.log('No title, returning');
      return;
    }

    console.log('Creating task with data:', {
      title,
      description,
      priority,
      dueDate,
      dueTime,
      reminder
    });

    addTask({
      title,
      description,
      completed: false,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dueTime: dueTime || undefined,
      reminder: reminder || undefined,
      subtasks: []
    });

    console.log('Task created, resetting form');

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setDueTime('');
    setReminder(undefined);
    setStep(1);
    setIsOpen(false);
  };


  const openModal = () => {
    setIsOpen(true);
    setStep(1);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // グローバル関数を追加して外部からアクセス可能にする
  useEffect(() => {
    // グローバル関数を定義（常に詳細フォームを開く）
    (window as any).openTaskForm = () => {
      setIsOpen(true);
      setStep(1);
    };

    (window as any).openDetailedTaskForm = () => {
      setIsOpen(true);
      setStep(1);
    };

    // イベントリスナーも設定（常に詳細フォームを開く）
    const handleOpenTaskForm = () => {
      setIsOpen(true);
      setStep(1);
    };

    const handleOpenDetailedTaskForm = () => {
      setIsOpen(true);
      setStep(1);
    };

    window.addEventListener('openTaskForm', handleOpenTaskForm);
    window.addEventListener('openDetailedTaskForm', handleOpenDetailedTaskForm);
    
    return () => {
      window.removeEventListener('openTaskForm', handleOpenTaskForm);
      window.removeEventListener('openDetailedTaskForm', handleOpenDetailedTaskForm);
      // グローバル関数をクリーンアップ
      delete (window as any).openTaskForm;
      delete (window as any).openDetailedTaskForm;
    };
  }, []);

  return (
    <>

      {/* Floating Add Button - Hidden on settings page */}
      {currentView !== 'settings' && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
          <button
            onClick={() => {
              setIsOpen(true);
              setStep(1);
            }}
            className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <Plus className={`h-5 w-5 md:h-6 md:w-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className="fixed inset-x-4 top-20 bottom-4 md:inset-x-8 md:top-24 md:bottom-8 lg:inset-auto lg:top-auto lg:bottom-24 lg:right-8 lg:left-auto lg:w-96 bg-white rounded-xl border border-gray-200 shadow-xl p-4 md:p-6 z-50 max-w-md lg:max-w-none w-full max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-12rem)] overflow-y-auto"
          >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">新しいタスクを追加</h2>
                  <div className="flex items-center space-x-1 mt-2">
                    {[1, 2, 3].map((stepNumber) => (
                      <div
                        key={stepNumber}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          step >= stepNumber ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step Content */}
                <div className="min-h-[200px]">
                  {step === 1 && (
                    <div className="space-y-4">
                    
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">タスクの内容は？</h3>
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && title.trim()) {
                                  e.preventDefault();
                                  nextStep();
                                }
                              }}
                              placeholder="例：プレゼン資料を作成する"
                              className="w-full px-4 py-3 pr-12 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={startVoiceInput}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                                isListening 
                                  ? 'text-red-500 bg-red-50 animate-pulse' 
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </button>
                          </div>
                          {isListening && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span>音声認識中...</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                    
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細（任意）</h3>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              nextStep();
                            }
                          }}
                          placeholder="タスクの詳細や注意点があれば入力してください... (Ctrl+Enterで次へ)"
                          rows={4}
                          className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                    
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">設定</h3>
                        <div className="space-y-6">
                          {/* 優先度 */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">優先度</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['low', 'medium', 'high'] as const).map((level, idx) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setPriority(level)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    priority === level
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {['低', '中', '高'][idx]}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* 期限日 */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">期限日</label>
                            <div className="space-y-3">
                              {/* クイック設定ボタン */}
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: '今日', days: 0 },
                                  { label: '明日', days: 1 },
                                  { label: '来週', days: 7 }
                                ].map(({ label, days }) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() + days);
                                  const dateString = date.toISOString().split('T')[0];
                                  
                                  return (
                                    <button
                                      key={label}
                                      type="button"
                                      onClick={() => setDueDate(dateString)}
                                      className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                                        dueDate === dateString
                                          ? 'bg-gray-900 text-white border-gray-900'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {/* 日付入力 */}
                              <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                              />
                            </div>
                          </div>

                          {/* 時間 */}
                          {dueDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">時間（任意）</label>
                              <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                              />
                            </div>
                          )}

                          {/* リマインダー */}
                          {dueDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">リマインダー</label>
                              <select
                                value={reminder || ''}
                                onChange={(e) => setReminder(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                              >
                                <option value="">なし</option>
                                <option value="5">5分前</option>
                                <option value="15">15分前</option>
                                <option value="30">30分前</option>
                                <option value="60">1時間前</option>
                                <option value="120">2時間前</option>
                                <option value="1440">1日前</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <div>
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          prevStep();
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        戻る
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextStep();
                        }}
                        disabled={step === 1 && !title.trim()}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        次へ
                      </button>
                    ) : (
                      <button
                        type="submit"
                        onClick={(e) => {
                          console.log('Create button clicked', { step, title });
                        }}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        作成
                      </button>
                    )}
                  </div>
                </div>
              </form>
          </div>
        </>
      )}
    </>
  );
}