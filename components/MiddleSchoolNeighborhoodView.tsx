import React, { useState, useEffect } from 'react';
import { AppUser, KasifGroup, KasifGroupLog } from '../types';
import * as Storage from '../services/storage';
import { Plus, Users, Calendar, AlertCircle, CheckCircle2, Save, X, User } from 'lucide-react';

interface Props {
  currentUser: AppUser;
  onUpdate: () => void; // Callback to refresh parent if needed
}

const MiddleSchoolNeighborhoodView: React.FC<Props> = ({ currentUser, onUpdate }) => {
  const [groups, setGroups] = useState<KasifGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Group Form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGuideName, setNewGuideName] = useState('');
  const [newStudentCount, setNewStudentCount] = useState(0);

  // Weekly Log State (Per Group)
  // We keep a temporary map of log entries for the current session: { groupId: { met: boolean, ... } }
  const [logEntries, setLogEntries] = useState<Record<string, {
    met: boolean,
    details: string,
    attendance: number,
    saved: boolean
  }>>({});

  useEffect(() => {
    loadGroups();
  }, [currentUser]);

  const loadGroups = () => {
    const allGroups = Storage.getKasifGroups();
    const myGroups = allGroups.filter(g => g.neighborhoodId === currentUser.uid);
    setGroups(myGroups);

    // Initialize log entries for UI
    const initialLogs: any = {};
    myGroups.forEach(g => {
        initialLogs[g.id] = { met: true, details: '', attendance: g.activeStudentCount, saved: false };
    });
    setLogEntries(initialLogs);
  };

  const handleCreateGroup = () => {
    if (!newGroupName || !newGuideName) return;

    const newGroup: KasifGroup = {
        id: crypto.randomUUID(),
        neighborhoodId: currentUser.uid,
        neighborhoodName: currentUser.name,
        groupName: newGroupName,
        guideName: newGuideName,
        activeStudentCount: newStudentCount,
        lastMeetingDate: Date.now() // Assume active on creation
    };

    Storage.saveKasifGroup(newGroup);
    setShowAddModal(false);
    setNewGroupName('');
    setNewGuideName('');
    setNewStudentCount(0);
    loadGroups();
    onUpdate();
  };

  const updateLogEntry = (groupId: string, field: string, value: any) => {
    setLogEntries(prev => ({
        ...prev,
        [groupId]: { ...prev[groupId], [field]: value }
    }));
  };

  const handleSaveLog = (group: KasifGroup) => {
    const entry = logEntries[group.id];
    if (!entry) return;

    const log: KasifGroupLog = {
        id: crypto.randomUUID(),
        groupId: group.id,
        neighborhoodId: currentUser.uid,
        week: 1, // Logic to calc week needed in real app
        dateFormatted: new Date().toLocaleDateString('tr-TR'),
        timestamp: Date.now(),
        isMeetingHeld: entry.met,
        attendanceCount: entry.met ? entry.attendance : 0,
        activityDetails: entry.met ? entry.details : undefined,
        excuse: !entry.met ? entry.details : undefined
    };

    Storage.saveKasifLog(log);
    
    // UI Feedback
    setLogEntries(prev => ({
        ...prev,
        [group.id]: { ...prev[group.id], saved: true }
    }));
    
    // Update summary in parent (Wizard)
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-orange-800 text-sm">Tanımlı Gruplarınız</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-orange-200 transition-colors"
        >
          <Plus size={14} /> Yeni Grup
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-6 bg-orange-50 rounded-xl border border-dashed border-orange-200">
            <p className="text-xs text-orange-600 mb-2">Henüz tanımlı kaşif grubu yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
            {groups.map(group => {
                const entry = logEntries[group.id] || { met: true, details: '', attendance: 0, saved: false };
                
                return (
                    <div key={group.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        {/* Group Info Header */}
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-50">
                            <div>
                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                    {group.groupName}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <User size={10} /> Rehber: {group.guideName}
                                </div>
                            </div>
                            <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-[10px] font-bold">
                                {group.activeStudentCount} Öğrenci
                            </div>
                        </div>

                        {/* Data Entry Section */}
                        {entry.saved ? (
                             <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} /> Bu haftaki rapor kaydedildi.
                             </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600">Bu hafta toplandı mı?</span>
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button 
                                            onClick={() => updateLogEntry(group.id, 'met', true)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${entry.met ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Evet
                                        </button>
                                        <button 
                                            onClick={() => updateLogEntry(group.id, 'met', false)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${!entry.met ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Hayır
                                        </button>
                                    </div>
                                </div>

                                {entry.met ? (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Katılım Sayısı</label>
                                            <input 
                                                type="number" 
                                                value={entry.attendance}
                                                onChange={(e) => updateLogEntry(group.id, 'attendance', parseInt(e.target.value))}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">İşlenen Konu / Etkinlik</label>
                                            <input 
                                                type="text" 
                                                value={entry.details}
                                                onChange={(e) => updateLogEntry(group.id, 'details', e.target.value)}
                                                placeholder="Örn: Namazın önemi..."
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Toplanmama Sebebi (Mazeret)</label>
                                        <textarea 
                                            value={entry.details}
                                            onChange={(e) => updateLogEntry(group.id, 'details', e.target.value)}
                                            placeholder="Neden yapılmadı?"
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-16"
                                        />
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleSaveLog(group)}
                                    className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-200"
                                >
                                    <Save size={14} /> Kaydet
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      )}

      {/* Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Yeni Grup Ekle</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-1.5 bg-slate-100 rounded-full">
                        <X size={16} />
                    </button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Grup Adı</label>
                        <input 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            placeholder="Örn: Yıldızlar Grubu"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Rehber Adı</label>
                        <input 
                            value={newGuideName}
                            onChange={(e) => setNewGuideName(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            placeholder="Rehber ismini giriniz"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Öğrenci Sayısı</label>
                        <input 
                            type="number"
                            value={newStudentCount}
                            onChange={(e) => setNewStudentCount(parseInt(e.target.value))}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                    </div>
                    <button 
                        onClick={handleCreateGroup}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold mt-2"
                    >
                        Oluştur
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default MiddleSchoolNeighborhoodView;