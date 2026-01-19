import React, { useState, useEffect } from 'react';
import { School, PresidentWeeklyLog, SchoolPresident } from '../types';
import * as Storage from '../services/storage';
import { ChevronLeft, User, Phone, Edit2, ShieldCheck, AlertCircle, BarChart, History } from 'lucide-react';

interface SchoolDetailProps {
  school: School;
  onBack: () => void;
}

const SchoolDetail: React.FC<SchoolDetailProps> = ({ school: initialSchool, onBack }) => {
  const [school, setSchool] = useState<School>(initialSchool);
  const [activeTab, setActiveTab] = useState<'status' | 'profile'>('status');
  
  // Data State
  const [assignedPresident, setAssignedPresident] = useState<SchoolPresident | undefined>(undefined);
  const [presidentLogs, setPresidentLogs] = useState<PresidentWeeklyLog[]>([]);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialSchool);

  useEffect(() => {
    // 1. Fetch the president assigned to this school
    const president = Storage.getPresidentBySchoolId(school.id);
    setAssignedPresident(president);

    // 2. If president exists, fetch their logs
    if (president) {
      const logs = Storage.getPresidentLogs(president.id);
      setPresidentLogs(logs);
    } else {
      setPresidentLogs([]);
    }
  }, [school.id]);

  const handleSaveProfile = () => {
    Storage.updateSchool(editForm);
    setSchool(editForm);
    setIsEditing(false);
  };

  // Stats Logic
  const totalRecruited = presidentLogs.reduce((acc, log) => acc + log.recruitedNewMember, 0);
  const totalChats = presidentLogs.filter(log => log.performedSchoolActivity).length;
  const totalMeetings = presidentLogs.filter(log => log.attendedMeeting).length;

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24 bg-slate-50">
      {/* Navbar */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800 text-lg leading-tight">{school.schoolName}</h2>
          <span className="text-xs text-slate-500">{school.neighborhood}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'status' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
          }`}
        >
          Okul Çalışmaları
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
          }`}
        >
          Okul Profili
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        
        {/* --- TAB: ACTIVITY STATUS (Read Only from President) --- */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            
            {/* President Status Card */}
            {!assignedPresident ? (
               <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                  <AlertCircle size={32} className="mx-auto text-red-400 mb-2" />
                  <h3 className="font-bold text-red-800">Başkan Atanmamış</h3>
                  <p className="text-xs text-red-600 mt-1">Bu okulun verilerini görmek için bir başkan atanmalıdır.</p>
               </div>
            ) : (
               <>
                 {/* Summary Stats */}
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalRecruited}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Yeni Üye</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-2xl font-bold text-green-600">{totalChats}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Sohbet</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-2xl font-bold text-purple-600">{totalMeetings}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Toplantı</div>
                    </div>
                 </div>

                 {/* President Info Mini Card */}
                 <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {assignedPresident.fullName.substring(0,1)}
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Sorumlu Başkan</div>
                        <div className="font-bold text-slate-800">{assignedPresident.fullName}</div>
                    </div>
                 </div>

                 {/* Activity History List */}
                 <div>
                    <h3 className="font-bold text-slate-500 text-sm uppercase mb-3 ml-1 flex items-center gap-2">
                        <History size={14} /> Gelen Raporlar
                    </h3>
                    
                    {presidentLogs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Başkan tarafından henüz bir rapor girilmemiş.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {presidentLogs.map(log => (
                                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">{log.dateFormatted}</span>
                                        {log.recruitedNewMember > 0 && (
                                            <span className="text-xs font-bold text-green-600">+{log.recruitedNewMember} Üye</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <div className={`flex-1 py-1 px-2 rounded text-center text-[10px] font-bold ${log.attendedMeeting ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                            {log.attendedMeeting ? 'Toplantıda' : 'Toplantıya Gelmedi'}
                                        </div>
                                        <div className={`flex-1 py-1 px-2 rounded text-center text-[10px] font-bold ${log.performedSchoolActivity ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                            {log.performedSchoolActivity ? 'Sohbet Yaptı' : 'Sohbet Yok'}
                                        </div>
                                    </div>
                                    {log.notes && (
                                        <div className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded">
                                            "{log.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
               </>
            )}
          </div>
        )}

        {/* --- TAB: SCHOOL PROFILE (Edit Mode) --- */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
             {/* Edit Card */}
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <ShieldCheck size={18} className="text-blue-500" /> Kurumsal Bilgiler
                 </h3>
                 {!isEditing ? (
                   <button onClick={() => setIsEditing(true)} className="text-blue-600 text-xs font-bold flex items-center gap-1">
                     <Edit2 size={12} /> Düzenle
                   </button>
                 ) : (
                   <div className="flex gap-2">
                      <button onClick={() => setIsEditing(false)} className="text-slate-400 text-xs font-bold">İptal</button>
                      <button onClick={handleSaveProfile} className="text-green-600 text-xs font-bold">Kaydet</button>
                   </div>
                 )}
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Okul Adı</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.schoolName || ''}
                        onChange={(e) => setEditForm({...editForm, schoolName: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                      />
                    ) : (
                      <div className="font-medium text-slate-800">{school.schoolName}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Mahalle / Konum</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.neighborhood || ''}
                        onChange={(e) => setEditForm({...editForm, neighborhood: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                      />
                    ) : (
                      <div className="font-medium text-slate-800">{school.neighborhood}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Öğrenci Kapasitesi</label>
                     {isEditing ? (
                      <input 
                        type="number" 
                        value={editForm.studentCapacity || ''}
                        onChange={(e) => setEditForm({...editForm, studentCapacity: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                      />
                    ) : (
                      <div className="font-medium text-slate-800">{school.studentCapacity} Öğrenci</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">İrtibatlı Öğretmen</label>
                     {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.teacherContact || ''}
                        onChange={(e) => setEditForm({...editForm, teacherContact: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                        placeholder="Örn: Mehmet Hoca (Md Yrd)"
                      />
                    ) : (
                      <div className="font-medium text-slate-800">{school.teacherContact || '-'}</div>
                    )}
                  </div>
               </div>
             </div>

             {/* Assigned President Info (Read Only here, Managed in President Screen) */}
             <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                    <User size={16} /> Atanmış Başkan
                </h3>
                {assignedPresident ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-bold text-slate-800">{assignedPresident.fullName}</div>
                            <div className="text-xs text-slate-500">{assignedPresident.phoneNumber}</div>
                        </div>
                        <div className="bg-white px-2 py-1 rounded text-xs font-bold text-blue-600 shadow-sm">
                            {assignedPresident.grade}. Sınıf
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs text-blue-400">Başkan ataması "Başkanlar" menüsünden yapılmaktadır.</p>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;