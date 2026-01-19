import React, { useState, useEffect } from 'react';
import { SchoolPresident, PresidentWeeklyLog } from '../types';
import * as Storage from '../services/storage';
import { Search, User, Filter, ChevronRight, Phone, Award } from 'lucide-react';

interface PresidentListProps {
  onPresidentSelect: (president: SchoolPresident) => void;
}

const PresidentList: React.FC<PresidentListProps> = ({ onPresidentSelect }) => {
  const [presidents, setPresidents] = useState<SchoolPresident[]>([]);
  const [filteredPresidents, setFilteredPresidents] = useState<SchoolPresident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  
  // To store latest performance stats for badges
  const [performanceMap, setPerformanceMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const data = Storage.getPresidents();
    setPresidents(data);
    setFilteredPresidents(data);

    // Calculate performance badges
    const perf: Record<string, boolean> = {};
    data.forEach(p => {
      const logs = Storage.getPresidentLogs(p.id);
      // Logic: If attended last 4 meetings (or all available if less than 4)
      const last4 = logs.slice(0, 4);
      const attendedCount = last4.filter(l => l.attendedMeeting).length;
      // Simple rule: Green if attended at least 3 of last 4, or 100% if less than 4 logs exist but > 0
      if (last4.length === 0) perf[p.id] = false; // No data = grey/red
      else if (last4.length < 4) perf[p.id] = attendedCount === last4.length;
      else perf[p.id] = attendedCount >= 3;
    });
    setPerformanceMap(perf);
  }, []);

  useEffect(() => {
    let result = presidents;

    if (searchTerm) {
      result = result.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterGrade !== 'all') {
      result = result.filter(p => p.grade === filterGrade);
    }

    setFilteredPresidents(result);
  }, [searchTerm, filterGrade, presidents]);

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="text-blue-700" /> Başkan Takip
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Başkan veya okul ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 9, 10, 11, 12].map((g) => (
             <button 
             key={g}
             onClick={() => setFilterGrade(g as any)}
             className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
               filterGrade === g
                 ? 'bg-slate-800 text-white shadow-md' 
                 : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
             }`}
           >
             {g === 'all' ? 'Tümü' : `${g}. Sınıf`}
           </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3 overflow-y-auto">
        {filteredPresidents.map(president => (
          <div 
            key={president.id}
            onClick={() => onPresidentSelect(president)}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-98 transition-all flex justify-between items-center cursor-pointer group relative overflow-hidden"
          >
            {/* Status Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${performanceMap[president.id] ? 'bg-green-500' : 'bg-red-400'}`}></div>

            <div className="flex items-center gap-4 pl-2">
               {/* Avatar Placeholder */}
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg border border-slate-200">
                 {president.fullName.substring(0, 1)}
               </div>

               <div>
                 <div className="font-bold text-slate-800">{president.fullName}</div>
                 <div className="text-xs text-slate-500">{president.schoolName}</div>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{president.grade}. Sınıf</span>
                    {performanceMap[president.id] && (
                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                        <Award size={10} /> Aktif
                      </span>
                    )}
                 </div>
               </div>
            </div>
            
            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        ))}
        
        {filteredPresidents.length === 0 && (
           <div className="text-center py-10 text-slate-400">
             Kayıt bulunamadı.
           </div>
        )}
      </div>
    </div>
  );
};

export default PresidentList;