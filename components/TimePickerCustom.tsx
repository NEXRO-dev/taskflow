'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
}

export default function TimePickerCustom({ value, onChange, label, placeholder }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h || '09');
      setMinute(m || '00');
    }
  }, [value]);

  // Update parent when time changes
  useEffect(() => {
    onChange(`${hour}:${minute}`);
  }, [hour, minute, onChange]);

  const incrementHour = () => {
    const currentHour = parseInt(hour);
    setHour(((currentHour + 1) % 24).toString().padStart(2, '0'));
  };

  const decrementHour = () => {
    const currentHour = parseInt(hour);
    setHour(((currentHour - 1 + 24) % 24).toString().padStart(2, '0'));
  };

  const incrementMinute = () => {
    const currentMinute = parseInt(minute);
    setMinute(((currentMinute + 1) % 60).toString().padStart(2, '0'));
  };

  const decrementMinute = () => {
    const currentMinute = parseInt(minute);
    setMinute(((currentMinute - 1 + 60) % 60).toString().padStart(2, '0'));
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

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
            <Clock className="h-4 w-4 text-gray-500" />
            <span className={`${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {value ? `${hour}:${minute}` : (placeholder || '時間を選択')}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* オーバーレイ */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* ピッカー */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              <div className="p-4">
                {/* 時間入力セクション */}
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={hour}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        const numVal = parseInt(val) || 0;
                        if (numVal <= 23) {
                          setHour(val.padStart(2, '0'));
                        }
                      }}
                      className="w-12 h-10 text-center text-base font-medium border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                      maxLength={2}
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={incrementHour}
                        className="w-6 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronUp className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={decrementHour}
                        className="w-6 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronDown className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <span className="text-xl font-bold text-gray-400 mx-2">:</span>
                  
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={minute}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        const numVal = parseInt(val) || 0;
                        if (numVal <= 59) {
                          setMinute(val.padStart(2, '0'));
                        }
                      }}
                      className="w-12 h-10 text-center text-base font-medium border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                      maxLength={2}
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={incrementMinute}
                        className="w-6 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronUp className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={decrementMinute}
                        className="w-6 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronDown className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* セレクトボックス風のオプション */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">時</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {hours.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHour(h)}
                          className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                            hour === h ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">分</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {minutes.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMinute(m)}
                          className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                            minute === m ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* クイック選択 */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">よく使う時間</div>
                  <div className="grid grid-cols-4 gap-2">
                    {['09:00', '12:00', '14:00', '18:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          const [h, m] = time.split(':');
                          setHour(h);
                          setMinute(m);
                        }}
                        className="px-2 py-1.5 text-xs rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
                      >
                        {time}
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
                      setHour('09');
                      setMinute('00');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg"
                  >
                    リセット
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