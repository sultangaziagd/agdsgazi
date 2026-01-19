import React, { useState, useEffect } from 'react';
import { MonthlyTask, TaskCompletion, AppUser } from '../types';
import * as Storage from '../services/storage';
import { CheckCircle2, Target, CalendarDays, AlertCircle } from 'lucide-react';

interface GoalsProps {
  currentUser: AppUser;
}

const Goals: React.FC<GoalsProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<MonthlyTask[]>([]);
  const [progress, setProgress] = useState<Record<string, TaskCompletion>>({});
  const currentMonth = "Aralık 2025"; // In a real app, calculate this dynamically

  useEffect(() => {
    const loadedTasks = Storage.getTasksByMonth(currentMonth);
    const loadedProgress = Storage.getUserTaskProgress(currentUser.uid);
    setTasks(loadedTasks);
    setProgress(loadedProgress);
  }, [currentUser.uid]);

  const handleToggle = (taskId: string) => {
    const current = progress[taskId] || { completed: false, note: '' };
    const newVal = { ...current, completed: !current.completed, updatedAt: Date.now() };
    
    // Optimistic UI update
    const newProgress = { ...progress, [taskId]: newVal };
    setProgress(newProgress);
    
    // Save to storage
    Storage.saveUserTaskProgress(currentUser.uid, taskId, newVal);
  };

  const handleNoteChange = (taskId: string, note: string) => {
    const current = progress[taskId] || { completed: false, note: '' };
    const newVal = { ...current, note, updatedAt: Date.now() };
    
    const newProgress = { ...progress, [taskId]: newVal };
    setProgress(newProgress);
    Storage.saveUserTaskProgress(currentUser.uid, taskId, newVal);
  };

  // Calculate Progress Stats
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => progress[t.id]?.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24">
      {/* Header Section */}
      <div className="bg-white p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hedefler & Etkinlikler</h2>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <CalendarDays size={14} />
              {currentMonth}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Aylık İlerleme</span>
            <span className="text-lg font-bold text-indigo-600">%{progressPercentage}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Target size={48} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Bu ay için atanmış bir hedef bulunmamaktadır.</p>
          </div>
        ) : (
          tasks.map(task => {
            const taskState = progress[task.id] || { completed: false, note: '' };
            const isCompleted = taskState.completed;

            return (
              <div 
                key={task.id} 
                className={`group bg-white rounded-2xl p-4 border-2 transition-all duration-200 ${
                  isCompleted ? 'border-green-500 shadow-green-100 shadow-lg' : 'border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 size={20} className={isCompleted ? 'scale-100' : 'scale-90 opacity-0 group-hover:opacity-100'} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-bold text-slate-800 mb-1 ${isCompleted ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h3>
                      {task.isRequired && (
                        <span className="shrink-0 text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle size={10} /> Zorunlu
                        </span>
                      )}
                    </div>
                    <p className={`text-sm text-slate-500 mb-3 ${isCompleted ? 'line-through opacity-50' : ''}`}>
                      {task.description}
                    </p>

                    {/* Notes Section */}
                    <div className="relative">
                      <input 
                        type="text"
                        value={taskState.note}
                        onChange={(e) => handleNoteChange(task.id, e.target.value)}
                        placeholder="İlçe yönetimi için not ekle..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;