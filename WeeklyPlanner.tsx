import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Task, SubjectType } from "@/types";

export default function WeeklyPlanner() {
  const { getUpcomingTasks, studyData, isHoliday } = useAppContext();
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState<Task[]>([]);

  // Generate array of 7 days starting from today
  useEffect(() => {
    const days: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(today, i));
    }
    
    setWeekDays(days);
  }, []);

  // Get tasks for selected day
  useEffect(() => {
    if (weekDays.length === 0) return;
    
    const selectedDate = format(weekDays[selectedDayIndex], 'yyyy-MM-dd');
    const tasks = getUpcomingTasks(7).filter(task => 
      task.date === selectedDate
    );
    
    setTasksForSelectedDay(tasks);
  }, [selectedDayIndex, weekDays, getUpcomingTasks, studyData.tasks]);

  const getSubjectColor = (subject: SubjectType | null) => {
    if (!subject) return "bg-gray-200 dark:bg-gray-700";
    
    switch(subject) {
      case "physics":
        return "bg-blue-500";
      case "chemistry":
        return "bg-green-500";
      case "mathematics":
        return "bg-amber-500";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };

  const getDayIndicatorColor = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const holiday = isHoliday(dateString);
    
    if (holiday.isHoliday) {
      return "bg-amber-500"; // Holiday color
    }
    
    return isSameDay(day, new Date()) 
      ? "bg-primary" 
      : "bg-gray-200 dark:bg-gray-700";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">7 Day Planner</CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-7 min-w-full">
            {/* Day Headers */}
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`text-center p-2 cursor-pointer ${selectedDayIndex === index ? 'bg-gray-100 dark:bg-gray-800 rounded-md' : ''}`}
                onClick={() => setSelectedDayIndex(index)}
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </p>
                <p className="text-sm font-semibold">
                  {format(day, 'd')}
                </p>
                <div className={`mt-1 w-8 h-1.5 mx-auto rounded-full ${getDayIndicatorColor(day)}`}></div>
              </div>
            ))}
          </div>
          
          {/* Weekly Tasks Preview */}
          <div className="mt-4 space-y-4">
            {selectedDayIndex === 0 ? (
              <div className="flex items-start space-x-3">
                <div className="min-w-[80px] text-xs font-medium text-gray-500 dark:text-gray-400">Today</div>
                <div className="flex-1 space-y-2">
                  {tasksForSelectedDay.length > 0 ? (
                    tasksForSelectedDay.map(task => (
                      <div key={task.id} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getSubjectColor(task.subject)}`}></span>
                        <span className="flex-1">{task.content}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {task.subject && task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs px-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                      No tasks for today
                    </div>
                  )}
                </div>
              </div>
            ) : selectedDayIndex === 1 ? (
              <div className="flex items-start space-x-3">
                <div className="min-w-[80px] text-xs font-medium text-gray-500 dark:text-gray-400">Tomorrow</div>
                <div className="flex-1 space-y-2">
                  {tasksForSelectedDay.length > 0 ? (
                    tasksForSelectedDay.map(task => (
                      <div key={task.id} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getSubjectColor(task.subject)}`}></span>
                        <span className="flex-1">{task.content}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {task.subject && task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs px-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                      No tasks for tomorrow
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="min-w-[80px] text-xs font-medium text-gray-500 dark:text-gray-400">
                  {format(weekDays[selectedDayIndex], 'EEEE')}
                </div>
                <div className="flex-1 space-y-2">
                  {tasksForSelectedDay.length > 0 ? (
                    tasksForSelectedDay.map(task => (
                      <div key={task.id} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getSubjectColor(task.subject)}`}></span>
                        <span className="flex-1">{task.content}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {task.subject && task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs px-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                      No tasks for {format(weekDays[selectedDayIndex], 'EEEE')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 text-sm text-primary"
              asChild
            >
              <a href="/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
