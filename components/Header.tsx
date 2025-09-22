'use client';

import Link from 'next/link';
// import { motion } from 'framer-motion'; // Removed animations
import { useTaskStore } from '@/lib/store';
import { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Calendar, 
  List, 
  LayoutGrid,
  Mic,
  PlusCircle,
  Menu
} from 'lucide-react';

export default function Header() {
  const { userStats, currentView, setView } = useTaskStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const progressPercentage = (userStats.totalXP % 100);

  return (
    <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-h-[64px]">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/landing" className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary fill-current" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TaskFlow Pro</h1>
              <p className="text-xs text-gray-600">次世代生産性プラットフォーム</p>
            </div>
          </Link>
        </div>

        {/* View Toggle */}
        <div className="hidden sm:flex items-center space-x-1 bg-white/50 rounded-lg p-1">
          {[
            { view: 'list', icon: List, label: 'リスト' },
            { view: 'kanban', icon: LayoutGrid, label: 'ボード' },
            { view: 'calendar', icon: Calendar, label: 'カレンダー' }
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setView(view as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === view 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="sm:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* User Stats */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* XP Progress */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">レベル {userStats.level}</p>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="font-medium">{userStats.totalXP}</span>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="md:hidden flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">{userStats.level}</span>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-white/20 p-4 sm:hidden">
            <div className="space-y-3">
              {[
                { view: 'list', icon: List, label: 'リスト' },
                { view: 'kanban', icon: LayoutGrid, label: 'ボード' },
                { view: 'calendar', icon: Calendar, label: 'カレンダー' }
              ].map(({ view, icon: Icon, label }) => (
                <button
                  key={view}
                  onClick={() => {
                    setView(view as any);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === view 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
              
              {/* Mobile User Stats */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">レベル {userStats.level}</p>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-primary fill-current" />
                      <span className="text-sm font-medium">{userStats.totalXP} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}