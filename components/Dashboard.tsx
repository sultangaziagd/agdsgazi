import React, { useState, useMemo } from 'react';
import { WeeklyReport, AppUser } from '../types';
import { generateWeeklyReportPDF } from '../services/pdfGenerator'; // Import PDF Service
import { 
  FileText, Calendar, ChevronRight, User, Users, Building, 
  BarChart2, Briefcase, Filter, Clock, GraduationCap, BookOpen, 
  TrendingUp, Activity, FileDown, CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  currentUser: AppUser;
  reports: WeeklyReport[];
  onViewAll: () => void;
  renderReportItem: (report: WeeklyReport) => React.ReactNode;
}

type TimeFilter = 'week' | 'month' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ currentUser, reports, onViewAll, renderReportItem }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  
  const isUser = currentUser.role === 'user';
  const isOrgPresident = currentUser.role === 'organization_president';
  const isAdmin = currentUser.role === 'admin';
  const isDistrictLevel = isOrgPresident || isAdmin;

  // --- FILTER LOGIC ---
  const filteredReports = useMemo(() => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    return reports.filter(r => {
      if (timeFilter === 'week') return (now - r.timestamp) < oneWeek;
      if (timeFilter === 'month') return (now - r.timestamp) < oneMonth;
      return true;
    });
  }, [reports, timeFilter]);

  // --- NEIGHBORHOOD GROUPING (For Cards) ---
  // We need the LATEST report for each neighborhood within the filtered range for the "Cards"
  const neighborhoodSnapshots = useMemo(() => {
    const map = new Map<string, WeeklyReport>();
    filteredReports.forEach(r => {
      // Since reports are sorted by date desc in parent, the first one we see is the latest
      if (!map.has(r.neighborhoodName)) {
        map.set(r.neighborhoodName, r);
      }
    });
    return Array.from(map.values());
  }, [filteredReports]);

  // --- AGGREGATION LOGIC (For Bottom Stats) ---
  // Performance (Activities) should be SUMMED.
  // Stock (Student Counts) should use the LATEST snapshot of each neighborhood to avoid double counting.
  const stats = useMemo(() => {
    // 1. Calculate Activity Totals (Sum of all reports in range)
    const activityTotals = filteredReports.reduce((acc, r) => ({
      managementAttendance: acc.managementAttendance + r.managementAttendanceCount,
      womenAttendance: acc.womenAttendance + r.womenMeetingAttendance,
      middleSchoolChat: acc.middleSchoolChat + (r.isManagementMeetingHeld ? 1 : 0), // Mock logic
      highSchoolChat: acc.highSchoolChat + r.highSchoolChatAttendance,
      generalChat: acc.generalChat + r.generalChatAttendance
    }), {
      managementAttendance: 0,
      womenAttendance: 0,
      middleSchoolChat: 0,
      highSchoolChat: 0,
      generalChat: 0
    });

    // 2. Calculate Stock Totals (Sum of latest snapshot of each neighborhood)
    const stockTotals = neighborhoodSnapshots.reduce((acc, r) => ({
      managementTotal: acc.managementTotal + r.managementTotalCount,
      middleSchoolStudents: acc.middleSchoolStudents + r.middleSchoolStudentCount,
      highSchoolTotal: acc.highSchoolTotal + r.highSchoolTotalCount,
      readingGroups: acc.readingGroups + r.highSchoolReadingGroupCount
    }), {
      managementTotal: 0,
      middleSchoolStudents: 0,
      highSchoolTotal: 0,
      readingGroups: 0
    });

    return { ...activityTotals, ...stockTotals };
  }, [filteredReports, neighborhoodSnapshots]);

  const getHeaderContent = () => {
    if (isOrgPresident) {
      return {
        title: 'Teşkilat Başkanı',
        subtitle: 'Teşkilatın nabzı burada atıyor.',
        icon: <Briefcase size={20} className="text-white" />,
        colorClass: 'from-slate-800 to-slate-900'
      };
    } else if (isAdmin) {
      return {
        title: 'İlçe Yönetimi',
        subtitle: 'Tüm birimlerin rapor özeti.',
        icon: <Building size={20} className="text-white" />,
        colorClass: 'from-blue-800 to-blue-600'
      };
    } else {
      return {
        title: 'Mahalle Başkanı',
        subtitle: 'Haftalık raporlarınızı takip edin.',
        icon: <User size={20} className="text-white" />,
        colorClass: 'from-blue-800 to-blue-600'
      };
    }
  };

  const header = getHeaderContent();

  // Override renderReportItem to inject PDF button
  // Note: The parent passes a simple render function, but here we want to enhance it.
  // Ideally, we'd modify the parent, but for this specific request to add it to dashboard/detail view,
  // we will wrap the logic here.
  
  const handleDownloadPDF = (e: React.MouseEvent, report: WeeklyReport) => {
    e.stopPropagation();
    generateWeeklyReportPDF(report);
  };

  const renderEnhancedReportItem = (report: WeeklyReport) => {
      // We can reuse the parent's render logic if possible, or fully reconstruct it here to add the button.
      // Since `renderReportItem` returns a ReactNode, we can't easily "inject" a button into it without rewriting the JSX.
      // So we will rewrite the card JSX here to include the PDF button.
      
      const isPending = report.status === 'pending';
      const middleSchoolTotal = report.middleSchoolStudentCount;
      const highSchoolTotal = (report.highSchoolReadingStudentCount || 0) + (report.highSchoolChatAttendance || 0);
      const womenScore = report.womenMeetingAttendance + report.womenTeaTalkCount;
  
      return (
        <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4 transition-all hover:shadow-md group relative">
          <div className="bg-slate-50/50 p-3 flex justify-between items-center border-b border-slate-100">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                 {report.neighborhoodName.substring(0, 2).toUpperCase()}
               </div>
               <div>
                 <div className="font-bold text-slate-800 text-xs">{report.neighborhoodName}</div>
                 <div className="text-[10px] text-slate-400 font-medium">{report.date}</div>
               </div>
             </div>
             
             <div className="flex items-center gap-2">
                {/* PDF DOWNLOAD BUTTON */}
                <button 
                  onClick={(e) => handleDownloadPDF(e, report)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                  title="Resmi PDF İndir"
                >
                    <FileDown size={14} />
                </button>

                {isPending ? (
                  <div className="px-2 py-1 bg-amber-50 border border-amber-100 rounded text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Bekliyor
                  </div>
                ) : (
                  <div className="px-2 py-1 bg-green-50 border border-green-100 rounded text-[10px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                  </div>
                )}
             </div>
          </div>
          
          <div className="p-3 grid grid-cols-3 gap-2">
            {/* Yönetim */}
            <div className="bg-blue-50/30 rounded-xl p-2 border border-blue-50 flex flex-col justify-between min-h-[60px]">
               <div className="flex items-center gap-1 mb-1">
                 <Building size={11} className="text-blue-600" />
                 <span className="text-[9px] font-bold text-blue-800 uppercase tracking-tight">Yönetim</span>
               </div>
               <div>
                  <div className="text-[9px] text-slate-400 leading-none mb-0.5">Toplantı</div>
                  <div className="flex items-center gap-1">
                      <div className="text-xs font-bold text-slate-700">
                        {report.managementAttendanceCount}<span className="text-[9px] text-slate-400 font-normal">/{report.managementTotalCount}</span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${report.isManagementMeetingHeld ? 'bg-green-500' : 'bg-red-400'}`}></div>
                  </div>
               </div>
            </div>
  
            {/* Ortaokul */}
            <div className="bg-orange-50/30 rounded-xl p-2 border border-orange-50 flex flex-col justify-between min-h-[60px]">
               <div className="flex items-center gap-1 mb-1">
                 <BookOpen size={11} className="text-orange-600" />
                 <span className="text-[9px] font-bold text-orange-800 uppercase tracking-tight">Ortaokul</span>
               </div>
               <div>
                  <div className="text-[9px] text-slate-400 leading-none mb-0.5">Öğrenci</div>
                  <div className="text-xs font-bold text-slate-700">{middleSchoolTotal}</div>
               </div>
            </div>
  
            {/* Liseler */}
            <div className="bg-red-50/30 rounded-xl p-2 border border-red-50 flex flex-col justify-between min-h-[60px]">
               <div className="flex items-center gap-1 mb-1">
                 <GraduationCap size={11} className="text-red-600" />
                 <span className="text-[9px] font-bold text-red-800 uppercase tracking-tight">Liseler</span>
               </div>
               <div className="flex justify-between items-end">
                 <div>
                    <div className="text-[9px] text-slate-400 leading-none mb-0.5">Ulaşım</div>
                    <div className="text-xs font-bold text-slate-700">{highSchoolTotal}</div>
                 </div>
                 {report.highSchoolPresidentCount > 0 && (
                   <div className="px-1 py-0.5 bg-red-100 rounded text-[8px] font-bold text-red-600 leading-none">
                      {report.highSchoolPresidentCount} Bşk
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          <div className="px-4 pb-3 flex items-center gap-4 text-xs text-slate-500">
             <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
               <span>Hanımlar: <b>{womenScore}</b></span>
             </div>
             <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
               <span>Sohbet: <b>{report.generalChatAttendance}</b></span>
             </div>
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${header.colorClass} p-6 rounded-2xl shadow-lg text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {header.icon}
          </div>
          <span className="text-blue-100 text-xs font-medium uppercase tracking-wider">
            {header.title}
          </span>
        </div>
        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
        <div className="flex justify-between items-end">
           <p className="text-blue-100 text-sm mt-1 opacity-90">{header.subtitle}</p>
           {isDistrictLevel && (
             <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1">
               <Activity size={12} /> {filteredReports.length} Rapor
             </div>
           )}
        </div>
      </div>

      {/* --- TIME FILTER SELECTOR --- */}
      {isDistrictLevel && (
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex gap-1">
          {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                timeFilter === f 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f === 'week' ? 'Bu Hafta' : f === 'month' ? 'Bu Ay' : 'Tümü'}
            </button>
          ))}
        </div>
      )}

      {/* --- SECTION 1: NEIGHBORHOOD STATUS CARDS (Grid) --- */}
      {isDistrictLevel && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Building size={16} className="text-slate-500" />
            <h3 className="font-bold text-slate-700">Mahalle Bazlı Son Durum</h3>
          </div>
          
          {neighborhoodSnapshots.length === 0 ? (
             <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                Seçilen aralıkta rapor gönderen mahalle bulunamadı.
             </div>
          ) : (
             <div className="grid grid-cols-2 gap-3">
               {neighborhoodSnapshots.map((report) => (
                 <div key={report.neighborhoodName} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {report.neighborhoodName.substring(0, 2).toUpperCase()}
                       </div>
                       <span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                          {report.date.split(' ').slice(0,2).join(' ')}
                       </span>
                    </div>
                    <div className="pl-2 mb-2">
                       <h4 className="font-bold text-slate-800 text-xs truncate">{report.neighborhoodName}</h4>
                       <span className="text-[10px] text-slate-400">Yönetim: {report.managementTotalCount}</span>
                    </div>
                    <div className="pl-2 pt-2 border-t border-slate-50 flex gap-2">
                       <div className="flex items-center gap-1">
                          <BookOpen size={10} className="text-orange-500" />
                          <span className="text-[10px] font-bold text-slate-600">{report.middleSchoolStudentCount}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <GraduationCap size={10} className="text-red-500" />
                          <span className="text-[10px] font-bold text-slate-600">{report.highSchoolReadingStudentCount}</span>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      )}

      {/* --- REPORTS LIST (Modified) --- */}
      <div className="space-y-3">
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-500" />
                <h3 className="font-bold text-slate-700">
                {isUser ? 'Geçmiş Raporlarım' : 'Son Gelen Raporlar'}
                </h3>
            </div>
            <button onClick={onViewAll} className="text-xs text-blue-600 font-medium flex items-center gap-1">
            Tümü <ChevronRight size={14} />
            </button>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Calendar size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm font-medium">Bu aralıkta rapor bulunamadı.</p>
            {isUser && <p className="text-slate-300 text-xs mt-1">"+" butonuna basarak ekleyebilirsiniz.</p>}
          </div>
        ) : (
          // Use our enhanced render function that includes the PDF button
          filteredReports.slice(0, 5).map(report => renderEnhancedReportItem(report))
        )}
      </div>

      {/* --- SECTION 2: AGGREGATED STATS (Bottom) --- */}
      {isDistrictLevel && filteredReports.length > 0 && (
         <div className="space-y-3 pt-4 border-t border-slate-200">
             <div className="flex items-center gap-2 px-1 mb-2">
                <BarChart2 size={16} className="text-slate-500" />
                <h3 className="font-bold text-slate-700">Birim Bazlı Toplam İstatistikler</h3>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-auto font-bold">
                    {timeFilter === 'week' ? 'Haftalık' : timeFilter === 'month' ? 'Aylık' : 'Genel'}
                </span>
             </div>

             <div className="grid grid-cols-2 gap-3">
                 {/* Middle School Stats */}
                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                     <div className="flex items-center gap-2 mb-3 border-b border-orange-200 pb-2">
                         <BookOpen size={16} className="text-orange-600" />
                         <span className="text-xs font-bold text-orange-800 uppercase">Ortaokul</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-xs text-orange-700">Ulaşılan Öğrenci</span>
                         <span className="text-lg font-bold text-orange-900">{stats.middleSchoolStudents}</span>
                     </div>
                 </div>

                 {/* High School Stats */}
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                     <div className="flex items-center gap-2 mb-3 border-b border-red-200 pb-2">
                         <GraduationCap size={16} className="text-red-600" />
                         <span className="text-xs font-bold text-red-800 uppercase">Liseler</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-xs text-red-700">Okuma Grubu</span>
                         <span className="text-lg font-bold text-red-900">{stats.readingGroups}</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-xs text-red-700">Sohbet Katılım</span>
                         <span className="text-lg font-bold text-red-900">{stats.highSchoolChat}</span>
                     </div>
                 </div>

                 {/* Management Stats */}
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
                         <Building size={16} className="text-blue-600" />
                         <span className="text-xs font-bold text-blue-800 uppercase">Yönetim</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-xs text-blue-700">Mevcut Üye</span>
                         <span className="text-lg font-bold text-blue-900">{stats.managementTotal}</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-xs text-blue-700">Toplantı Katılım</span>
                         <span className="text-lg font-bold text-blue-900">{stats.managementAttendance}</span>
                     </div>
                 </div>

                 {/* Women Stats */}
                 <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                     <div className="flex items-center gap-2 mb-3 border-b border-pink-200 pb-2">
                         <Users size={16} className="text-pink-600" />
                         <span className="text-xs font-bold text-pink-800 uppercase">Hanımlar</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-xs text-pink-700">Toplantı Katılım</span>
                         <span className="text-lg font-bold text-pink-900">{stats.womenAttendance}</span>
                     </div>
                 </div>
             </div>
         </div>
      )}

    </div>
  );
};

export default Dashboard;