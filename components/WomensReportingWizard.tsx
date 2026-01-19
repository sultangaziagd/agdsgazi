import React, { useState } from 'react';
import { WomensReport, INITIAL_WOMENS_REPORT, AppUser } from '../types';
import * as Storage from '../services/storage';
import { 
  Heart, Users, CheckCircle2, Save, Minus, ArrowUp, ArrowDown, 
  ChevronRight, ChevronLeft, Home, GraduationCap, BookOpen, Gift
} from 'lucide-react';

interface Props {
  currentUser: AppUser;
  onCancel: () => void;
  onSubmit: () => void;
}

const WomensReportingWizard: React.FC<Props> = ({ currentUser, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState(INITIAL_WOMENS_REPORT);
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const updateField = (field: keyof typeof INITIAL_WOMENS_REPORT, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const report: WomensReport = {
        id: crypto.randomUUID(),
        userId: currentUser.uid,
        neighborhoodName: currentUser.name,
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestamp: Date.now(),
        status: 'pending',
        ...formData
    };
    Storage.saveWomensReport(report);
    onSubmit();
  };

  // Helper Input Components tailored for this theme
  const PurpleNumberInput = ({ label, field, icon }: { label: string, field: keyof typeof INITIAL_WOMENS_REPORT, icon?: React.ReactNode }) => (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase mb-2">
        {icon} {label}
      </label>
      <input 
        type="number" 
        min="0"
        value={formData[field] as number}
        onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
        className="w-full p-4 bg-purple-50 border border-purple-100 rounded-xl focus:outline-none focus:bg-white focus:border-purple-400 transition-colors text-lg font-bold text-purple-900"
      />
    </div>
  );

  const PurpleCheckbox = ({ label, field }: { label: string, field: keyof typeof INITIAL_WOMENS_REPORT }) => (
    <div 
      onClick={() => updateField(field, !formData[field])}
      className={`mb-4 p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        formData[field] 
          ? 'bg-purple-100 border-purple-400 text-purple-800' 
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <span className="font-bold text-sm">{label}</span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        formData[field] ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
      }`}>
        {formData[field] && <CheckCircle2 size={16} className="text-white" />}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-fuchsia-800 p-6 rounded-b-3xl shadow-lg text-white mb-6">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
               <Heart size={20} className="text-pink-200" fill="currentColor" />
            </div>
            <span className="text-purple-100 text-xs font-bold uppercase tracking-wider">Hanımlar Komisyonu</span>
         </div>
         <h2 className="text-2xl font-bold">Hayırlı Çalışmalar Başkanım</h2>
         <p className="text-purple-200 text-sm mt-1 opacity-90">Haftalık raporunuzu bekliyoruz.</p>
      </div>

      <div className="px-4 flex-1 overflow-y-auto">
         {/* Step Progress */}
         <div className="flex gap-2 mb-6">
            {[1,2,3].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-purple-600' : 'bg-purple-200'}`}></div>
            ))}
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
            {step === 1 && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <Users size={20} /> Yönetim & Toplantı
                    </h3>
                    <PurpleCheckbox label="Haftalık Yönetim Toplantısı Yapıldı mı?" field="weeklyBoardMeeting" />
                    <PurpleNumberInput label="Toplantı Katılım Sayısı" field="attendance" />
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <BookOpen size={20} /> Eğitim & Birimler
                    </h3>
                    <PurpleNumberInput label="Ev Sohbeti Sayısı" field="homeChatsCount" icon={<Home size={14}/>} />
                    <PurpleNumberInput label="Liseli Genç Hanım Ulaşım" field="highSchoolGirlsContact" icon={<GraduationCap size={14}/>} />
                    <PurpleNumberInput label="Kaşif (Kız) Grup Sayısı" field="middleSchoolGirlsGroups" icon={<Users size={14}/>} />
                    <PurpleNumberInput label="Üniversiteli Hanım Ulaşım" field="universityUnitContact" icon={<GraduationCap size={14}/>} />
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <Gift size={20} /> Halkla İlişkiler & Notlar
                    </h3>
                    <PurpleNumberInput label="Ziyaret (Hasta/Bebek/Taziye)" field="visitations" />
                    <PurpleCheckbox label="Hayır Çarşısı / Kermes Çalışması" field="charityWork" />
                    
                    <div className="mt-4">
                        <label className="text-xs font-bold text-purple-700 uppercase mb-2 block">Başkan Notu</label>
                        <textarea 
                            value={formData.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-400 min-h-[100px]"
                            placeholder="İlçeye iletmek istediğiniz notlar..."
                        />
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-purple-100 p-4 flex gap-3 z-50">
         {step > 1 ? (
             <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center gap-2">
                <ChevronLeft size={18} /> Geri
             </button>
         ) : (
             <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold">
                 İptal
             </button>
         )}

         {step < TOTAL_STEPS ? (
             <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                 Devam <ChevronRight size={18} />
             </button>
         ) : (
             <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-fuchsia-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200">
                 Raporu Gönder <Save size={18} />
             </button>
         )}
      </div>
    </div>
  );
};

export default WomensReportingWizard;