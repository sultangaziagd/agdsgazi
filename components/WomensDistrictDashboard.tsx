import React, { useState, useEffect } from 'react';
import { WomensReport, AppUser } from '../types';
import * as Storage from '../services/storage';
import { 
  CheckCircle2, Clock, Calendar, ChevronRight, User, Filter, 
  MessageSquare, X, ShieldCheck 
} from 'lucide-react';

const WomensDistrictDashboard: React.FC = () => {
  const [reports, setReports] = useState<WomensReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WomensReport | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  
  // Admin Action State
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const data = Storage.getWomensReports();
    // Sort by timestamp desc
    setReports(data.sort((a,b) => b.timestamp - a.timestamp));
  };

  const filteredReports = reports.filter(r => r.status === activeTab);

  const handleApprove = () => {
    if (!selectedReport) return;
    
    const updated: WomensReport = {
        ...selectedReport,
        status: 'approved',
        adminNote: adminNote
    };
    Storage.updateWomensReport(updated);
    
    // Send notification to the user
    Storage.sendNotification({
        id: crypto.randomUUID(),
        title: 'Rapor Onaylandı',
        message: `${selectedReport.date} tarihli raporunuz İlçe Hanımlar Başkanlığı tarafından onaylandı. Not: ${adminNote || 'Teşekkürler.'}`,
        date: new Date().toLocaleDateString('tr-TR'),
        timestamp: Date.now(),
        senderName: 'İlçe Hanımlar Bşk.',
        isRead: false
    });

    loadReports();
    setSelectedReport(null);
    setAdminNote('');
    alert('Rapor onaylandı ve arşivlendi.');
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
       {/* Header */}
       <div className="bg-purple-800 text-white p-6 rounded-b-3xl shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-white/20 rounded-lg">
                <ShieldCheck size={24} className="text-purple-100" />
             </div>
             <div>
                 <h1 className="font-bold text-xl">İlçe Hanımlar Başkanlığı</h1>
                 <div className="text-xs text-purple-200">Rapor Denetim Paneli</div>
             </div>
          </div>
          <div className="flex p-1 bg-purple-900/50 rounded-xl">
             <button 
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'pending' ? 'bg-white text-purple-900 shadow-sm' : 'text-purple-300'}`}
             >
                Bekleyenler ({reports.filter(r => r.status === 'pending').length})
             </button>
             <button 
                onClick={() => setActiveTab('approved')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'approved' ? 'bg-white text-purple-900 shadow-sm' : 'text-purple-300'}`}
             >
                Arşiv ({reports.filter(r => r.status === 'approved').length})
             </button>
          </div>
       </div>

       {/* List */}
       <div className="px-4 space-y-3">
          {filteredReports.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
                {activeTab === 'pending' ? 'Onay bekleyen rapor yok.' : 'Arşivlenmiş rapor bulunamadı.'}
             </div>
          ) : (
             filteredReports.map(report => (
                <div 
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-98 transition-transform cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                                 {report.neighborhoodName.substring(0,2).toUpperCase()}
                             </div>
                             <div>
                                 <div className="font-bold text-slate-800 text-sm">{report.neighborhoodName}</div>
                                 <div className="text-[10px] text-slate-400">{report.date}</div>
                             </div>
                        </div>
                        {report.status === 'pending' ? (
                            <div className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold flex items-center gap-1">
                                <Clock size={10} /> Bekliyor
                            </div>
                        ) : (
                            <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 size={10} /> Onaylandı
                            </div>
                        )}
                    </div>
                    {/* Summary Chips */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                            Katılım: {report.attendance}
                        </span>
                        <span className="text-[10px] font-bold bg-pink-50 text-pink-700 px-2 py-1 rounded whitespace-nowrap">
                            Ev Sohbeti: {report.homeChatsCount}
                        </span>
                         <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                            Genç: {report.highSchoolGirlsContact + report.universityUnitContact}
                        </span>
                    </div>
                </div>
             ))
          )}
       </div>

       {/* Detail Modal */}
       {selectedReport && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
             <div className="bg-white w-full sm:max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="bg-purple-800 p-4 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-bold">{selectedReport.neighborhoodName} Raporu</h3>
                    <button onClick={() => setSelectedReport(null)} className="p-1 bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                    {/* Management Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Yönetim</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Toplantı</div>
                                <div className="font-bold text-slate-800">{selectedReport.weeklyBoardMeeting ? 'Yapıldı' : 'Yapılmadı'}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Katılım</div>
                                <div className="font-bold text-slate-800">{selectedReport.attendance} Kişi</div>
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Eğitim & Birimler</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between items-center p-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Ev Sohbeti</span>
                                <span className="font-bold text-slate-800">{selectedReport.homeChatsCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Kaşif Grupları</span>
                                <span className="font-bold text-slate-800">{selectedReport.middleSchoolGirlsGroups}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Lise Ulaşım</span>
                                <span className="font-bold text-slate-800">{selectedReport.highSchoolGirlsContact}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Üniv. Ulaşım</span>
                                <span className="font-bold text-slate-800">{selectedReport.universityUnitContact}</span>
                            </div>
                        </div>
                    </div>

                     {/* PR Section */}
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Halkla İlişkiler</h4>
                        <div className="flex justify-between items-center p-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">Ziyaretler</span>
                            <span className="font-bold text-slate-800">{selectedReport.visitations}</span>
                        </div>
                         <div className="flex justify-between items-center p-2 border-b border-slate-50">
                            <span className="text-sm text-slate-600">Hayır Çarşısı</span>
                            <span className="font-bold text-slate-800">{selectedReport.charityWork ? 'Var' : 'Yok'}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <div className="text-xs font-bold text-amber-700 uppercase mb-1">Mahalle Notu</div>
                        <p className="text-sm text-amber-900 italic">{selectedReport.notes || 'Not yok.'}</p>
                    </div>

                    {/* Admin Action Area (Only if Pending) */}
                    {selectedReport.status === 'pending' ? (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="mb-3">
                                <label className="text-xs font-bold text-purple-700 uppercase mb-1 flex items-center gap-1">
                                    <MessageSquare size={12} /> Başkan Notu (Opsiyonel)
                                </label>
                                <textarea 
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Tebrikler, şu konuya dikkat edelim..."
                                    className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl text-sm focus:outline-none focus:border-purple-400"
                                />
                            </div>
                            <button 
                                onClick={handleApprove}
                                className="w-full py-4 bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={18} /> Raporu Onayla
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <div className="text-xs font-bold text-green-700 uppercase mb-1 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Onaylanmış Rapor
                            </div>
                            {selectedReport.adminNote && (
                                <p className="text-sm text-green-900 mt-1">
                                    <span className="font-bold">Notunuz:</span> {selectedReport.adminNote}
                                </p>
                            )}
                        </div>
                    )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default WomensDistrictDashboard;