import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export default function BacklogTasks() {
  const { getBacklogTasks, updateTask } = useAppContext();
  
  const backlogTasks = getBacklogTasks();
  
  const handleTaskCheck = (taskId: string, checked: boolean) => {
    updateTask(taskId, { completed: checked });
  };
  
  const getSubjectBadgeClasses = (subject: string | null) => {
    if (!subject) return "";
    
    switch(subject) {
      case "physics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "chemistry":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "mathematics":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Backlog</CardTitle>
        {backlogTasks.length > 0 && (
          <Badge variant="destructive" className="rounded-full">
            {backlogTasks.length} pending
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {backlogTasks.length > 0 ? (
          <div className="space-y-3">
            {backlogTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-start space-x-3">
                <Checkbox 
                  className="mt-0.5"
                  checked={task.completed} 
                  id={`backlog-${task.id}`} 
                  onCheckedChange={(checked) => 
                    handleTaskCheck(task.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor={`backlog-${task.id}`}
                    className={`text-sm ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : ""}`}
                  >
                    {task.content}
                  </label>
                  <div className="flex items-center mt-1">
                    {task.originalDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        From {format(new Date(task.originalDate), 'MMM d')}
                      </span>
                    )}
                    {task.subject && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${getSubjectBadgeClasses(task.subject)}`}
                      >
                        {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {backlogTasks.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-gray-500 dark:text-gray-400"
              >
                View All {backlogTasks.length} Backlogs
              </Button>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No backlog tasks
          </div>
        )}
      </CardContent>
    </Card>
  );
}
