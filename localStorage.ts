import { StudyData } from "../types";

const STORAGE_KEY = "studyPlanner";

export const getInitialData = (): StudyData => {
  return {
    user: {
      name: "User Name",
      email: "user@example.com",
      profileImage: null,
    },
    tasks: [],
    schedule: [],
    holidays: [],
    studySessions: [],
    dailyProgress: [],
    streak: {
      current: 0,
      lastStudyDate: null,
    },
  };
};

export const loadData = (): StudyData => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  
  // If no data or error, return initial data structure
  const initialData = getInitialData();
  saveData(initialData);
  return initialData;
};

export const saveData = (data: StudyData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

export const clearData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing data from localStorage:", error);
  }
};
