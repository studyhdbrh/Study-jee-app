export interface User {
  name: string;
  email: string;
  profileImage: string | null;
}

export type SubjectType = "physics" | "chemistry" | "mathematics";

export interface Task {
  id: string;
  content: string;
  date: string;
  completed: boolean;
  subject: SubjectType | null;
  isBacklog: boolean;
  originalDate?: string; // for tasks moved to backlog
}

export type ScheduleTimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  subject: SubjectType;
  day: string; // "monday", "tuesday", etc. or specific date "2023-07-12"
};

export type Holiday = {
  id: string;
  date: string;
  isHalfDay: boolean;
  startTime?: string; // For half day holidays
};

export interface StudySession {
  id: string;
  subject: SubjectType;
  duration: number; // in minutes
  date: string;
}

export interface SubjectProgress {
  physics: number; // in minutes
  chemistry: number; // in minutes
  mathematics: number; // in minutes
}

export interface DailyProgress {
  date: string;
  totalMinutes: number;
  subjects: SubjectProgress;
}

export interface StudyData {
  user: User;
  tasks: Task[];
  schedule: ScheduleTimeSlot[];
  holidays: Holiday[];
  studySessions: StudySession[];
  dailyProgress: DailyProgress[];
  streak: {
    current: number;
    lastStudyDate: string | null;
  };
}

export interface AppContextType {
  studyData: StudyData;
  isProfileModalOpen: boolean;
  isImportPlansModalOpen: boolean;
  isDarkMode: boolean;
  setProfileModalOpen: (isOpen: boolean) => void;
  setImportPlansModalOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
  updateUser: (user: User) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  moveTaskToBacklog: (taskId: string) => void;
  addScheduleSlot: (slot: Omit<ScheduleTimeSlot, "id">) => void;
  updateScheduleSlot: (slotId: string, updates: Partial<ScheduleTimeSlot>) => void;
  removeScheduleSlot: (slotId: string) => void;
  addHoliday: (holiday: Omit<Holiday, "id">) => void;
  removeHoliday: (holidayId: string) => void;
  recordStudySession: (session: Omit<StudySession, "id">) => void;
  importPlans: (plansText: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
  getTodaysTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  getBacklogTasks: () => Task[];
  getRemainingHolidays: () => number;
  getCurrentStudyTimeForSubject: (subject: SubjectType) => number;
  isHoliday: (date: string) => { isHoliday: boolean; isHalfDay: boolean; startTime?: string };
}
