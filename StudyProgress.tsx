import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer } from "lucide-react";
import { Link } from "wouter";

export default function StudyProgress() {
  const { studyData, getCurrentStudyTimeForSubject } = useAppContext();
  
  const physicsTime = getCurrentStudyTimeForSubject("physics");
  const chemistryTime = getCurrentStudyTimeForSubject("chemistry");
  const mathsTime = getCurrentStudyTimeForSubject("mathematics");
  
  const physicsGoal = 8 * 60; // 8 hours in minutes
  const chemistryGoal = 6 * 60; // 6 hours in minutes
  const mathsGoal = 7 * 60; // 7 hours in minutes
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };
  
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Study Progress</CardTitle>
        <Badge variant="outline">
          This Week
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Physics Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Physics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(physicsTime)} / {formatTime(physicsGoal)}
              </span>
            </div>
            <Progress value={calculateProgress(physicsTime, physicsGoal)} className="h-2" />
          </div>
          
          {/* Chemistry Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Chemistry</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(chemistryTime)} / {formatTime(chemistryGoal)}
              </span>
            </div>
            <Progress value={calculateProgress(chemistryTime, chemistryGoal)} className="h-2" />
          </div>
          
          {/* Mathematics Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Mathematics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(mathsTime)} / {formatTime(mathsGoal)}
              </span>
            </div>
            <Progress value={calculateProgress(mathsTime, mathsGoal)} className="h-2" />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button 
            className="w-full text-sm text-primary flex items-center justify-center"
            variant="ghost"
            asChild
          >
            <Link href="/study-timer">
              <Timer className="mr-2 h-4 w-4" />
              Start Study Timer
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
