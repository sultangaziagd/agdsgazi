import React, { useState } from 'react';
import { WeeklyReport, INITIAL_REPORT_FORM, AppUser } from '../types'; // Imported AppUser
import * as Storage from '../services/storage'; // Added storage import
import MiddleSchoolNeighborhoodView from './MiddleSchoolNeighborhoodView'; // Import the new widget
import { ChevronRight, ChevronLeft, CheckCircle2, Save, BookOpen, Building, FileText, ArrowUp, ArrowDown, Minus, GraduationCap } from 'lucide-react';

interface WizardProps {
  onSubmit: (data: typeof INITIAL_REPORT_FORM) => void;
  onCancel: () => void;
  lastReport?: WeeklyReport;
}

// Custom Icon for Women's Branch (Başörtülü Kadın İkonu)
const HijabWomanIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    width="24"
    height="24"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 9a4 4 0 1 1 8 0" />
    <path d="M12 13a4 4 0 0 0-4-4" />
  </svg>
);

const Wizard: React.FC<WizardProps> = ({ onSubmit, onCancel, lastReport }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_REPORT_FORM);
  const currentUser = Storage.getCurrentUser(); // Get current user for the widget
  const TOTAL_STEPS = 5;

  const updateField = (field: keyof typeof INITIAL_REPORT_FORM, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper Inputs
  const NumberInput = ({ label, field, color = "blue" }: { label: string, field: keyof typeof INITIAL_REPORT_FORM, color?: string }) => {
    const prevValue = lastReport ? lastReport[field] as number : undefined;
    const currentValue = formData[field] as number;
    
    // Trend calculation
    let TrendIcon = Minus;
    let trendColor = "text-slate-400";
    if (prevValue !== undefined) {
      if (currentValue > prevValue) {
        TrendIcon = ArrowUp;
        trendColor = "text-green-500";
      } else if (currentValue < prevValue) {
        TrendIcon = ArrowDown;
        trendColor = "text-red-500";
      }
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1 ml-1">
          <label className="block text-xs font-bold text-slate-500 uppercase">{label}</label>
          {prevValue !== undefined && (
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium">Önceki:</span>
              <span className="text-xs font-bold text-slate-600">{prevValue}</span>
              <TrendIcon size={12} className={trendColor} />
            </div>
          )}
        </div>
        <input 
          type="number" 
          min="0"
          value={formData[field] as number}
          onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
          className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white transition-colors text-lg font-semibold focus:border-${color}-500`}
        />
      </div>
    );
  };

  const CheckboxInput = ({ label, field, color = "blue" }: { label: string, field: keyof typeof INITIAL_REPORT_FORM, color?: string }) => (
    <div 
      onClick={() => updateField(field, !formData[field])}
      className={`mb-4 p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        formData[field] 
          ? `bg-${color}-50 border-${color}-500 text-${color}-700` 
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <span className="font-medium text-sm">{label}</span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        formData[field] ? `bg-${color}-500 border-${color}-500` : 'border-slate-300'
      }`}>
        {formData[field] && <CheckCircle2 size={16} className="text-white" />}
      </div>
    </div>
  );

  // Function called when the MiddleSchool Widget updates
  // It recalculates summary stats for the main report
  const handleMiddleSchoolUpdate = () => {
    const allGroups = Storage.getKasifGroups();
    const myGroups = allGroups.filter(g => g.neighborhoodId === currentUser.uid);
    const totalStudents = myGroups.reduce((acc, g) => acc + g.activeStudentCount, 0);
    
    // Auto-update report summary fields
    updateField('middleSchoolGroupCount', myGroups.length);
    updateField('middleSchoolStudentCount', totalStudents);
  };

  const renderStepContent = () => {
    switch(step) {
      case 1: // Step 1: Hanımlar Komisyonu (Pembe Tema)
        return (
          <div className="animate-fade-in">
             <h4 className="flex items-center gap-2 text-lg font-bold text-pink-700 mb-6 pb-2 border-b border-pink-100">
              <HijabWomanIcon className="text-pink-600" /> Hanımlar Komisyonu
            </h4>
            
            <CheckboxInput label="Hanım Komisyonu Toplantısı Yapıldı mı?" field="isWomenMeetingHeld" color="pink" />
            <NumberInput label="Toplantı Katılım Sayısı" field="womenMeetingAttendance" color="pink" />
            
            <div className="h-px bg-pink-100 my-4"></div>
            
            <NumberInput label="Ev Sohbeti / Çay Saati Sayısı" field="womenTeaTalkCount" color="pink" />
            <NumberInput label="Genç Hanımlar Ulaşım Sayısı" field="youngWomenWork" color="pink" />
          </div>
        );

      case 2: // Step 2: Ana Kademe & Yönetim
        return (
          <div className="animate-fade-in">
            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-6 pb-2 border-b">
              <Building className="text-blue-600" /> Ana Kademe Yönetim
            </h4>
            <CheckboxInput label="Haftalık Yönetim Toplantısı Yapıldı mı?" field="isManagementMeetingHeld" />
            <CheckboxInput label="Mahalle Sorumlusu Katıldı mı?" field="isSupervisorAttended" />
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Yönetim Sayısı" field="managementTotalCount" />
              <NumberInput label="Katılım Sayısı" field="managementAttendanceCount" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h5 className="font-semibold text-slate-600 mb-3 text-sm">Halkla İlişkiler</h5>
               <NumberInput label="Genel Sohbet Katılım" field="generalChatAttendance" />
            </div>
          </div>
        );

      case 3: // Step 3: Ortaokul (Kaşif) - MODIFIED to use Widget
        return (
          <div className="animate-fade-in">
             <h4 className="flex items-center gap-2 text-lg font-bold text-orange-700 mb-6 pb-2 border-b border-orange-100">
              <BookOpen className="text-orange-600" /> Ortaokul Çalışmaları
            </h4>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                <p className="text-orange-800 text-xs mb-4 font-medium opacity-80">
                    Aşağıdaki listeden gruplarınızı yönetebilir ve haftalık durumlarını girebilirsiniz.
                    Burada girdiğiniz veriler rapora otomatik yansır.
                </p>
                {/* WIDGET INTEGRATION */}
                <MiddleSchoolNeighborhoodView 
                    currentUser={currentUser} 
                    onUpdate={handleMiddleSchoolUpdate}
                />
            </div>
          </div>
        );

      case 4: // Step 4: Lise (Karavan)
        return (
           <div className="animate-fade-in">
             <h4 className="flex items-center gap-2 text-lg font-bold text-red-700 mb-6 pb-2 border-b border-red-100">
              <GraduationCap className="text-red-600" /> Lise Çalışmaları
            </h4>
            
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
               <h5 className="font-bold text-red-800 mb-3 text-sm border-b border-red-200 pb-1">TEŞKİLAT YAPISI</h5>
               <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Mevcut Okul" field="highSchoolTotalCount" color="red" />
                  <NumberInput label="Okul Başkanı" field="highSchoolPresidentCount" color="red" />
               </div>
               <NumberInput label="Komisyon Sayısı" field="highSchoolStaffCount" color="red" />
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-xl">
              <h5 className="font-bold text-slate-700 mb-3 text-sm border-b border-slate-100 pb-1">FAALİYETLER</h5>
              <NumberInput label="Okuma Grubu Sayısı" field="highSchoolReadingGroupCount" color="red" />
              <NumberInput label="Lise Sohbeti Katılım" field="highSchoolChatAttendance" color="red" />
            </div>
          </div>
        );

      case 5: // Step 5: Diğer
        return (
          <div className="animate-fade-in">
            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-4 pb-2 border-b">
              <FileText className="text-purple-600" /> Diğer & Notlar
            </h4>
            <p className="text-xs text-slate-400 mb-2">Eklemek istediğiniz özel durumlar veya notlar.</p>
            <textarea
              value={formData.otherActivities}
              onChange={(e) => updateField('otherActivities', e.target.value)}
              placeholder="Faaliyet detayları..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 min-h-[150px]"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full pb-24">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Haftalık Rapor</h2>
        <p className="text-slate-500 text-xs">Adım {step} / {TOTAL_STEPS}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300" 
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex-1 flex flex-col overflow-y-auto">
        {renderStepContent()}
      </div>

      <div className="mt-4 flex gap-3">
        {step > 1 ? (
          <button 
            onClick={() => setStep(s => s - 1)}
            className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} /> Geri
          </button>
        ) : (
          <button 
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            İptal
          </button>
        )}
        
        {step < TOTAL_STEPS ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="flex-1 bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Devam <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => onSubmit(formData)}
            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Raporu Gönder <Save size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Wizard;