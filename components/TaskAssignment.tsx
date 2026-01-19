import React, { useState } from 'react';
import { MonthlyTask, TargetAudience } from '../types';
import { ChevronLeft, Plus, CheckCircle2 } from 'lucide-react';

interface TaskAssignmentProps {
  onSave: (task: MonthlyTask) => void;
  onCancel: () => void;
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetMonth, setTargetMonth] = useState('Aralık 2025');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('All');
  const [isRequired, setIsRequired] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newTask: MonthlyTask = {
      id: crypto.randomUUID(),
      title,
      description,
      targetMonth,
      targetAudience,
      isRequired
    };
    
    onSave(newTask);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Yeni Görev Ata</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-1 overflow-y-auto pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Görev Başlığı</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Mekke'nin Fethi"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Açıklama / Hedef</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detaylar..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 h-32"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Hedef Ay</label>
              <select 
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option>Aralık 2025</option>
                <option>Ocak 2026</option>
                <option>Şubat 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Muhatap</label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="All">Tümü</option>
                <option value="Mens">Ana Kademe</option>
                <option value="Womens">Hanımlar</option>
              </select>
            </div>
          </div>

          <div 
            onClick={() => setIsRequired(!isRequired)}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isRequired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">Zorunlu Görev</span>
              <span className="text-xs opacity-70">Bu görev raporda işaretlenmek zorundadır.</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isRequired ? 'bg-red-500 border-red-500' : 'border-slate-300'
            }`}>
              {isRequired && <CheckCircle2 size={16} className="text-white" />}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-8"
          >
            <Plus size={20} /> Görevi Oluştur
          </button>

        </form>
      </div>
    </div>
  );
};

export default TaskAssignment;