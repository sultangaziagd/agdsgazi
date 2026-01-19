
export type Role = 'admin' | 'user' | 'district_high_school_admin' | 'district_middle_school_admin' | 'school_president' | 'organization_president' | 'neighborhood_womens_rep' | 'district_womens_president';

export type ViewState = 'login' | 'home' | 'wizard' | 'list' | 'profile' | 'goals' | 'task-assignment' | 'school-list' | 'school-detail' | 'president-list' | 'president-detail' | 'middle-school-dashboard' | 'womens-report-wizard' | 'district-map';

export type TargetAudience = 'All' | 'Mens' | 'Womens';

export interface AppUser {
  uid: string;
  name: string; // Mahalle Adı veya Birim Adı
  email: string;
  role: Role;
  // Geo-Data
  latitude?: number;
  longitude?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp: number;
  senderName: string;
  isRead: boolean; // Local state usage
}

// --- WOMENS COMMISSION TYPES ---
export interface WomensReport {
  id: string;
  userId: string;
  neighborhoodName: string;
  date: string;
  timestamp: number;
  status: 'pending' | 'approved';
  adminNote?: string; // İlçe başkanının notu

  // Yönetim
  weeklyBoardMeeting: boolean;
  attendance: number;

  // Eğitim ve Birimler
  homeChatsCount: number; // Ev Sohbeti
  highSchoolGirlsContact: number; // Liseli Genç Hanım
  middleSchoolGirlsGroups: number; // Kaşif (Kız) Grup
  universityUnitContact: number; // Üniversiteli Hanım

  // Halkla İlişkiler
  visitations: number; // Hasta/Bebek/Taziye
  charityWork: boolean; // Hayır çarşısı/Kermes
  
  notes: string; // Mahalle başkanının notu
}

export const INITIAL_WOMENS_REPORT: Omit<WomensReport, 'id' | 'userId' | 'neighborhoodName' | 'date' | 'timestamp' | 'status'> = {
  weeklyBoardMeeting: false,
  attendance: 0,
  homeChatsCount: 0,
  highSchoolGirlsContact: 0,
  middleSchoolGirlsGroups: 0,
  universityUnitContact: 0,
  visitations: 0,
  charityWork: false,
  notes: ''
};

// --- NEIGHBORHOOD PROFILE (KÜNYE) ---
export interface NeighborhoodProfile {
  userId: string; // Links to AppUser.uid
  
  // Ana Kademe
  managementCount: number; // Ana Kademe Yönetim

  // Yeni Yapı (Ortaokul/Lise Ayrı)
  middleSchoolCount: number; // Ortaokul Komisyonu
  highSchoolCount: number; // Lise Komisyonu
  
  // Gruplar
  kasifGroupCount: number; // Kaşif Grubu (Ortaokul alt birimi)
  karavanGroupCount: number; // Karavan Grubu (Lise alt birimi)
  
  // Genel
  totalMembersCount: number; // Mahalledeki toplam üye
  
  // Geo & Score
  latitude?: number;
  longitude?: number;
  successScore: number; // 0-100 based on report activity

  updatedAt: number;
}

// --- MIDDLE SCHOOL (KAŞİF) TYPES ---
export interface KasifGroup {
  id: string;
  neighborhoodId: string; // Hangi mahalleye ait?
  neighborhoodName: string; // Display purposes
  groupName: string; // Örn: Fatih Sultan Mehmet Halkanız
  guideName: string; // Rehber Adı
  activeStudentCount: number; // Kayıtlı öğrenci
  lastMeetingDate?: number; // Timestamp of last activity
}

export interface KasifGroupLog {
  id: string;
  groupId: string;
  neighborhoodId: string;
  week: number;
  dateFormatted: string;
  timestamp: number;
  isMeetingHeld: boolean; // Toplandı mı?
  attendanceCount: number; // Kaç kişi geldi?
  activityDetails?: string; // Ne işlendi?
  excuse?: string; // Toplanmadıysa neden?
}

// --- SCHOOL TYPES ---
export interface School {
  id: string;
  schoolName: string;
  neighborhood: string;
  presidentName?: string; // Kept for backward compatibility display
  presidentPhone?: string;
  teacherContact?: string;
  studentCapacity: number;
  // Geo-Data
  latitude?: number;
  longitude?: number;
}

export interface SchoolLog {
  id: string;
  schoolId: string;
  week: number;
  dateFormatted: string;
  isPresidentActive: boolean;
  chatHeld: boolean;
  attendeesCount: number;
  notes: string;
  timestamp: number;
}

// --- NEW PRESIDENT TYPES ---
export interface SchoolPresident {
  id: string;
  fullName: string;
  schoolId: string;
  schoolName: string; // Denormalized for easier display
  phoneNumber: string;
  grade: number; // 9, 10, 11, 12
  successorName?: string;
  isActive: boolean;
  startDate: string;
  photoUrl?: string; // Optional avatar
}

export interface PresidentWeeklyLog {
  id: string;
  presidentId: string;
  week: number;
  dateFormatted: string;
  attendedMeeting: boolean; // İlçe toplantısına geldi mi?
  performedSchoolActivity: boolean; // Okulda sohbet yaptı mı?
  recruitedNewMember: number;
  notes: string;
  timestamp: number;
}

export interface MonthlyTask {
  id: string;
  title: string;
  description: string;
  targetMonth: string; // e.g., 'Aralık 2025'
  isRequired: boolean;
  targetAudience: TargetAudience;
}

export interface TaskCompletion {
  completed: boolean;
  note: string;
  updatedAt?: number;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  neighborhoodName: string;
  date: string;
  timestamp: number;
  status: 'pending' | 'approved';

  // Sekme A: Atanan Görev Takibi (Now managed separately, kept for history)
  completedTasks: Record<string, TaskCompletion>;

  // Sekme B: Hanımlar Komisyonu (Women's Branch)
  isWomenMeetingHeld: boolean;
  womenMeetingAttendance: number;
  womenTeaTalkCount: number; // Çay saati / Ev sohbeti
  youngWomenWork: number; // Genç Hanımlar ulaşım
  // Removed womenCharityCount

  // Bölüm C: Yönetim (Ana Kademe)
  isManagementMeetingHeld: boolean;
  meetingPhotoUrl?: string;
  isSupervisorAttended: boolean;
  managementTotalCount: number;
  managementAttendanceCount: number;

  // Bölüm D: Ortaokul (Middle School)
  middleSchoolGroupCount: number;
  middleSchoolStudentCount: number;

  // Bölüm E: Lise (High School) - NEW FIELDS ADDED
  highSchoolTotalCount: number; // Mevcut Okul Sayısı
  highSchoolPresidentCount: number; // Okul Başkanı Sayısı
  highSchoolStaffCount: number; // Komisyon Sayısı
  highSchoolMeetingAttendance: number;
  highSchoolReadingGroupCount: number;
  highSchoolReadingStudentCount: number;
  highSchoolChatAttendance: number;

  // Sohbetler (Public Relations)
  generalChatAttendance: number;
  womenChatAttendance: number; 

  // Diğer (Other)
  otherActivities: string;
}

// Initial empty state for the form
export const INITIAL_REPORT_FORM: Omit<WeeklyReport, 'id' | 'userId' | 'neighborhoodName' | 'date' | 'timestamp' | 'status'> = {
  completedTasks: {},
  
  isWomenMeetingHeld: false,
  womenMeetingAttendance: 0,
  womenTeaTalkCount: 0,
  youngWomenWork: 0,
  // Removed womenCharityCount

  isManagementMeetingHeld: false,
  isSupervisorAttended: false,
  managementTotalCount: 0,
  managementAttendanceCount: 0,
  
  middleSchoolGroupCount: 0,
  middleSchoolStudentCount: 0,
  
  highSchoolTotalCount: 0,
  highSchoolPresidentCount: 0,
  highSchoolStaffCount: 0,
  highSchoolMeetingAttendance: 0,
  highSchoolReadingGroupCount: 0,
  highSchoolReadingStudentCount: 0,
  highSchoolChatAttendance: 0,
  
  generalChatAttendance: 0,
  womenChatAttendance: 0,
  otherActivities: ''
};