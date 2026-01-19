import React, { useState, useEffect } from 'react';
import { AppUser, NeighborhoodProfile } from '../types';
import * as Storage from '../services/storage';
import { 
  Users, Save, Shield, GraduationCap, Building, 
  UserPlus, FileText, CheckCircle2, Edit2, X, BookOpen, Tent, Bus 
} from 'lucide-react';

interface Props {
  currentUser: AppUser;
}

const NeighborhoodProfileView: React.FC<Props> = ({ currentUser }) => {
  const [profile, setProfile] = useState<NeighborhoodProfile | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<NeighborhoodProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = () => {
    const data = Storage.getNeighborhoodProfile(currentUser.uid);
    setProfile(data);
    setEditForm(data);
  };

  const handleUpdate = (field: keyof NeighborhoodProfile, value: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSave = () => {
    if (!editForm) return;
    const updated = { ...editForm, updatedAt: Date.now() };
    Storage.saveNeighborhoodProfile(updated);
    setProfile(updated);
    setIsSaved(true);
    setIsEditing(false);
    
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (!profile || !editForm) return <div>Yükleniyor...</div>;

  // Calculate Total Strength (Sum of key roles)
  const totalStrength = 
    profile.managementCount + 
    profile.middleSchoolCount +
    profile.highSchoolCount;

  return (
    <div className="space-y-6">
      
      {/* Header Summary Card (View Only) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
         <div className="flex justify-between items-start">
            <div>
                <h3 className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-1">Teşkilat Gücü</h3>
                <div className="text-3xl font-bold">{totalStrength} <span className="text-sm font-normal text-blue-200">Aktif Görevli</span></div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users size={24} className="text-white" />
            </div>
         </div>
         <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 text-xs font-medium">
             <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 Toplam Üye: {profile.totalMembersCount}
             </div>
         </div>
      </div>

      {/* Profile Card Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative transition-all duration-300">
         
         {/* Card Header with Edit Toggle */}
         <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Mahalle Künyesi
            </h3>
            
            {!isEditing ? (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                    <Edit2 size={12} /> Güncelle
                </button>
            ) : (
                <div className="flex gap-2">
                    <button 
                        onClick={handleCancel}
                        className="text-slate-500 hover:text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                        İptal
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                    >
                        <Save size={12} /> Kaydet
                    </button>
                </div>
            )}
         </div>
         
         {/* Card Content */}
         <div className="p-6 space-y-6">
             
             {/* Ana Kademe - Progress Bar Visual */}
             <div>
                <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Shield size={16} className="text-blue-600" /> Ana Kademe Yönetim
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Hedef: 8</span>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                         <input 
                            type="number" 
                            min="0" max="20"
                            value={editForm.managementCount}
                            onChange={(e) => handleUpdate('managementCount', parseInt(e.target.value) || 0)}
                            className="w-20 p-2 border border-blue-200 rounded-lg text-center font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        />
                    ) : (
                        <div className="w-20 p-2 text-center font-bold text-slate-800 text-lg">{profile.managementCount}</div>
                    )}
                   
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${profile.managementCount >= 8 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((profile.managementCount / 8) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 {/* Ortaokul */}
                 <div className={`p-3 rounded-xl border ${isEditing ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100 bg-white'}`}>
                    <label className="text-xs font-bold text-orange-600 uppercase mb-2 flex items-center gap-1">
                        <BookOpen size={14} /> Ortaokul Komisyonu
                    </label>
                    {isEditing ? (
                        <input 
                            type="number" 
                            min="0"
                            value={editForm.middleSchoolCount}
                            onChange={(e) => handleUpdate('middleSchoolCount', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-orange-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    ) : (
                        <div className="text-2xl font-bold text-slate-700">{profile.middleSchoolCount}</div>
                    )}
                 </div>

                 {/* Lise */}
                 <div className={`p-3 rounded-xl border ${isEditing ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-white'}`}>
                    <label className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                        <GraduationCap size={14} /> Liseler Komisyonu
                    </label>
                    {isEditing ? (
                        <input 
                            type="number" 
                            min="0"
                            value={editForm.highSchoolCount}
                            onChange={(e) => handleUpdate('highSchoolCount', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-red-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    ) : (
                        <div className="text-2xl font-bold text-slate-700">{profile.highSchoolCount}</div>
                    )}
                 </div>

                 {/* Kaşif */}
                 <div className={`p-3 rounded-xl border ${isEditing ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-white'}`}>
                    <label className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                        <Tent size={14} /> Kaşif Grubu
                    </label>
                    {isEditing ? (
                        <input 
                            type="number" 
                            min="0"
                            value={editForm.kasifGroupCount}
                            onChange={(e) => handleUpdate('kasifGroupCount', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-emerald-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    ) : (
                        <div className="text-2xl font-bold text-slate-700">{profile.kasifGroupCount}</div>
                    )}
                 </div>

                 {/* Karavan */}
                 <div className={`p-3 rounded-xl border ${isEditing ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-white'}`}>
                    <label className="text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center gap-1">
                        <Bus size={14} /> Karavan Grubu
                    </label>
                    {isEditing ? (
                        <input 
                            type="number" 
                            min="0"
                            value={editForm.karavanGroupCount}
                            onChange={(e) => handleUpdate('karavanGroupCount', parseInt(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-indigo-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    ) : (
                        <div className="text-2xl font-bold text-slate-700">{profile.karavanGroupCount}</div>
                    )}
                 </div>
             </div>
             
             <div className={`pt-4 border-t ${isEditing ? 'border-blue-100' : 'border-slate-50'}`}>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mahalle Toplam Üye Sayısı</label>
                <div className="relative">
                    <UserPlus size={16} className="absolute left-3 top-3 text-slate-400" />
                    {isEditing ? (
                         <input 
                            type="number" 
                            min="0"
                            value={editForm.totalMembersCount}
                            onChange={(e) => handleUpdate('totalMembersCount', parseInt(e.target.value) || 0)}
                            className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:bg-white focus:border-blue-500 transition-colors"
                        />
                    ) : (
                        <div className="pl-9 py-2 text-xl font-bold text-slate-800">{profile.totalMembersCount}</div>
                    )}
                </div>
             </div>

             {isSaved && (
                <div className="bg-green-100 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-fade-in">
                    <CheckCircle2 size={20} /> Değişiklikler Kaydedildi
                </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default NeighborhoodProfileView;