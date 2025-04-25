import { useAppContext } from "@/context/AppContext";
import TasksList from "@/components/TasksList";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import BacklogTasks from "@/components/BacklogTasks";
import StudyProgress from "@/components/StudyProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UmbrellaIcon, Clock, Flame, Calendar, Check } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { 
    getTodaysTasks, 
    studyData, 
    getRemainingHolidays, 
    getCurrentStudyTimeForSubject 
  } = useAppContext();

  const todaysTasks = getTodaysTasks();
  const remainingHolidays = getRemainingHolidays();
  const usedHolidays = 7 - remainingHolidays;
  
  // Calculate this from study sessions
  const todayPhysics = getCurrentStudyTimeForSubject("physics");
  const todayChemistry = getCurrentStudyTimeForSubject("chemistry");
  const todayMaths = getCurrentStudyTimeForSubject("mathematics");
  
  const todayTotalMinutes = todayPhysics + todayChemistry + todayMaths;
  const todayHours = (todayTotalMinutes / 60).toFixed(1);
  
  // Get last 7 days for streak visualization
  const getStreakDays = () => {
    const days = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    for (let i = 0; i < 7; i++) {
      days.push({
        label: dayLabels[i],
        completed: true // In a real app, this would be determined from study data
      });
    }
    
    return days;
  };
  
  const streakDays = getStreakDays();
  
  return (
    <div id="dashboard-section">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Streak Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Current Streak</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Flame className="h-3 w-3 mr-1" /> On Flame
              </Badge>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold mr-2">{studyData.streak.current}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">days</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {streakDays.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Study Time Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Study Time Today</h3>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <Clock className="h-3 w-3 mr-1" /> 2h Goal
              </Badge>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold mr-2">{todayHours}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">hours</span>
            </div>
            <div className="mt-3">
              <Progress value={todayTotalMinutes > 0 ? Math.min((todayTotalMinutes / 120) * 100, 100) : 0} className="h-2" />
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Physics: {Math.floor(todayPhysics / 60)}h {todayPhysics % 60}m</span>
                <span>Chemistry: {Math.floor(todayChemistry / 60)}h {todayChemistry % 60}m</span>
                <span>Maths: {Math.floor(todayMaths / 60)}h {todayMaths % 60}m</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Holiday Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Holidays</h3>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <Calendar className="h-3 w-3 mr-1" /> This Month
              </Badge>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold mr-2">{usedHolidays}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">of 7 used</span>
            </div>
            <div className="mt-3">
              <Progress value={(usedHolidays / 7) * 100} className="h-2" />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(usedHolidays)} full days
                  {usedHolidays % 1 > 0 && `, ${usedHolidays % 1 === 0.5 ? '1 half' : '0 half'} day`}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-xs cursor-pointer flex items-center bg-primary/10 text-primary hover:bg-primary/20"
                  asChild
                >
                  <a href="/holidays">
                    <UmbrellaIcon className="h-3 w-3 mr-1" /> Take Holiday
                  </a>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks and Weekly Planner (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <TasksList 
            title="Today's Tasks" 
            tasks={todaysTasks} 
            date={format(new Date(), 'yyyy-MM-dd')}
          />
          <WeeklyPlanner />
        </div>
        
        {/* Sidebar Content */}
        <div className="space-y-6">
          <BacklogTasks />
          <StudyProgress />
        </div>
      </div>
    </div>
  );
}
