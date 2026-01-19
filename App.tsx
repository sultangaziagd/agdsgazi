
import React, { useState, useEffect } from 'react';
import { ViewState, WeeklyReport, AppUser, INITIAL_REPORT_FORM, MonthlyTask, Notification, School, SchoolPresident, WomensReport } from './types';
import * as Storage from './services/storage';
// LoginScreen removed
import Wizard from './components/Wizard';
import Dashboard from './components/Dashboard';
import TaskAssignment from './components/TaskAssignment';
import Goals from './components/Goals';
import SchoolList from './components/SchoolList';
import SchoolDetail from './components/SchoolDetail';
import PresidentList from './components/PresidentList';
import PresidentDetail from './components/PresidentDetail';
import SchoolPresidentDashboard from './components/SchoolPresidentDashboard';
import MiddleSchoolDistrictDashboard from './components/MiddleSchoolDistrictDashboard'; 
import NeighborhoodProfileView from './components/NeighborhoodProfileView';
import WomensReportingWizard from './components/WomensReportingWizard'; 
import WomensDistrictDashboard from './components/WomensDistrictDashboard'; 
import { 
  Home, 
  List, 
  User, 
  Plus, 
  CheckCircle2, 
  ClipboardList,
  Target,
  Bell,
  X,
  Send,
  Building,
  GraduationCap,
  Users,
  BookOpen,
  LogOut 
} from 'lucide-react';

// --- Components for Notification Modal ---
const NotificationModal = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (!title || !message) return;
    
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      date: new Date().toLocaleDateString('tr-TR'),
      timestamp: Date.now(),
      senderName: 'İlçe Yönetimi',
      isRead: false
    };
    
    Storage.sendNotification(newNotification);
    alert('Bildirim tüm kullanıcılara gönderildi.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">Anlık Bildirim Gönder</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Başlık</label>
            <input 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500" 
              placeholder="Örn: Acil Toplantı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mesaj</label>
            <textarea 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 h-24" 
              placeholder="Mesajınızı buraya yazın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSend}
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            <Send size={18} /> Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsList = ({ notifications, onClose }: { notifications: Notification[], onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
    <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Bell className="text-blue-600" /> Bildirimler
        </h3>
        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
          <X size={20} className="text-slate-600" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Hiç bildiriminiz yok.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800 text-sm">{n.title}</span>
                <span className="text-[10px] text-slate-400">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home'); // Directly start at home
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  // Womens Reports State
  const [womensReports, setWomensReports] = useState<WomensReport[]>([]);
  
  const [currentUser, setCurrentUser] = useState<AppUser>(Storage.MOCK_USERS[0]); // Default to Admin/First User
  
  // School Admin State
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedPresident, setSelectedPresident] = useState<SchoolPresident | null>(null);

  // Notification States
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial Load
  useEffect(() => {
    // Always load user from storage or default to MOCK_USERS[0] if null
    // This bypasses login screen
    const savedUser = Storage.getCurrentUser();
    const activeUser = savedUser || Storage.MOCK_USERS[0];
    
    // Ensure we have a user in storage if it was empty
    if (!savedUser) {
        Storage.setCurrentUser(activeUser);
    }
    
    setCurrentUser(activeUser);
    handleRoleRouting(activeUser);
    
    // Load Notifications
    const notifs = Storage.getNotifications();
    setNotifications(notifs.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const handleRoleRouting = (user: AppUser) => {
    // If we are already on a specific detail view, don't reset to home automatically on re-renders
    // But for initial load it's fine.
    
    if (user.role === 'district_high_school_admin') {
      setCurrentView('school-list');
    } else if (user.role === 'district_middle_school_admin') {
      setCurrentView('middle-school-dashboard'); 
    } else if (user.role === 'school_president') {
      setCurrentView('home');
    } else if (user.role === 'district_womens_president') {
      setCurrentView('home'); 
    } else if (user.role === 'neighborhood_womens_rep') {
      loadWomensReports(user);
      setCurrentView('home'); 
    } else {
      loadReports(user);
      setCurrentView('home');
    }
  };

  const loadReports = (user: AppUser) => {
    const data = Storage.getReportsForUser(user);
    setReports(data.sort((a, b) => b.timestamp - a.timestamp));
  };
  
  const loadWomensReports = (user: AppUser) => {
    const data = Storage.getWomensReportsForUser(user.uid);
    setWomensReports(data);
  };

  // handleLogin removed as we bypass it

  const handleLogout = () => {
      // Since login is removed, logout could just reset to default admin or reload
      if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
          Storage.logoutUser();
          window.location.reload();
      }
  };

  const handleWizardSubmit = (formData: typeof INITIAL_REPORT_FORM) => {
    const newReport: WeeklyReport = {
      id: crypto.randomUUID(),
      userId: currentUser.uid,
      neighborhoodName: currentUser.name,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
      status: 'pending',
      ...formData
    };

    Storage.saveReport(newReport);
    loadReports(currentUser);
    setCurrentView('home');
  };

  const handleWomensWizardSubmit = () => {
    loadWomensReports(currentUser);
    setCurrentView('home');
  };

  const handleTaskCreate = (task: MonthlyTask) => {
    Storage.saveMonthlyTask(task);
    alert('Görev başarıyla oluşturuldu ve mahallelere atandı.');
    setCurrentView('home');
  };

  // --- REDESIGNED REPORT CARD (Main Branch) ---
  const renderReportItem = (report: WeeklyReport) => {
    const isPending = report.status === 'pending';
    
    // Split totals
    const middleSchoolTotal = report.middleSchoolStudentCount;
    const highSchoolTotal = (report.highSchoolReadingStudentCount || 0) + (report.highSchoolChatAttendance || 0);
    const womenScore = report.womenMeetingAttendance + report.womenTeaTalkCount;

    return (
      <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4 transition-all hover:shadow-md">
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
           
           {isPending ? (
             <div className="px-2 py-1 bg-amber-50 border border-amber-100 rounded text-[10px] font-bold text-amber-600 flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Bekliyor
             </div>
           ) : (
             <div className="px-2 py-1 bg-green-50 border border-green-100 rounded text-[10px] font-bold text-green-600 flex items-center gap-1">
               <CheckCircle2 size={10} /> Onaylandı
             </div>
           )}
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
  };

  // --- RENDER WOMENS REPORT ITEM ---
  const renderWomensReportItem = (report: WomensReport) => (
    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-4">
        <div className="bg-purple-50/50 p-3 flex justify-between items-center border-b border-purple-100">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {report.neighborhoodName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <div className="font-bold text-slate-800 text-xs">{report.neighborhoodName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{report.date}</div>
                </div>
            </div>
            {report.status === 'pending' ? (
                <div className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">Bekliyor</div>
            ) : (
                <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold">Onaylandı</div>
            )}
        </div>
        <div className="p-3 grid grid-cols-2 gap-2 text-xs">
             <div className="bg-slate-50 p-2 rounded">
                 <span className="text-slate-400 block mb-1">Toplantı</span>
                 <span className="font-bold text-slate-700">{report.attendance} Kişi</span>
             </div>
             <div className="bg-slate-50 p-2 rounded">
                 <span className="text-slate-400 block mb-1">Genç Ulaşım</span>
                 <span className="font-bold text-slate-700">{report.highSchoolGirlsContact + report.universityUnitContact}</span>
             </div>
        </div>
        {report.adminNote && (
            <div className="px-4 py-2 bg-green-50 text-green-800 text-xs border-t border-green-100">
                <span className="font-bold">Not:</span> {report.adminNote}
            </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 bg-white px-4 flex items-center justify-between border-b border-slate-100 z-10 shrink-0 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${currentUser.role.includes('womens') ? 'bg-gradient-to-br from-purple-700 to-fuchsia-800' : 'bg-gradient-to-br from-blue-700 to-indigo-800'} text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-md shadow-blue-200`}>
            AGD
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-none">Teşkilat</h1>
            <span className="text-[10px] text-slate-400">Raporlama Sistemi v3.8</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotificationList(true)}
            className="relative w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} className="text-slate-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <button className="flex items-center gap-2 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${currentUser.role.includes('womens') ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            {currentUser.name.length > 10 ? currentUser.name.substring(0, 8) + '...' : currentUser.name}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-0 no-scrollbar">
          
        {/* VIEW: DISTRICT WOMENS DASHBOARD */}
        {currentUser.role === 'district_womens_president' && currentView === 'home' && (
            <WomensDistrictDashboard />
        )}

        {/* VIEW: NEIGHBORHOOD WOMENS HOME */}
        {currentUser.role === 'neighborhood_womens_rep' && currentView === 'home' && (
            <div className="p-4 space-y-4">
                <div className="bg-purple-700 text-white p-5 rounded-2xl shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg">Hoş Geldiniz</h2>
                        <p className="text-purple-200 text-sm">{currentUser.name}</p>
                    </div>
                    <button onClick={() => setCurrentView('womens-report-wizard')} className="bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        + Rapor Yaz
                    </button>
                </div>
                
                <div>
                    <h3 className="font-bold text-slate-700 mb-3 ml-1">Geçmiş Raporlarım</h3>
                    {womensReports.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">Henüz rapor girişi yapmadınız.</div>
                    ) : (
                        womensReports.map(renderWomensReportItem)
                    )}
                </div>
            </div>
        )}

        {/* VIEW: WOMENS WIZARD */}
        {currentView === 'womens-report-wizard' && (
            <WomensReportingWizard 
                currentUser={currentUser}
                onCancel={() => setCurrentView('home')}
                onSubmit={handleWomensWizardSubmit}
            />
        )}


        {/* EXISTING VIEWS BELOW ... */}

        {/* VIEW: SCHOOL PRESIDENT DASHBOARD */}
        {currentUser.role === 'school_president' && currentView === 'home' && (
        <SchoolPresidentDashboard currentUser={currentUser} />
        )}

        {/* VIEW: MIDDLE SCHOOL DISTRICT DASHBOARD */}
        {currentView === 'middle-school-dashboard' && (
        <MiddleSchoolDistrictDashboard />
        )}

        {/* VIEW: SCHOOL LIST (High School Admin) */}
        {currentView === 'school-list' && (
        <SchoolList onSchoolSelect={(school) => {
            setSelectedSchool(school);
            setCurrentView('school-detail');
        }} />
        )}

        {/* VIEW: SCHOOL DETAIL */}
        {currentView === 'school-detail' && selectedSchool && (
        <SchoolDetail 
            school={selectedSchool}
            onBack={() => setCurrentView('school-list')}
        />
        )}

        {/* VIEW: PRESIDENT LIST */}
        {currentView === 'president-list' && (
        <PresidentList onPresidentSelect={(president) => {
            setSelectedPresident(president);
            setCurrentView('president-detail');
        }} />
        )}

        {/* VIEW: PRESIDENT DETAIL */}
        {currentView === 'president-detail' && selectedPresident && (
        <PresidentDetail 
            president={selectedPresident} 
            onBack={() => setCurrentView('president-list')} 
        />
        )}


        {/* VIEW: STANDARD DASHBOARD (Main Branch) */}
        {currentView === 'home' && 
        !currentUser.role.includes('womens') && 
        currentUser.role !== 'school_president' && (
        <div className="p-4">
            <Dashboard 
            currentUser={currentUser}
            reports={reports} 
            onViewAll={() => setCurrentView('list')} 
            renderReportItem={renderReportItem}
            />
        </div>
        )}

        {currentView === 'wizard' && (
        <div className="p-4 h-full">
            <Wizard 
            onSubmit={handleWizardSubmit} 
            onCancel={() => setCurrentView('home')}
            lastReport={reports.length > 0 ? reports[0] : undefined}
            />
        </div>
        )}
        
        {currentView === 'task-assignment' && (
        <div className="p-4 h-full">
            <TaskAssignment 
            onSave={handleTaskCreate}
            onCancel={() => setCurrentView('home')}
            />
        </div>
        )}

        {currentView === 'list' && (
        <div className="p-4 animate-fade-in pb-20">
            <h3 className="font-bold text-slate-700 text-lg mb-4 pl-1 border-l-4 border-blue-600 ml-1">Tüm Raporlar</h3>
            <div className="space-y-1">
            {reports.map(renderReportItem)}
            </div>
        </div>
        )}

        {currentView === 'profile' && (
        <div className="p-4 animate-fade-in pb-28">
            <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Hesap & Ayarlar</h2>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={14} /> Çıkış Yap
                  </button>
            </div>
            
            {/* NEIGHBORHOOD PROFILE MODULE (Only for Users) */}
            {currentUser.role === 'user' && (
                <div className="mb-6">
                <NeighborhoodProfileView currentUser={currentUser} />
                </div>
            )}
            
            {currentUser.role === 'admin' && (
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Yönetici Paneli</h3>
                
                <button 
                    onClick={() => setCurrentView('task-assignment')}
                    className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ClipboardList size={20} />
                    </div>
                    <span className="font-medium">Yeni İlçe Görevi Ata</span>
                    </div>
                </button>

                <button 
                    onClick={() => setShowSendNotification(true)}
                    className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Bell size={20} />
                    </div>
                    <span className="font-medium">Anlık Bildirim Gönder</span>
                    </div>
                </button>
            </div>
            )}
        </div>
        )}

        {currentView === 'goals' && (
        <div className="p-4 h-full">
            <Goals currentUser={currentUser} />
        </div>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-[80px] bg-white border-t border-slate-100 flex justify-around items-center px-2 z-50 rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-2 print:hidden">
          
        {/* SCENARIO 4: WOMENS COMMISSION */}
        {currentUser.role.includes('womens') ? (
            <>
                <button onClick={() => setCurrentView('home')} className={`nav-btn ${currentView === 'home' || currentView === 'womens-report-wizard' ? 'text-purple-700' : 'text-slate-400'}`}>
                    <Home size={22} strokeWidth={currentView === 'home' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium mt-1">Ana Sayfa</span>
                </button>
                <button onClick={() => setCurrentView('profile')} className={`nav-btn ${currentView === 'profile' ? 'text-purple-700' : 'text-slate-400'}`}>
                    <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium mt-1">Profil</span>
                </button>
            </>
        ) : currentUser.role === 'district_high_school_admin' ? (
        /* SCENARIO 1: DISTRICT HIGH SCHOOL ADMIN */
        <>
            <button onClick={() => setCurrentView('school-list')} className={`nav-btn ${currentView === 'school-list' || currentView === 'school-detail' ? 'text-blue-700' : 'text-slate-400'}`}>
            <Building size={22} strokeWidth={currentView === 'school-list' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Okullar</span>
            </button>
            <button onClick={() => setCurrentView('president-list')} className={`nav-btn ${currentView === 'president-list' || currentView === 'president-detail' ? 'text-blue-700' : 'text-slate-400'}`}>
            <Users size={22} strokeWidth={currentView === 'president-list' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Başkanlar</span>
            </button>
            <button onClick={() => setCurrentView('profile')} className={`nav-btn ${currentView === 'profile' ? 'text-blue-700' : 'text-slate-400'}`}>
            <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Profil</span>
            </button>
        </>
        ) : currentUser.role === 'district_middle_school_admin' ? (
        /* SCENARIO 1.5: DISTRICT MIDDLE SCHOOL ADMIN */
        <>
            <button onClick={() => setCurrentView('middle-school-dashboard')} className={`nav-btn ${currentView === 'middle-school-dashboard' ? 'text-blue-700' : 'text-slate-400'}`}>
            <BookOpen size={22} strokeWidth={currentView === 'middle-school-dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Ortaokul</span>
            </button>
            <button onClick={() => setCurrentView('profile')} className={`nav-btn ${currentView === 'profile' ? 'text-blue-700' : 'text-slate-400'}`}>
            <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Profil</span>
            </button>
        </>
        ) : currentUser.role === 'school_president' ? (
        /* SCENARIO 2: SCHOOL PRESIDENT (Simpler Menu) */
        <>
            <button onClick={() => setCurrentView('home')} className={`nav-btn ${currentView === 'home' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <Home size={22} strokeWidth={currentView === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Ana Sayfa</span>
            </button>
            <button onClick={() => setCurrentView('profile')} className={`nav-btn ${currentView === 'profile' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Profil</span>
            </button>
        </>
        ) : (
        /* SCENARIO 3: STANDARD USER / ADMIN / ORGANIZATION PRESIDENT */
        <>
            <button onClick={() => setCurrentView('home')} className={`nav-btn ${currentView === 'home' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <Home size={22} strokeWidth={currentView === 'home' ? 2.5 : 2} />
            </button>
            <button onClick={() => setCurrentView('goals')} className={`nav-btn ${currentView === 'goals' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <Target size={22} strokeWidth={currentView === 'goals' ? 2.5 : 2} />
            </button>
            
            {currentUser.role === 'user' ? (
            <div className="relative -top-6">
                <button 
                onClick={() => setCurrentView('wizard')}
                className="w-16 h-16 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-300 border-[6px] border-slate-50 active:scale-95 transition-transform"
                >
                <Plus size={32} />
                </button>
            </div>
            ) : (
            <div className="relative -top-6">
                <button 
                onClick={() => setCurrentView('task-assignment')}
                className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-400 border-[6px] border-slate-50 active:scale-95 transition-transform"
                >
                <ClipboardList size={28} />
                </button>
            </div>
            )}

            <button onClick={() => setCurrentView('list')} className={`nav-btn ${currentView === 'list' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <List size={22} strokeWidth={currentView === 'list' ? 2.5 : 2} />
            </button>
            <button onClick={() => setCurrentView('profile')} className={`nav-btn ${currentView === 'profile' ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            </button>
        </>
        )}
      </nav>

      {/* Modals */}
      {showSendNotification && (
        <NotificationModal onClose={() => setShowSendNotification(false)} />
      )}
      
      {showNotificationList && (
        <NotificationsList 
        notifications={notifications} 
        onClose={() => setShowNotificationList(false)} 
        />
      )}
    </div>
  );
};

export default App;
