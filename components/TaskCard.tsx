'use client';

import { useState } from 'react';
import { Task, useTaskStore } from '@/lib/store';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Flag, 
  MoreHorizontal,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Clock,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const { toggleTask, deleteTask, toggleSubtask, addSubtask, generateSubtasks } = useTaskStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [showActions, setShowActions] = useState(false);

  const handleGenerateSubtasks = () => {
    const suggestedSubtasks = generateSubtasks(task.title);
    suggestedSubtasks.slice(0, 3).forEach(subtask => {
      if (!task.subtasks.some(st => st.title === subtask)) {
        addSubtask(task.id, subtask);
      }
    });
    setShowSubtasks(true);
    setShowActions(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityIcons = {
    low: <Flag className="h-3 w-3" />,
    medium: <Flag className="h-3 w-3" />,
    high: <Flag className="h-3 w-3" />
  };

  return (
    <div
      className={`glass rounded-xl p-4 border transition-all hover:shadow-lg group ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => toggleTask(task.id)}
            className={`mt-1 transition-colors ${
              task.completed ? 'text-green-600' : 'text-gray-400 hover:text-primary'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 fill-current" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1">
            <h3 className={`font-medium transition-all ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}

            {/* Task Meta */}
            <div className="flex items-center space-x-3 mt-2">
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${priorityColors[task.priority]}`}>
                {priorityIcons[task.priority]}
                <span className="capitalize">{task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : '高'}</span>
              </div>

                  {task.dueDate && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(task.dueDate, 'MMM d')}
                        {task.dueTime && ` ${task.dueTime}`}
                      </span>
                    </div>
                  )}

                  {task.reminder && task.dueDate && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <Bell className="h-3 w-3" />
                      <span>
                        {task.reminder < 60 
                          ? `${task.reminder}分前` 
                          : task.reminder < 1440 
                          ? `${Math.floor(task.reminder / 60)}時間前` 
                          : `${Math.floor(task.reminder / 1440)}日前`
                        }
                      </span>
                    </div>
                  )}

              <div className="text-xs text-primary font-medium">
                +{task.xpValue} XP
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/50 transition-all"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>

            {showActions && (
              <div
                className="absolute right-0 top-8 glass rounded-lg border border-white/20 shadow-lg p-2 min-w-[150px] z-10"
              >
                <button
                  onClick={handleGenerateSubtasks}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/50 flex items-center space-x-2 text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AIサブタスク</span>
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/50 flex items-center space-x-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>削除</span>
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div
            className="mt-4 space-y-2"
          >
            {task.subtasks.map((subtask, subIndex) => (
              <div
                key={subtask.id}
                className="flex items-center space-x-3 ml-8"
              >
                <button
                  onClick={() => toggleSubtask(task.id, subtask.id)}
                  className={`transition-colors ${
                    subtask.completed ? 'text-green-600' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="h-4 w-4 fill-current" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <span className={`text-sm ${
                  subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                }`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}