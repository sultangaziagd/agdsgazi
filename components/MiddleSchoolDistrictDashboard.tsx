import React, { useState, useEffect } from 'react';
import { AppUser, KasifGroup } from '../types';
import * as Storage from '../services/storage';
import { Search, AlertTriangle, CheckCircle2, Users, BookOpen, Clock } from 'lucide-react';

const MiddleSchoolDistrictDashboard: React.FC = () => {
  const [allGroups, setAllGroups] = useState<KasifGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<KasifGroup[]>([]);
  const [redAlarmGroups, setRedAlarmGroups] = useState<KasifGroup[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Stats
  const totalStudents = allGroups.reduce((acc, g) => acc + g.activeStudentCount, 0);
  const totalGroups = allGroups.length;

  useEffect(() => {
    const groups = Storage.getKasifGroups();
    setAllGroups(groups);
    setFilteredGroups(groups);

    // Extract unique neighborhoods for filter
    const nh = Array.from(new Set(groups.map(g => g.neighborhoodName)));
    setNeighborhoods(nh);

    // Identify Red Alarms (No activity for > 14 days)
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const alarms = groups.filter(g => !g.lastMeetingDate || g.lastMeetingDate < twoWeeksAgo);
    setRedAlarmGroups(alarms);

  }, []);

  useEffect(() => {
    let result = allGroups;

    if (searchTerm) {
        result = result.filter(g => 
            g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            g.guideName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (selectedNeighborhood !== 'all') {
        result = result.filter(g => g.neighborhoodName === selectedNeighborhood);
    }

    setFilteredGroups(result);
  }, [searchTerm, selectedNeighborhood, allGroups]);

  return (
    <div className="p-4 space-y-6 pb-24 bg-slate-50 min-h-screen">
       {/* Header Card */}
       <div className="bg-orange-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen size={20} className="text-white" />
             </div>
             <span className="text-orange-100 text-xs font-medium uppercase tracking-wider">İlçe Ortaokullar</span>
          </div>
          <h1 className="text-2xl font-bold">Genel Bakış</h1>
          <div className="flex gap-4 mt-6">
             <div className="flex items-center gap-2">
                 <div className="text-2xl font-bold">{totalGroups}</div>
                 <div className="text-xs text-orange-200 leading-tight">Toplam<br/>Grup</div>
             </div>
             <div className="w-px bg-orange-400 h-8"></div>
             <div className="flex items-center gap-2">
                 <div className="text-2xl font-bold">{totalStudents}</div>
                 <div className="text-xs text-orange-200 leading-tight">Aktif<br/>Öğrenci</div>
             </div>
          </div>
       </div>

       {/* Red Alarm Section */}
       {redAlarmGroups.length > 0 && (
         <div className="bg-red-50 border border-red-100 rounded-2xl p-5 animate-fade-in">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-600" /> Kırmızı Alarm (2+ Hafta Pasif)
            </h3>
            <div className="space-y-2">
                {redAlarmGroups.map(g => (
                    <div key={g.id} className="bg-white p-3 rounded-xl border-l-4 border-red-500 shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">{g.groupName}</div>
                            <div className="text-xs text-slate-500">{g.neighborhoodName}</div>
                        </div>
                        <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                             {g.lastMeetingDate ? Math.floor((Date.now() - g.lastMeetingDate) / (1000 * 60 * 60 * 24)) + ' gündür yok' : 'Hiç girilmedi'}
                        </div>
                    </div>
                ))}
            </div>
         </div>
       )}

       {/* Filter & List */}
       <div>
         <div className="flex gap-2 mb-4">
             <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Grup veya rehber ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
             </div>
             <select 
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs px-2 focus:outline-none font-bold text-slate-600 max-w-[120px]"
             >
                 <option value="all">Tüm Mahalleler</option>
                 {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
             </select>
         </div>

         <div className="space-y-3">
             {filteredGroups.map(group => (
                 <div key={group.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                         <div>
                             <div className="font-bold text-slate-800">{group.groupName}</div>
                             <div className="text-xs text-slate-500">{group.neighborhoodName} • {group.guideName}</div>
                         </div>
                         <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                             <Users size={12} className="text-slate-500" />
                             <span className="text-xs font-bold text-slate-600">{group.activeStudentCount}</span>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400">
                            Son Hareket: {group.lastMeetingDate ? new Date(group.lastMeetingDate).toLocaleDateString('tr-TR') : 'Yok'}
                        </span>
                     </div>
                 </div>
             ))}
         </div>
       </div>
    </div>
  );
};

export default MiddleSchoolDistrictDashboard;