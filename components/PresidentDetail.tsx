import React, { useState, useEffect } from 'react';
import { SchoolPresident, PresidentWeeklyLog } from '../types';
import * as Storage from '../services/storage';
import { ChevronLeft, Phone, MessageCircle, Calendar, Users, Save, PieChart, CheckCircle2, XCircle } from 'lucide-react';

interface PresidentDetailProps {
  president: SchoolPresident;
  onBack: () => void;
}

const PresidentDetail: React.FC<PresidentDetailProps> = ({ president, onBack }) => {
  const [logs, setLogs] = useState<PresidentWeeklyLog[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'profile'>('status');

  // New Log Form State
  const [newLog, setNewLog] = useState({
    attendedMeeting: false,
    performedSchoolActivity: false,
    recruitedNewMember: 0,
    notes: ''
  });

  useEffect(() => {
    const data = Storage.getPresidentLogs(president.id);
    setLogs(data);
  }, [president.id]);

  const handleSaveLog = () => {
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
    alert('Veri kaydedildi.');
  };

  const openWhatsApp = () => {
    // Format phone: remove 0 at start if exists, ensure country code
    let phone = president.phoneNumber.replace(/\s/g, '');
    if (phone.startsWith('0')) phone = phone.substring(1);
    const url = `https://wa.me/90${phone}`;
    window.open(url, '_blank');
  };

   // Helper for ISO week number
   const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
  };

  // Stats Logic
  const calculateAttendanceRate = () => {
    if (logs.length === 0) return 0;
    const last10 = logs.slice(0, 10);
    const attended = last10.filter(l => l.attendedMeeting).length;
    return Math.round((attended / last10.length) * 100);
  };
  const attendanceRate = calculateAttendanceRate();

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24 bg-slate-50">
      {/* Navbar */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800 text-lg leading-tight">{president.fullName}</h2>
          <span className="text-xs text-slate-500">{president.schoolName}</span>
        </div>
        <button onClick={openWhatsApp} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100">
            <MessageCircle size={20} />
        </button>
      </div>

       {/* Tabs */}
       <div className="flex bg-white border-b border-slate-100 mb-4">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'status' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
          }`}
        >
          Durum & Giriş
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
          }`}
        >
          Profil
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'status' && (
            <div className="space-y-6">
                 {/* Stats Card (Pie Chart) */}
                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Toplantı Katılımı</div>
                        <div className="text-3xl font-bold text-slate-800">%{attendanceRate}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Son 10 Hafta</div>
                    </div>
                    {/* CSS Conic Gradient Pie Chart */}
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-slate-100"
                         style={{ background: `conic-gradient(#3b82f6 ${attendanceRate}%, #e2e8f0 ${attendanceRate}% 100%)` }}>
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                            <PieChart size={20} className="text-slate-300" />
                        </div>
                    </div>
                 </div>

                 {/* Entry Form */}
                 <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                         <Calendar size={18} className="text-blue-500" /> Bu Hafta Durumu
                    </h3>
                    
                    <div className="space-y-3">
                        <div 
                            onClick={() => setNewLog({...newLog, attendedMeeting: !newLog.attendedMeeting})}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                newLog.attendedMeeting ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            <span className="font-bold text-sm">Toplantıya Geldi</span>
                            {newLog.attendedMeeting ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                        </div>

                        <div 
                            onClick={() => setNewLog({...newLog, performedSchoolActivity: !newLog.performedSchoolActivity})}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                newLog.performedSchoolActivity ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            <span className="font-bold text-sm">Okulda Sohbet Yaptı</span>
                            {newLog.performedSchoolActivity ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                        </div>
                        
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1 ml-1">Yeni Üye Kazancı</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input 
                                type="number"
                                value={newLog.recruitedNewMember}
                                onChange={(e) => setNewLog({...newLog, recruitedNewMember: parseInt(e.target.value) || 0})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <textarea 
                            value={newLog.notes}
                            onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                            placeholder="Notlar (Örn: Sınav haftası)"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 h-20 text-sm"
                            />
                        </div>

                        <button 
                        onClick={handleSaveLog}
                        className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                        <Save size={18} /> Kaydet
                        </button>
                    </div>
                 </div>

                 {/* History List */}
                 <div className="space-y-3">
                     <h3 className="text-xs font-bold text-slate-400 uppercase ml-1">Geçmiş Kayıtlar</h3>
                     {logs.map(log => (
                         <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                             <div>
                                 <div className="text-xs font-bold text-slate-500 mb-1">{log.dateFormatted}</div>
                                 <div className="flex gap-2 text-xs">
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
                                     <span className="font-bold text-lg text-slate-700">+{log.recruitedNewMember}</span>
                                     <span className="text-[9px] text-slate-400 uppercase">Üye</span>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-300 mb-3">
                        <Users size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{president.fullName}</h3>
                    <p className="text-sm text-slate-500">{president.schoolName}</p>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-sm text-slate-500">Sınıf</span>
                        <span className="font-medium text-slate-800">{president.grade}. Sınıf</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-sm text-slate-500">Telefon</span>
                        <span className="font-medium text-slate-800">{president.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-sm text-slate-500">Göreve Başlama</span>
                        <span className="font-medium text-slate-800">{president.startDate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-sm text-slate-500">Halef</span>
                        <span className="font-medium text-slate-800">{president.successorName || '-'}</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PresidentDetail;