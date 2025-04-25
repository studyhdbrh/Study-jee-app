import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SubjectType } from "@/types";
import { Play, Pause, Clock, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function StudyTimer() {
  const { recordStudySession } = useAppContext();
  
  const [subject, setSubject] = useState<SubjectType>("physics");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recentSessions, setRecentSessions] = useState<Array<{
    id: string;
    subject: SubjectType;
    duration: number;
    date: string;
  }>>([]);
  
  const intervalRef = useRef<number | null>(null);
  
  // Timer functionality
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  const handleStartStop = () => {
    if (isRunning) {
      // Stop the timer and record session if time > 0
      if (seconds > 0) {
        const minutes = Math.floor(seconds / 60);
        const sessionDate = new Date().toISOString().split('T')[0];
        
        const sessionId = crypto.randomUUID();
        const newSession = {
          id: sessionId,
          subject,
          duration: minutes,
          date: sessionDate
        };
        
        // Update UI immediately
        setRecentSessions(prev => [newSession, ...prev].slice(0, 5));
        
        // Record in app state
        recordStudySession({
          subject,
          duration: minutes,
          date: sessionDate
        });
      }
    }
    
    // Toggle timer state
    setIsRunning(prev => !prev);
  };
  
  const handleReset = () => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    setSeconds(0);
  };
  
  const getSubjectColor = (subj: SubjectType) => {
    switch(subj) {
      case "physics":
        return "bg-blue-500";
      case "chemistry":
        return "bg-green-500";
      case "mathematics":
        return "bg-amber-500";
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Study Timer</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subject Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs mb-6">
              <Select
                value={subject}
                onValueChange={(value) => setSubject(value as SubjectType)}
                disabled={isRunning}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-6xl font-bold font-mono mb-8">
              {formatTime(seconds)}
            </div>
            
            <Progress 
              value={(seconds % 3600) / 36} 
              className={`w-full h-2 mb-8 ${getSubjectColor(subject)}`}
            />
            
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleStartStop}
                className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
              >
                {isRunning ? (
                  <><Pause className="mr-2 h-5 w-5" /> Stop</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Start</>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                disabled={isRunning}
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div 
                  key={session.id}
                  className="p-3 rounded-lg border flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getSubjectColor(session.subject)}`}></div>
                    <div>
                      <h4 className="font-medium">
                        {session.subject.charAt(0).toUpperCase() + session.subject.slice(1)}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.duration} minutes
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(session.date), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No recent study sessions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
