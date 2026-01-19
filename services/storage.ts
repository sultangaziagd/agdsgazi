import { WeeklyReport, AppUser, MonthlyTask, TaskCompletion, Notification, School, SchoolLog, SchoolPresident, PresidentWeeklyLog, KasifGroup, KasifGroupLog, NeighborhoodProfile, WomensReport } from '../types';

const DB_KEY = 'agd_reports_v3';
const USER_KEY = 'agd_current_user_v1';
const TASKS_KEY = 'agd_monthly_tasks_v1';
const TASK_PROGRESS_KEY = 'agd_task_progress_v1';
const NOTIFICATIONS_KEY = 'agd_notifications_v1';
const SCHOOLS_KEY = 'agd_schools_v1';
const SCHOOL_LOGS_KEY = 'agd_school_logs_v1';
const PRESIDENTS_KEY = 'agd_presidents_v1';
const PRESIDENT_LOGS_KEY = 'agd_president_logs_v1';
const KASIF_GROUPS_KEY = 'agd_kasif_groups_v1';
const KASIF_LOGS_KEY = 'agd_kasif_logs_v1';
const NEIGHBORHOOD_PROFILE_KEY = 'agd_neighborhood_profiles_v1';
const WOMENS_REPORTS_KEY = 'agd_womens_reports_v1';

// Mock Users for Simulation (With Coordinates for Map)
// Sultangazi Center: 41.1068, 28.8700
export const MOCK_USERS: AppUser[] = [
  // --- Neighborhood Users (Mahalleler) ---
  { uid: 'u1', name: '50. Yıl Mahallesi', email: '50yil@agd.com', role: 'user', latitude: 41.1120, longitude: 28.8650 },
  { uid: 'u2', name: 'Uğur Mumcu Mahallesi', email: 'ugurmumcu@agd.com', role: 'user', latitude: 41.1085, longitude: 28.8730 },
  { uid: 'u3', name: 'Sultançiftliği Mahallesi', email: 'sultanciftligi@agd.com', role: 'user', latitude: 41.1060, longitude: 28.8680 },
  { uid: 'u4', name: 'İsmetpaşa Mahallesi', email: 'ismetpasa@agd.com', role: 'user', latitude: 41.1010, longitude: 28.8610 },
  { uid: 'u5', name: 'Malkoçoğlu Mahallesi', email: 'malkocoglu@agd.com', role: 'user', latitude: 41.1180, longitude: 28.8550 },
  { uid: 'u6', name: 'Cebeci Mahallesi', email: 'cebeci@agd.com', role: 'user', latitude: 41.1150, longitude: 28.8800 },
  { uid: 'u7', name: 'Esentepe Mahallesi', email: 'esentepe@agd.com', role: 'user', latitude: 41.1030, longitude: 28.8750 },
  { uid: 'u8', name: '75. Yıl Mahallesi', email: '75yil@agd.com', role: 'user', latitude: 41.1100, longitude: 28.8950 },
  { uid: 'u9', name: 'Habipler Mahallesi', email: 'habipler@agd.com', role: 'user', latitude: 41.1250, longitude: 28.8400 },
  { uid: 'u10', name: 'Yayla Mahallesi', email: 'yayla@agd.com', role: 'user', latitude: 41.1300, longitude: 28.8500 },
  { uid: 'u11', name: 'Cumhuriyet Mahallesi', email: 'cumhuriyet@agd.com', role: 'user', latitude: 41.1050, longitude: 28.8600 },

  // --- Admin & Unit Heads ---
  { uid: 'a1', name: 'İlçe Yönetimi', email: 'admin@agd.com', role: 'admin' },
  { uid: 't1', name: 'Teşkilat Başkanı', email: 'teskilat@agd.com', role: 'organization_president' }, 
  { uid: 'l1', name: 'İlçe Liseler Bşk.', email: 'liseler@agd.com', role: 'district_high_school_admin' },
  { uid: 'o1', name: 'İlçe Ortaokullar Bşk.', email: 'ortaokul@agd.com', role: 'district_middle_school_admin' },
  
  // --- Sub-Unit Representatives (Mock) ---
  { uid: 'p1', name: 'Ahmet Yılmaz (Bşk)', email: 'ahmet@okul.com', role: 'school_president' },
  { uid: 'w1', name: '50. Yıl Hanımlar', email: '50yil.hanim@agd.com', role: 'neighborhood_womens_rep' },
  { uid: 'wd1', name: 'İlçe Hanımlar Bşk.', email: 'ilce.hanim@agd.com', role: 'district_womens_president' },
];

// --- User Logic ---
export const getCurrentUser = (): AppUser => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : MOCK_USERS[0]; 
};

export const setCurrentUser = (user: AppUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// --- Report Logic ---
export const getReports = (): WeeklyReport[] => {
  try {
    const data = localStorage.getItem(DB_KEY);
    // Return mock reports if empty to show data on charts
    if (!data) {
        const mockReports: WeeklyReport[] = [
            {
                id: 'r1', userId: 'u1', neighborhoodName: '50. Yıl Mahallesi', date: '12 Ocak 2025', timestamp: Date.now() - 86400000, status: 'approved',
                completedTasks: {}, isWomenMeetingHeld: true, womenMeetingAttendance: 15, womenTeaTalkCount: 2, youngWomenWork: 5,
                isManagementMeetingHeld: true, isSupervisorAttended: true, managementTotalCount: 12, managementAttendanceCount: 10,
                middleSchoolGroupCount: 3, middleSchoolStudentCount: 25,
                highSchoolTotalCount: 2, highSchoolPresidentCount: 2, highSchoolStaffCount: 5, highSchoolMeetingAttendance: 8, highSchoolReadingGroupCount: 1, highSchoolReadingStudentCount: 5, highSchoolChatAttendance: 10,
                generalChatAttendance: 30, womenChatAttendance: 15, otherActivities: ''
            },
            {
                id: 'r2', userId: 'u6', neighborhoodName: 'Cebeci Mahallesi', date: '12 Ocak 2025', timestamp: Date.now() - 90000000, status: 'pending',
                completedTasks: {}, isWomenMeetingHeld: false, womenMeetingAttendance: 0, womenTeaTalkCount: 0, youngWomenWork: 0,
                isManagementMeetingHeld: true, isSupervisorAttended: false, managementTotalCount: 8, managementAttendanceCount: 5,
                middleSchoolGroupCount: 1, middleSchoolStudentCount: 8,
                highSchoolTotalCount: 1, highSchoolPresidentCount: 0, highSchoolStaffCount: 0, highSchoolMeetingAttendance: 0, highSchoolReadingGroupCount: 0, highSchoolReadingStudentCount: 0, highSchoolChatAttendance: 0,
                generalChatAttendance: 12, womenChatAttendance: 0, otherActivities: ''
            },
            {
                id: 'r3', userId: 'u2', neighborhoodName: 'Uğur Mumcu Mahallesi', date: '11 Ocak 2025', timestamp: Date.now() - 170000000, status: 'approved',
                completedTasks: {}, isWomenMeetingHeld: true, womenMeetingAttendance: 8, womenTeaTalkCount: 1, youngWomenWork: 2,
                isManagementMeetingHeld: true, isSupervisorAttended: true, managementTotalCount: 10, managementAttendanceCount: 7,
                middleSchoolGroupCount: 2, middleSchoolStudentCount: 12,
                highSchoolTotalCount: 1, highSchoolPresidentCount: 1, highSchoolStaffCount: 3, highSchoolMeetingAttendance: 5, highSchoolReadingGroupCount: 1, highSchoolReadingStudentCount: 4, highSchoolChatAttendance: 6,
                generalChatAttendance: 20, womenChatAttendance: 8, otherActivities: ''
            }
        ];
        localStorage.setItem(DB_KEY, JSON.stringify(mockReports));
        return mockReports;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading reports", error);
    return [];
  }
};

export const saveReport = (report: WeeklyReport): WeeklyReport[] => {
  const reports = getReports();
  const newReports = [report, ...reports];
  localStorage.setItem(DB_KEY, JSON.stringify(newReports));
  return newReports;
};

export const getReportsForUser = (user: AppUser): WeeklyReport[] => {
  const allReports = getReports();
  if (user.role === 'admin' || user.role === 'organization_president' || user.role === 'district_middle_school_admin') {
    return allReports; 
  } else {
    return allReports.filter(r => r.userId === user.uid); 
  }
};

// --- WOMENS COMMISSION REPORTS LOGIC ---
export const getWomensReports = (): WomensReport[] => {
  try {
    const data = localStorage.getItem(WOMENS_REPORTS_KEY);
    if (!data) {
       // Mock Data
       const mocks: WomensReport[] = [
         {
           id: 'wr1', userId: 'w1', neighborhoodName: '50. Yıl Hanımlar', date: '14 Ocak 2025', timestamp: Date.now() - 86400000, status: 'approved',
           weeklyBoardMeeting: true, attendance: 12, homeChatsCount: 2, highSchoolGirlsContact: 5, middleSchoolGirlsGroups: 1, universityUnitContact: 3, visitations: 1, charityWork: true, notes: 'Güzel bir hafta geçti.', adminNote: 'Tebrikler'
         },
         {
           id: 'wr2', userId: 'w1', neighborhoodName: '50. Yıl Hanımlar', date: '21 Ocak 2025', timestamp: Date.now(), status: 'pending',
           weeklyBoardMeeting: true, attendance: 14, homeChatsCount: 3, highSchoolGirlsContact: 7, middleSchoolGirlsGroups: 2, universityUnitContact: 1, visitations: 2, charityWork: false, notes: ''
         }
       ];
       localStorage.setItem(WOMENS_REPORTS_KEY, JSON.stringify(mocks));
       return mocks;
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveWomensReport = (report: WomensReport) => {
  const reports = getWomensReports();
  const newReports = [report, ...reports];
  localStorage.setItem(WOMENS_REPORTS_KEY, JSON.stringify(newReports));
};

export const updateWomensReport = (updatedReport: WomensReport) => {
  const reports = getWomensReports();
  const newReports = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
  localStorage.setItem(WOMENS_REPORTS_KEY, JSON.stringify(newReports));
};

export const getWomensReportsForUser = (userId: string): WomensReport[] => {
   return getWomensReports().filter(r => r.userId === userId).sort((a,b) => b.timestamp - a.timestamp);
};


// --- Task Logic ---
export const getMonthlyTasks = (): MonthlyTask[] => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) {
      // Mock data
      const initialTasks: MonthlyTask[] = [
        {
          id: 't1',
          title: "Mekke'nin Fethi Programı",
          description: "Her mahalle en az 1 otobüs kaldıracak.",
          targetMonth: "Aralık 2025",
          isRequired: true,
          targetAudience: "All"
        },
        {
          id: 't2',
          title: "Kış Okulları Kayıt",
          description: "Ortaokul kış okulları için okullara afiş asılacak.",
          targetMonth: "Aralık 2025",
          isRequired: false,
          targetAudience: "All"
        }
      ];
      localStorage.setItem(TASKS_KEY, JSON.stringify(initialTasks));
      return initialTasks;
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveMonthlyTask = (task: MonthlyTask): MonthlyTask[] => {
  const tasks = getMonthlyTasks();
  const newTasks = [task, ...tasks];
  localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
  return newTasks;
};

export const getTasksByMonth = (month: string): MonthlyTask[] => {
  return getMonthlyTasks().filter(t => t.targetMonth === month);
};

export const getUserTaskProgress = (userId: string): Record<string, TaskCompletion> => {
  try {
    const data = localStorage.getItem(TASK_PROGRESS_KEY);
    const allProgress = data ? JSON.parse(data) : {};
    return allProgress[userId] || {};
  } catch (error) {
    return {};
  }
};

export const saveUserTaskProgress = (userId: string, taskId: string, completion: TaskCompletion) => {
  try {
    const data = localStorage.getItem(TASK_PROGRESS_KEY);
    const allProgress = data ? JSON.parse(data) : {};
    
    if (!allProgress[userId]) {
      allProgress[userId] = {};
    }

    allProgress[userId][taskId] = completion;
    localStorage.setItem(TASK_PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Error saving task progress", error);
  }
};

// --- Notification Logic ---
export const getNotifications = (): Notification[] => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const sendNotification = (notification: Notification): Notification[] => {
  const notifications = getNotifications();
  const newNotifications = [notification, ...notifications];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
  return newNotifications;
};

// --- School Management Logic ---
export const getSchools = (): School[] => {
  try {
    const data = localStorage.getItem(SCHOOLS_KEY);
    if (!data) {
      // Mock Schools (Added Lat/Lng for Map)
      const mockSchools: School[] = [
        { id: 's1', schoolName: 'Sultangazi MTAL', neighborhood: '50. Yıl', studentCapacity: 1200, presidentName: 'Ahmet Yılmaz', presidentPhone: '05551112233', latitude: 41.1125, longitude: 28.8660 },
        { id: 's2', schoolName: 'Cumhuriyet Anadolu', neighborhood: 'Cumhuriyet', studentCapacity: 900, presidentName: '', presidentPhone: '', latitude: 41.1035, longitude: 28.8760 },
        { id: 's3', schoolName: 'Atatürk Lisesi', neighborhood: 'Cebeci', studentCapacity: 1500, presidentName: 'Mehmet Demir', presidentPhone: '05554445566', latitude: 41.1155, longitude: 28.8810 },
        { id: 's4', schoolName: 'Mimar Sinan İHL', neighborhood: 'Uğur Mumcu', studentCapacity: 600, presidentName: '', presidentPhone: '', latitude: 41.1100, longitude: 28.8700 },
        { id: 's5', schoolName: 'Nene Hatun Kız İHL', neighborhood: 'İsmetpaşa', studentCapacity: 800, presidentName: 'Ayşe Kaya', presidentPhone: '05559998877', latitude: 41.1010, longitude: 28.8610 },
        { id: 's6', schoolName: 'Habipler Anadolu', neighborhood: 'Habipler', studentCapacity: 750, presidentName: '', presidentPhone: '', latitude: 41.1260, longitude: 28.8410 },
        { id: 's7', schoolName: 'Veysel Sacıhan İHL', neighborhood: 'Yayla', studentCapacity: 500, presidentName: '', presidentPhone: '', latitude: 41.1310, longitude: 28.8510 },
      ];
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(mockSchools));
      return mockSchools;
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const updateSchool = (updatedSchool: School) => {
  const schools = getSchools();
  const newSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(newSchools));
  return newSchools;
};

// --- PRESIDENT Management Logic ---
export const getPresidents = (): SchoolPresident[] => {
  try {
    const data = localStorage.getItem(PRESIDENTS_KEY);
    if (!data) {
      // Mock Presidents
      const mockPresidents: SchoolPresident[] = [
        { id: 'p1', fullName: 'Ahmet Yılmaz', schoolId: 's1', schoolName: 'Sultangazi MTAL', phoneNumber: '05551234567', grade: 11, isActive: true, startDate: '2024-09-01' },
        { id: 'p2', fullName: 'Mehmet Demir', schoolId: 's3', schoolName: 'Atatürk Lisesi', phoneNumber: '05559876543', grade: 12, isActive: true, startDate: '2023-09-01', successorName: 'Ali Veli' },
        { id: 'p3', fullName: 'Ayşe Kaya', schoolId: 's5', schoolName: 'Nene Hatun Kız İHL', phoneNumber: '05551112222', grade: 10, isActive: true, startDate: '2025-01-01' },
      ];
      localStorage.setItem(PRESIDENTS_KEY, JSON.stringify(mockPresidents));
      return mockPresidents;
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const getPresidentById = (id: string): SchoolPresident | undefined => {
  return getPresidents().find(p => p.id === id);
}

export const getPresidentBySchoolId = (schoolId: string): SchoolPresident | undefined => {
  return getPresidents().find(p => p.schoolId === schoolId);
}

export const getPresidentLogs = (presidentId: string): PresidentWeeklyLog[] => {
  try {
    const data = localStorage.getItem(PRESIDENT_LOGS_KEY);
    const allLogs: PresidentWeeklyLog[] = data ? JSON.parse(data) : [];
    return allLogs.filter(l => l.presidentId === presidentId).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    return [];
  }
};

export const addPresidentLog = (log: PresidentWeeklyLog) => {
  try {
    const data = localStorage.getItem(PRESIDENT_LOGS_KEY);
    const allLogs: PresidentWeeklyLog[] = data ? JSON.parse(data) : [];
    const newLogs = [log, ...allLogs];
    localStorage.setItem(PRESIDENT_LOGS_KEY, JSON.stringify(newLogs));
  } catch (error) {
    console.error("Error saving president log", error);
  }
};


// --- MIDDLE SCHOOL (KAŞİF) LOGIC ---

export const getKasifGroups = (): KasifGroup[] => {
  try {
    const data = localStorage.getItem(KASIF_GROUPS_KEY);
    if (!data) {
      // Create detailed Mock Data for Groups
      const mockGroups: KasifGroup[] = [
        // 50. Yıl Mahallesi (u1) - Active
        { id: 'k1', neighborhoodId: 'u1', neighborhoodName: '50. Yıl Mahallesi', groupName: 'Fetih Grubu', guideName: 'Ali Veli', activeStudentCount: 12, lastMeetingDate: Date.now() - 3 * 86400000 },
        { id: 'k2', neighborhoodId: 'u1', neighborhoodName: '50. Yıl Mahallesi', groupName: 'Yıldızlar', guideName: 'Hasan Hüseyin', activeStudentCount: 8, lastMeetingDate: Date.now() - 5 * 86400000 },
        
        // Cebeci Mahallesi (u6) - Active
        { id: 'k3', neighborhoodId: 'u6', neighborhoodName: 'Cebeci Mahallesi', groupName: 'Cebeci Gençlik', guideName: 'Osman Nur', activeStudentCount: 10, lastMeetingDate: Date.now() - 2 * 86400000 },
        
        // Esentepe (u7) - Inactive for alert demo
        { id: 'k4', neighborhoodId: 'u7', neighborhoodName: 'Esentepe Mahallesi', groupName: 'Genç Kaşifler', guideName: 'Murat Can', activeStudentCount: 15, lastMeetingDate: Date.now() - 20 * 86400000 },
      ];
      localStorage.setItem(KASIF_GROUPS_KEY, JSON.stringify(mockGroups));
      return mockGroups;
    }
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveKasifGroup = (group: KasifGroup) => {
  const groups = getKasifGroups();
  // Update if exists, else add
  const exists = groups.some(g => g.id === group.id);
  const newGroups = exists ? groups.map(g => g.id === group.id ? group : g) : [...groups, group];
  localStorage.setItem(KASIF_GROUPS_KEY, JSON.stringify(newGroups));
};

export const getKasifLogs = (groupId: string): KasifGroupLog[] => {
   try {
    const data = localStorage.getItem(KASIF_LOGS_KEY);
    if (!data) return [];
    const allLogs: KasifGroupLog[] = JSON.parse(data);
    return allLogs.filter(l => l.groupId === groupId).sort((a,b) => b.timestamp - a.timestamp);
   } catch(e) { return [] }
};

export const saveKasifLog = (log: KasifGroupLog) => {
   const data = localStorage.getItem(KASIF_LOGS_KEY);
   const allLogs: KasifGroupLog[] = data ? JSON.parse(data) : [];
   const newLogs = [log, ...allLogs];
   localStorage.setItem(KASIF_LOGS_KEY, JSON.stringify(newLogs));

   // Also update the Group's lastMeetingDate if it was a meeting
   if (log.isMeetingHeld) {
     const groups = getKasifGroups();
     const group = groups.find(g => g.id === log.groupId);
     if (group) {
       group.lastMeetingDate = log.timestamp;
       saveKasifGroup(group);
     }
   }
}

// --- NEIGHBORHOOD PROFILE LOGIC ---

export const getNeighborhoodProfile = (userId: string): NeighborhoodProfile => {
  try {
    const data = localStorage.getItem(NEIGHBORHOOD_PROFILE_KEY);
    const profiles: NeighborhoodProfile[] = data ? JSON.parse(data) : [];
    const existing = profiles.find(p => p.userId === userId);
    
    // Fallback coordinates based on user ID logic (Mock logic)
    const mockUser = MOCK_USERS.find(u => u.uid === userId);
    const lat = existing?.latitude || mockUser?.latitude || 41.1068;
    const lng = existing?.longitude || mockUser?.longitude || 28.8700;

    if (existing) return { ...existing, latitude: lat, longitude: lng };

    // Return default empty profile
    return {
      userId,
      managementCount: 0,
      middleSchoolCount: 0,
      highSchoolCount: 0,
      kasifGroupCount: 0,
      karavanGroupCount: 0,
      totalMembersCount: 0,
      successScore: 0,
      latitude: lat,
      longitude: lng,
      updatedAt: Date.now()
    };
  } catch (error) {
    return {
       userId,
       managementCount: 0,
       middleSchoolCount: 0,
       highSchoolCount: 0,
       kasifGroupCount: 0,
       karavanGroupCount: 0,
       totalMembersCount: 0,
       successScore: 0,
       updatedAt: Date.now()
    };
  }
};

export const saveNeighborhoodProfile = (profile: NeighborhoodProfile) => {
  try {
    const data = localStorage.getItem(NEIGHBORHOOD_PROFILE_KEY);
    const profiles: NeighborhoodProfile[] = data ? JSON.parse(data) : [];
    
    // Remove existing if any
    const others = profiles.filter(p => p.userId !== profile.userId);
    const newProfiles = [...others, profile];
    
    localStorage.setItem(NEIGHBORHOOD_PROFILE_KEY, JSON.stringify(newProfiles));
  } catch (error) {
    console.error("Error saving profile", error);
  }
};