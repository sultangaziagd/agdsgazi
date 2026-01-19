import React, { useState, useEffect } from 'react';
import { School, SchoolPresident, PresidentWeeklyLog } from '../types';
import * as Storage from '../services/storage';
import { Search, MapPin, UserCheck, UserX, School as SchoolIcon, ChevronRight, Filter, Printer } from 'lucide-react';

interface SchoolListProps {
  onSchoolSelect: (school: School) => void;
}

interface ReportRow {
  schoolName: string;
  presidentName: string;
  lastUpdate: string;
  attendedMeeting: boolean;
  chatHeld: boolean;
  newMembers: number;
  notes: string;
}

const SchoolList: React.FC<SchoolListProps> = ({ onSchoolSelect }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'no-president'>('all');

  // Report Generation State
  const [reportData, setReportData] = useState<ReportRow[]>([]);

  useEffect(() => {
    const data = Storage.getSchools();
    setSchools(data);
    setFilteredSchools(data);
  }, []);

  useEffect(() => {
    let result = schools;

    // Apply Search
    if (searchTerm) {
      result = result.filter(s => 
        s.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply Filter
    if (filterType === 'no-president') {
      result = result.filter(s => !s.presidentName);
    }

    setFilteredSchools(result);
  }, [searchTerm, filterType, schools]);

  const handlePrintReport = () => {
    // 1. Gather all data
    const allPresidents = Storage.getPresidents();
    const rows: ReportRow[] = schools.map(school => {
      const president = allPresidents.find(p => p.schoolId === school.id);
      let logs: PresidentWeeklyLog[] = [];
      if (president) {
        logs = Storage.getPresidentLogs(president.id);
      }
      
      const lastLog = logs.length > 0 ? logs[0] : null;

      return {
        schoolName: school.schoolName,
        presidentName: president ? president.fullName : 'Başkan Yok',
        lastUpdate: lastLog ? lastLog.dateFormatted : '-',
        attendedMeeting: lastLog ? lastLog.attendedMeeting : false,
        chatHeld: lastLog ? lastLog.performedSchoolActivity : false,
        newMembers: lastLog ? lastLog.recruitedNewMember : 0,
        notes: lastLog?.notes || '-'
      };
    });

    setReportData(rows);

    // 2. Trigger Print (timeout to allow React to render the hidden table)
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24">
      
      {/* --- HIDDEN PRINT TEMPLATE --- */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Hide the main app UI explicitly to be safe */
          .app-container {
             display: none;
          }
        }
      `}</style>
      
      <div id="print-area" className="hidden print:block p-8 bg-white text-black">
         {/* Header */}
         <div className="text-center mb-8 border-b-2 border-black pb-4">
             <div className="text-sm font-bold tracking-[0.2em] mb-1">ANADOLU GENÇLİK DERNEĞİ</div>
             <div className="text-2xl font-bold mb-2">SULTANGAZİ ŞUBESİ</div>
             <div className="text-xl font-medium uppercase border bg-black text-white inline-block px-4 py-1">Liseler Komisyonu Haftalık Raporu</div>
             <div className="text-sm mt-2 text-right">Tarih: {new Date().toLocaleDateString('tr-TR')}</div>
         </div>

         {/* Table */}
         <table className="w-full border-collapse border border-black text-sm">
             <thead>
                 <tr className="bg-gray-200">
                     <th className="border border-black p-2 text-left">Okul Adı</th>
                     <th className="border border-black p-2 text-left">Okul Başkanı</th>
                     <th className="border border-black p-2 text-center">Toplantı</th>
                     <th className="border border-black p-2 text-center">Sohbet</th>
                     <th className="border border-black p-2 text-center">Yeni Üye</th>
                     <th className="border border-black p-2 text-left w-1/4">Notlar</th>
                 </tr>
             </thead>
             <tbody>
                 {reportData.map((row, idx) => (
                     <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                         <td className="border border-black p-2 font-medium">{row.schoolName}</td>
                         <td className="border border-black p-2">
                            {row.presidentName}
                            {row.presidentName !== 'Başkan Yok' && <span className="block text-[10px] text-gray-500">Son Veri: {row.lastUpdate}</span>}
                         </td>
                         <td className="border border-black p-2 text-center font-bold">
                             {row.attendedMeeting ? 'VAR' : '-'}
                         </td>
                         <td className="border border-black p-2 text-center font-bold">
                             {row.chatHeld ? 'VAR' : '-'}
                         </td>
                         <td className="border border-black p-2 text-center font-bold">
                             {row.newMembers > 0 ? `+${row.newMembers}` : '-'}
                         </td>
                         <td className="border border-black p-2 text-xs italic">
                             {row.notes}
                         </td>
                     </tr>
                 ))}
             </tbody>
         </table>

         {/* Signatures */}
         <div className="mt-16 flex justify-between px-10">
             <div className="text-center">
                 <div className="font-bold mb-16">İlçe Liseler Başkanı</div>
                 <div className="border-t border-black w-32 mx-auto"></div>
             </div>
             <div className="text-center">
                 <div className="font-bold mb-16">Teşkilat Başkanı</div>
                 <div className="border-t border-black w-32 mx-auto"></div>
             </div>
         </div>
      </div>
      {/* --- END PRINT TEMPLATE --- */}

      {/* Header Area */}
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10 print:hidden">
        <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <SchoolIcon className="text-blue-700" /> Okul Yönetim Paneli
            </h2>
            <button 
                onClick={handlePrintReport}
                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-xs font-bold"
            >
                <Printer size={16} /> <span className="hidden sm:inline">Toplu Rapor Al</span>
            </button>
        </div>
        
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Okul veya mahalle ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterType === 'all' 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Tümü
          </button>
          <button 
            onClick={() => setFilterType('no-president')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === 'no-president' 
                ? 'bg-red-500 text-white shadow-md' 
                : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
            }`}
          >
            <UserX size={12} /> Başkanı Olmayanlar
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="p-4 space-y-3 overflow-y-auto print:hidden">
        {filteredSchools.map(school => (
          <div 
            key={school.id}
            onClick={() => onSchoolSelect(school)}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-98 transition-all flex justify-between items-center cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800">{school.schoolName}</h3>
                {school.presidentName ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-100" title="Başkan Atanmış"></div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100" title="Başkan Yok"></div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  {school.neighborhood}
                </div>
                {school.presidentName && (
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <UserCheck size={12} className="text-blue-500" />
                    {school.presidentName}
                  </div>
                )}
              </div>
            </div>
            
            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        ))}
        
        {filteredSchools.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            Aradığınız kriterlere uygun okul bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolList;