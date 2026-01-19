
import React, { useState } from 'react';
import { AppUser } from '../types';
import * as Storage from '../services/storage';
import { User, ShieldCheck, Building, ChevronRight, School } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: AppUser) => void;
}

// Custom Icon for Women's Branch
const HijabWomanIcon = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width={size}
    height={size}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 9a4 4 0 1 1 8 0" />
    <path d="M12 13a4 4 0 0 0-4-4" />
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const allUsers = Storage.MOCK_USERS;

  // Group Users
  const admins = allUsers.filter(u => u.role === 'admin' || u.role === 'organization_president' || u.role.startsWith('district'));
  const neighborhoods = allUsers.filter(u => u.role === 'user');
  const units = allUsers.filter(u => u.role === 'school_president' || u.role === 'neighborhood_womens_rep');

  // Helper to translate roles
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'organization_president': return 'Teşkilat Başkanı';
      case 'district_high_school_admin': return 'İlçe Liseler Başkanı';
      case 'district_middle_school_admin': return 'İlçe Ortaokullar Başkanı';
      case 'district_womens_president': return 'İlçe Hanımlar Başkanı';
      case 'user': return 'Mahalle Başkanı';
      case 'school_president': return 'Okul Başkanı';
      case 'neighborhood_womens_rep': return 'Mahalle Hanımlar Sorumlusu';
      default: return 'Kullanıcı';
    }
  };

  const renderUserItem = (user: AppUser) => {
     let Icon = User;
     let bgClass = "bg-slate-100";
     let textClass = "text-slate-600";

     if (user.role === 'admin' || user.role === 'organization_president') {
        Icon = ShieldCheck;
        bgClass = "bg-blue-100";
        textClass = "text-blue-700";
     } else if (user.role.includes('womens')) {
        // Use custom component but cast to any to satisfy type checker if needed in strict TS, 
        // essentially we just render it directly below instead of assigning to Icon variable if strict types mismatch.
        // However, here we handle it by conditional rendering in the JSX.
        bgClass = "bg-purple-100";
        textClass = "text-purple-700";
     } else if (user.role.includes('school')) {
        Icon = School;
        bgClass = "bg-orange-100";
        textClass = "text-orange-700";
     } else {
        Icon = Building;
        bgClass = "bg-slate-100";
        textClass = "text-slate-700";
     }

     return (
        <button 
            key={user.uid}
            onClick={() => onLogin(user)}
            className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-98 transition-transform group hover:border-blue-200"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center ${textClass}`}>
                    {user.role.includes('womens') ? (
                        <HijabWomanIcon size={20} />
                    ) : (
                        <Icon size={20} />
                    )}
                </div>
                <div className="text-left">
                    <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">
                        {getRoleDisplayName(user.role)}
                    </div>
                </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>
     );
  };

  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto animate-fade-in">
        <div className="min-h-full flex flex-col items-center justify-center p-6">
            
            {/* Logo Area */}
            <div className="mb-10 text-center mt-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-200 mb-4">
                    AGD
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Mobil Portal</h1>
                <p className="text-slate-500 text-sm">Sultangazi Şubesi</p>
            </div>

            {/* Login Lists */}
            <div className="w-full max-w-md space-y-6">
                
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">İlçe Yönetimi</h3>
                    <div className="space-y-2">
                        {admins.map(renderUserItem)}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">Mahalle Başkanları</h3>
                    <div className="space-y-2">
                        {neighborhoods.map(renderUserItem)}
                    </div>
                </div>

                <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">Birim & Komisyonlar</h3>
                     <div className="space-y-2">
                        {units.map(renderUserItem)}
                    </div>
                </div>

            </div>

            <div className="mt-8 mb-4 text-center text-xs text-slate-400">
                AGD Sultangazi Mobil Raporlama Sistemi v3.8
            </div>

        </div>
    </div>
  );
};

export default LoginScreen;
