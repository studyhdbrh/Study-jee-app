import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppContextType, StudyData, User, Task, ScheduleTimeSlot, Holiday, StudySession, SubjectType } from "../types";
import { loadData, saveData, getInitialData } from "../lib/localStorage";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [studyData, setStudyData] = useState<StudyData>(getInitialData());
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isImportPlansModalOpen, setImportPlansModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  // Initialize data from localStorage
  useEffect(() => {
    const data = loadData();
    setStudyData(data);
  }, []);

  // Save data when it changes
  useEffect(() => {
    saveData(studyData);
  }, [studyData]);

  // Apply dark mode class to html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Update streak whenever we record a study session
  useEffect(() => {
    if (studyData.studySessions.length === 0) return;

    // Sort sessions by date (newest first)
    const sessions = [...studyData.studySessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestSessionDate = sessions[0].date;
    const lastStudyDate = studyData.streak.lastStudyDate;
    
    const today = new Date().toISOString().split('T')[0];
    
    // If latest session is today
    if (latestSessionDate === today) {
      // If no previous streak or streak broken, set to 1
      if (!lastStudyDate) {
        setStudyData(prev => ({
          ...prev,
          streak: {
            current: 1,
            lastStudyDate: today
          }
        }));
      } else {
        // Check if last study date was yesterday (to maintain streak)
        const lastDate = new Date(lastStudyDate);
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        
        if (lastStudyDate === yesterday) {
          // Continue streak
          setStudyData(prev => ({
            ...prev,
            streak: {
              current: prev.streak.current + 1,
              lastStudyDate: today
            }
          }));
        } else if (lastStudyDate !== today) {
          // Broken streak
          setStudyData(prev => ({
            ...prev,
            streak: {
              current: 1,
              lastStudyDate: today
            }
          }));
        }
      }
    }
  }, [studyData.studySessions]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateUser = (user: User) => {
    setStudyData(prev => ({
      ...prev,
      user
    }));
  };

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
    };
    setStudyData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const removeTask = (taskId: string) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const moveTaskToBacklog = (taskId: string) => {
    setStudyData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              isBacklog: true, 
              originalDate: task.date, 
              date: new Date().toISOString().split('T')[0]
            } 
          : task
      )
    }));
  };

  const addScheduleSlot = (slot: Omit<ScheduleTimeSlot, "id">) => {
    const newSlot: ScheduleTimeSlot = {
      ...slot,
      id: crypto.randomUUID(),
    };
    setStudyData(prev => ({
      ...prev,
      schedule: [...prev.schedule, newSlot]
    }));
  };

  const updateScheduleSlot = (slotId: string, updates: Partial<ScheduleTimeSlot>) => {
    setStudyData(prev => ({
      ...prev,
      schedule: prev.schedule.map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    }));
  };

  const removeScheduleSlot = (slotId: string) => {
    setStudyData(prev => ({
      ...prev,
      schedule: prev.schedule.filter(slot => slot.id !== slotId)
    }));
  };

  const addHoliday = (holiday: Omit<Holiday, "id">) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: crypto.randomUUID(),
    };
    setStudyData(prev => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday]
    }));
  };

  const removeHoliday = (holidayId: string) => {
    setStudyData(prev => ({
      ...prev,
      holidays: prev.holidays.filter(holiday => holiday.id !== holidayId)
    }));
  };

  const recordStudySession = (session: Omit<StudySession, "id">) => {
    const newSession: StudySession = {
      ...session,
      id: crypto.randomUUID(),
    };
    
    // Add to study sessions
    setStudyData(prev => ({
      ...prev,
      studySessions: [...prev.studySessions, newSession]
    }));
    
    // Update daily progress
    const dateKey = session.date;
    const existingProgressIndex = studyData.dailyProgress.findIndex(p => p.date === dateKey);
    
    if (existingProgressIndex >= 0) {
      // Update existing progress
      const updatedProgress = [...studyData.dailyProgress];
      updatedProgress[existingProgressIndex] = {
        ...updatedProgress[existingProgressIndex],
        totalMinutes: updatedProgress[existingProgressIndex].totalMinutes + session.duration,
        subjects: {
          ...updatedProgress[existingProgressIndex].subjects,
          [session.subject]: (updatedProgress[existingProgressIndex].subjects[session.subject] || 0) + session.duration
        }
      };
      
      setStudyData(prev => ({
        ...prev,
        dailyProgress: updatedProgress
      }));
    } else {
      // Create new progress entry
      const newProgress = {
        date: dateKey,
        totalMinutes: session.duration,
        subjects: {
          physics: session.subject === 'physics' ? session.duration : 0,
          chemistry: session.subject === 'chemistry' ? session.duration : 0,
          mathematics: session.subject === 'mathematics' ? session.duration : 0
        }
      };
      
      setStudyData(prev => ({
        ...prev,
        dailyProgress: [...prev.dailyProgress, newProgress]
      }));
    }
  };

  const importPlans = (plansText: string) => {
    try {
      // Parse plans in format |date|task1|task2|task3|
      const plans = plansText.split('\n').filter(line => line.trim() !== '');
      
      const newTasks: Omit<Task, "id">[] = [];
      
      plans.forEach(plan => {
        const parts = plan.split('|').filter(part => part.trim() !== '');
        if (parts.length >= 2) {
          const date = parts[0].trim();
          
          // Validate date format (YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Use YYYY-MM-DD.`);
          }
          
          // Add tasks for this date
          for (let i = 1; i < parts.length; i++) {
            const taskContent = parts[i].trim();
            if (taskContent) {
              // Determine subject based on keywords (simple approach)
              let subject: SubjectType | null = null;
              const lowerContent = taskContent.toLowerCase();
              if (lowerContent.includes('physics')) subject = 'physics';
              else if (lowerContent.includes('chem')) subject = 'chemistry';
              else if (lowerContent.includes('math')) subject = 'mathematics';
              
              newTasks.push({
                content: taskContent,
                date,
                completed: false,
                subject,
                isBacklog: false
              });
            }
          }
        }
      });
      
      // Add all new tasks
      newTasks.forEach(task => addTask(task));
      
      return { success: true, message: `Imported ${newTasks.length} tasks successfully.` };
    } catch (error) {
      console.error("Error importing plans:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Error importing plans" 
      };
    }
  };

  const exportData = (): string => {
    return JSON.stringify(studyData, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData) as StudyData;
      
      // Validate basic structure
      if (!parsedData.user || !Array.isArray(parsedData.tasks)) {
        throw new Error("Invalid data format");
      }
      
      setStudyData(parsedData);
      return { success: true, message: "Data imported successfully" };
    } catch (error) {
      console.error("Error importing data:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Error importing data" 
      };
    }
  };

  const getTodaysTasks = (): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return studyData.tasks.filter(task => task.date === today && !task.isBacklog);
  };

  const getUpcomingTasks = (days: number): Task[] => {
    const today = new Date();
    const upcomingDates: string[] = [];
    
    // Generate array of upcoming dates
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      upcomingDates.push(date.toISOString().split('T')[0]);
    }
    
    return studyData.tasks.filter(task => 
      upcomingDates.includes(task.date) && !task.isBacklog
    );
  };

  const getBacklogTasks = (): Task[] => {
    return studyData.tasks.filter(task => task.isBacklog);
  };

  const getRemainingHolidays = (): number => {
    // Get current month and year
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Filter holidays for current month
    const currentMonthHolidays = studyData.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === currentMonth && 
             holidayDate.getFullYear() === currentYear;
    });
    
    // Calculate used days (half days count as 0.5)
    const usedDays = currentMonthHolidays.reduce((total, holiday) => 
      total + (holiday.isHalfDay ? 0.5 : 1), 0);
    
    // 7 days per month maximum
    return 7 - usedDays;
  };

  const getCurrentStudyTimeForSubject = (subject: SubjectType): number => {
    // Get current week's study time
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    
    return studyData.studySessions
      .filter(session => 
        session.subject === subject && 
        session.date >= startDate
      )
      .reduce((total, session) => total + session.duration, 0);
  };

  const isHoliday = (date: string) => {
    const holiday = studyData.holidays.find(h => h.date === date);
    if (!holiday) return { isHoliday: false, isHalfDay: false };
    
    return { 
      isHoliday: true, 
      isHalfDay: holiday.isHalfDay,
      startTime: holiday.startTime
    };
  };

  const contextValue: AppContextType = {
    studyData,
    isProfileModalOpen,
    isImportPlansModalOpen,
    isDarkMode,
    setProfileModalOpen,
    setImportPlansModalOpen,
    toggleDarkMode,
    updateUser,
    addTask,
    updateTask,
    removeTask,
    moveTaskToBacklog,
    addScheduleSlot,
    updateScheduleSlot,
    removeScheduleSlot,
    addHoliday,
    removeHoliday,
    recordStudySession,
    importPlans,
    exportData,
    importData,
    getTodaysTasks,
    getUpcomingTasks,
    getBacklogTasks,
    getRemainingHolidays,
    getCurrentStudyTimeForSubject,
    isHoliday
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
