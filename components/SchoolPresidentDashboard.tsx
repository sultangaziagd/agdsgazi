import React, { useState, useEffect } from 'react';
import { AppUser, SchoolPresident, PresidentWeeklyLog } from '../types';
import * as Storage from '../services/storage';
import { Save, Calendar, CheckCircle2, PieChart, Users, Award, BookOpen, MessageCircle } from 'lucide-react';

interface SchoolPresidentDashboardProps {
  currentUser: AppUser;
}

const SchoolPresidentDashboard: React.FC<SchoolPresidentDashboardProps> = ({ currentUser }) => {
  // In a real app, you would link the AppUser uid to the SchoolPresident id.
  // Here we will use 'p1' (Ahmet Yılmaz) as the mock logged in president if user is 'p1'
  const presidentId = 'p1'; 
  const [president, setPresident] = useState<SchoolPresident | undefined>(undefined);
  const [logs, setLogs] = useState<PresidentWeeklyLog[]>([]);

  // Log Form
  const [newLog, setNewLog] = useState({
    attendedMeeting: false,
    performedSchoolActivity: false,
    recruitedNewMember: 0,
    notes: ''
  });

  useEffect(() => {
    // 1. Fetch president profile
    const p = Storage.getPresidentById(presidentId);
    setPresident(p);
    
    // 2. Fetch logs
    const l = Storage.getPresidentLogs(presidentId);
    setLogs(l);
  }, [currentUser]);

  const handleSaveLog = () => {
    if (!president) return;

    const logEntry: PresidentWeeklyLog = {
      id: crypto.randomUUID(),
      presidentId: president.id,
      week: getWeekNumber(new Date()),
      dateFormatted: new Date().toLocaleDateString('tr-TR'),
      timestamp: Date.now(),
      ...newLog
    };
    Storage.addPresidentLog(logEntry);
    setLogs([logEntry, ...logs]);
    
    setNewLog({
        attendedMeeting: false,
        performedSchoolActivity: false,
        recruitedNewMember: 0,
        notes: ''
    });
    alert('Haftalık raporunuz kaydedildi. Teşekkürler başkanım!');
  };

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
  };

  const calculateAttendanceRate = () => {
    if (logs.length === 0) return 0;
    const last10 = logs.slice(0, 10);
    const attended = last10.filter(l => l.attendedMeeting).length;
    return Math.round((attended / last10.length) * 100);
  };

  if (!president) return <div className="p-10 text-center">Profil yükleniyor...</div>;

  const attendanceRate = calculateAttendanceRate();

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24 bg-slate-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-6 rounded-b-3xl shadow-lg text-white mb-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="text-indigo-200 text-xs font-bold uppercase tracking-wide mb-1">Hoş Geldin Başkan</div>
                <h1 className="text-2xl font-bold">{president.fullName}</h1>
                <div className="flex items-center gap-2 mt-2 opacity-90 text-sm">
                    <BookOpen size={14} />
                    <span>{president.schoolName}</span>
                </div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <Award className="text-yellow-300" size={24} />
            </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex gap-3 mt-6">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-300">
                    <PieChart size={16} />
                </div>
                <div>
                    <div className="text-lg font-bold">%{attendanceRate}</div>
                    <div className="text-[10px] text-indigo-200">Katılım</div>
                </div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-300">
                    <Users size={16} />
                </div>
                <div>
                     {/* Sum total members recruited */}
                    <div className="text-lg font-bold">{logs.reduce((acc, l) => acc + l.recruitedNewMember, 0)}</div>
                    <div className="text-[10px] text-indigo-200">Yeni Üye</div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
         {/* Entry Form */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" /> Bu Hafta Verisi Gir
            </h3>
            
            <div className="space-y-3">
                <div 
                    onClick={() => setNewLog({...newLog, attendedMeeting: !newLog.attendedMeeting})}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        newLog.attendedMeeting ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                >
                    <span className="font-bold text-sm">İlçe Toplantısına Geldim</span>
                    {newLog.attendedMeeting ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                </div>

                <div 
                    onClick={() => setNewLog({...newLog, performedSchoolActivity: !newLog.performedSchoolActivity})}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        newLog.performedSchoolActivity ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                >
                    <span className="font-bold text-sm">Okulda Sohbet Yaptım</span>
                    {newLog.performedSchoolActivity ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                </div>
                
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase block mb-1 ml-1">Yeni Üye Sayısı</label>
                    <div className="relative">
                        <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                        type="number"
                        value={newLog.recruitedNewMember}
                        onChange={(e) => setNewLog({...newLog, recruitedNewMember: parseInt(e.target.value) || 0})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <textarea 
                    value={newLog.notes}
                    onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                    placeholder="Eklemek istediğin notlar..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 h-20 text-sm"
                    />
                </div>

                <button 
                onClick={handleSaveLog}
                className="w-full py-4 bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                <Save size={18} /> Raporu Gönder
                </button>
            </div>
         </div>

         {/* History */}
         <div>
            <h3 className="font-bold text-slate-500 text-xs uppercase mb-3 ml-2">Geçmiş Hareketlerin</h3>
            <div className="space-y-3">
                 {logs.map(log => (
                     <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                         <div>
                             <div className="text-xs font-bold text-slate-800 mb-1">{log.dateFormatted}</div>
                             <div className="flex gap-2 text-[10px]">
                                 <span className={`px-2 py-0.5 rounded ${log.attendedMeeting ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                     {log.attendedMeeting ? 'Toplantı Var' : 'Toplantı Yok'}
                                 </span>
                                 <span className={`px-2 py-0.5 rounded ${log.performedSchoolActivity ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                     {log.performedSchoolActivity ? 'Sohbet Var' : 'Sohbet Yok'}
                                 </span>
                             </div>
                         </div>
                         {log.recruitedNewMember > 0 && (
                             <div className="flex flex-col items-center">
                                 <span className="font-bold text-lg text-indigo-600">+{log.recruitedNewMember}</span>
                             </div>
                         )}
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default SchoolPresidentDashboard;