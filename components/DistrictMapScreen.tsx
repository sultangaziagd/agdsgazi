import React, { useState, useMemo } from 'react';
import { AppUser, WeeklyReport, NeighborhoodProfile, School, SchoolPresident } from '../types';
import * as Storage from '../services/storage';
import { Map as MapIcon, Layers, User, Calendar, ArrowRight, X, School as SchoolIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNavigateToNeighborhood: (user: AppUser) => void;
  onNavigateToSchool?: (school: School) => void; // Optional if we want to deep link to school
}

// Map Bounds for Sultangazi (Approximate for Simulation)
// These bounds map the lat/lng to 0-100% of the container
const MIN_LAT = 41.0900;
const MAX_LAT = 41.1300;
const MIN_LNG = 28.8400;
const MAX_LNG = 28.9000;

// Coordinate Normalizer (Maps lat/lng to 0-100% for CSS positioning)
const normalizeLng = (lng: number) => ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
const normalizeLat = (lat: number) => ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;

interface MarkerProps {
    x: number;
    y: number;
    colorClass: string;
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    pulse?: boolean;
}

// Marker Component
const Marker: React.FC<MarkerProps> = ({ 
    x, y, colorClass, label, onClick, icon, pulse = false 
}) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
        style={{ left: `${x}%`, bottom: `${y}%` }} // Using bottom for Latitude (Higher lat = Higher Y)
    >
        {pulse && (
             <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorClass}`}></span>
        )}
        <div className={`relative w-10 h-10 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-white transition-transform active:scale-95 ${colorClass}`}>
            {icon || <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            {label}
        </div>
    </div>
);

interface NeighborhoodMapData {
    user: AppUser;
    profile: NeighborhoodProfile;
    lastReport?: WeeklyReport;
    score: number;
    statusColor: string; // 'red' | 'yellow' | 'green'
}

interface SchoolMapData {
    school: School;
    president?: SchoolPresident;
    hasPresident: boolean;
}

const DistrictMapScreen: React.FC<Props> = ({ onBack, onNavigateToNeighborhood }) => {
  const [activeLayer, setActiveLayer] = useState<'neighborhoods' | 'high_schools'>('neighborhoods');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodMapData | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolMapData | null>(null);
  
  // Data Loading & Processing
  const { neighborhoods, schools } = useMemo(() => {
    // 1. Process Neighborhoods
    const users = Storage.MOCK_USERS.filter(u => u.role === 'user');
    const allReports = Storage.getReports();
    
    const nhList: NeighborhoodMapData[] = users.map(u => {
        const profile = Storage.getNeighborhoodProfile(u.uid);
        // Find latest report
        const userReports = allReports.filter(r => r.userId === u.uid).sort((a,b) => b.timestamp - a.timestamp);
        const lastReport = userReports.length > 0 ? userReports[0] : undefined;
        
        // Calculate Score (Simple Logic)
        let score = 0;
        let color = 'bg-red-500'; // Default Red
        
        if (lastReport) {
            // Basic Scoring Algorithm
            if (lastReport.isManagementMeetingHeld) score += 20;
            if (lastReport.isWomenMeetingHeld) score += 20;
            if (lastReport.middleSchoolStudentCount > 0) score += 20;
            if (lastReport.highSchoolTotalCount > 0) score += 20;
            if (lastReport.status === 'approved') score += 20;
            
            // Determine Color
            if (score >= 70) color = 'bg-emerald-500'; // Green
            else if (score >= 40) color = 'bg-amber-400'; // Yellow
        }

        return {
            user: u,
            profile,
            lastReport,
            score,
            statusColor: color
        };
    });

    // 2. Process Schools
    const schoolListRaw = Storage.getSchools();
    const presidents = Storage.getPresidents();
    
    const schoolList: SchoolMapData[] = schoolListRaw.map(s => {
        const president = presidents.find(p => p.schoolId === s.id);
        return {
            school: s,
            president,
            hasPresident: !!president
        };
    });

    return { neighborhoods: nhList, schools: schoolList };
  }, []);

  const handleMapClick = () => {
      // Deselect when clicking empty map area
      setSelectedNeighborhood(null);
      setSelectedSchool(null);
  };

  return (
    <div className="relative h-full w-full bg-slate-100 overflow-hidden flex flex-col">
       
       {/* 1. MAP HEADER / CONTROLS */}
       <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none flex justify-between items-start">
           {/* Back Button */}
           <button 
             onClick={onBack}
             className="pointer-events-auto w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
           >
              <X size={20} />
           </button>

           {/* Layer Switcher */}
           <div className="pointer-events-auto bg-white rounded-xl shadow-lg p-1 flex flex-col gap-1">
               <button 
                 onClick={() => { setActiveLayer('neighborhoods'); setSelectedSchool(null); }}
                 className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'neighborhoods' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <MapIcon size={16} /> Mahalleler
               </button>
               <button 
                 onClick={() => { setActiveLayer('high_schools'); setSelectedNeighborhood(null); }}
                 className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${activeLayer === 'high_schools' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <SchoolIcon size={16} /> Liseler
               </button>
           </div>
       </div>

       {/* 2. MAP AREA (Simulated) */}
       <div 
         className="relative flex-1 bg-[#e5e5e5] w-full h-full cursor-grab active:cursor-grabbing"
         onClick={handleMapClick}
       >
           {/* Grid Pattern Background to look like a map */}
           <div 
             className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}
           ></div>
           
           {/* Map Borders / Water placeholder (Decorative) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 font-bold text-6xl tracking-widest select-none opacity-20 pointer-events-none">
               SULTANGAZİ
           </div>

           {/* --- RENDER NEIGHBORHOOD MARKERS --- */}
           {activeLayer === 'neighborhoods' && neighborhoods.map((nh) => (
               <Marker 
                  key={nh.user.uid}
                  x={normalizeLng(nh.user.longitude || 0)}
                  y={normalizeLat(nh.user.latitude || 0)}
                  colorClass={nh.statusColor}
                  label={nh.user.name}
                  pulse={nh.score < 40} // Pulse if Red
                  onClick={() => {
                      setSelectedSchool(null);
                      setSelectedNeighborhood(nh);
                  }}
               />
           ))}

           {/* --- RENDER SCHOOL MARKERS --- */}
           {activeLayer === 'high_schools' && schools.map((s) => (
               <Marker 
                  key={s.school.id}
                  x={normalizeLng(s.school.longitude || 0)}
                  y={normalizeLat(s.school.latitude || 0)}
                  colorClass={s.hasPresident ? 'bg-blue-600' : 'bg-slate-400'}
                  label={s.school.schoolName}
                  icon={<SchoolIcon size={16} />}
                  onClick={() => {
                      setSelectedNeighborhood(null);
                      setSelectedSchool(s);
                  }}
               />
           ))}
       </div>

       {/* 3. LEGEND (Bottom Left) */}
       <div className="absolute bottom-6 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/50 pointer-events-none">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Gösterge</h4>
           {activeLayer === 'neighborhoods' ? (
               <div className="space-y-1.5">
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] font-medium text-slate-700">Tam Puan ({'>'}70)</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                       <span className="text-[10px] font-medium text-slate-700">Eksikler Var</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                       <span className="text-[10px] font-medium text-slate-700">Rapor Yok / Düşük</span>
                   </div>
               </div>
           ) : (
               <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                       <span className="text-[10px] font-medium text-slate-700">Başkan Var</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                       <span className="text-[10px] font-medium text-slate-700">Başkan Yok</span>
                   </div>
               </div>
           )}
       </div>

       {/* 4. BOTTOM SHEET (Details) */}
       {selectedNeighborhood && (
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-30 p-6 animate-slide-up">
               <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
               
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <h2 className="text-xl font-bold text-slate-800">{selectedNeighborhood.user.name}</h2>
                       <div className="flex items-center gap-2 mt-1">
                           <div className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${selectedNeighborhood.statusColor}`}>
                                Puan: {selectedNeighborhood.score}
                           </div>
                           <span className="text-xs text-slate-400">
                               {selectedNeighborhood.profile.totalMembersCount} Üye
                           </span>
                       </div>
                   </div>
                   <button onClick={() => setSelectedNeighborhood(null)} className="p-2 bg-slate-100 rounded-full">
                       <X size={18} className="text-slate-500" />
                   </button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                           <User size={12} /> Sorumlu
                       </div>
                       <div className="text-sm font-bold text-slate-700">
                           {/* Using mock logic for name as it wasn't in AppUser */}
                           Mahalle Başkanı
                       </div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                           <Calendar size={12} /> Son Rapor
                       </div>
                       <div className="text-sm font-bold text-slate-700">
                           {selectedNeighborhood.lastReport ? selectedNeighborhood.lastReport.date : 'Rapor Yok'}
                       </div>
                   </div>
               </div>

               <button 
                  onClick={() => onNavigateToNeighborhood(selectedNeighborhood.user)}
                  className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200"
               >
                   Detaylı İncele <ArrowRight size={18} />
               </button>
           </div>
       )}

       {selectedSchool && (
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-30 p-6 animate-slide-up">
               <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
               
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <h2 className="text-xl font-bold text-slate-800 pr-8">{selectedSchool.school.schoolName}</h2>
                       <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                           <SchoolIcon size={14} />
                           <span>{selectedSchool.school.neighborhood}</span>
                       </div>
                   </div>
                   <button onClick={() => setSelectedSchool(null)} className="p-2 bg-slate-100 rounded-full shrink-0">
                       <X size={18} className="text-slate-500" />
                   </button>
               </div>

               {selectedSchool.hasPresident ? (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                            {selectedSchool.president?.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-blue-400 uppercase">Okul Başkanı</div>
                            <div className="font-bold text-slate-800">{selectedSchool.president?.fullName}</div>
                            <div className="text-xs text-slate-500">{selectedSchool.president?.phoneNumber}</div>
                        </div>
                    </div>
               ) : (
                   <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 mb-6">
                       <AlertTriangle className="text-red-500" size={24} />
                       <div>
                           <div className="font-bold text-red-800">Başkan Atanmamış</div>
                           <div className="text-xs text-red-600">Bu okula henüz bir sorumlu atanmadı.</div>
                       </div>
                   </div>
               )}

               <div className="flex gap-2">
                   <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
                        <span className="block text-xs text-slate-400">Kapasite</span>
                        <span className="font-bold text-slate-700">{selectedSchool.school.studentCapacity}</span>
                   </div>
                   <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
                        <span className="block text-xs text-slate-400">İrtibat</span>
                        <span className="font-bold text-slate-700 truncate px-1">{selectedSchool.school.teacherContact || '-'}</span>
                   </div>
               </div>
           </div>
       )}

    </div>
  );
};

export default DistrictMapScreen;