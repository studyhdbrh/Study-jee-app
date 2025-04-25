import { useState } from "react";
import { Task } from "@/types";
import { Check, Plus, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";

interface TasksListProps {
  title: string;
  tasks: Task[];
  date?: string;
  showAddTask?: boolean;
  showSubject?: boolean;
  showDate?: boolean;
}

export default function TasksList({ 
  title, 
  tasks, 
  date, 
  showAddTask = true, 
  showSubject = true,
  showDate = false
}: TasksListProps) {
  const { updateTask, addTask } = useAppContext();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState<string | null>(null);
  const [newTaskDate, setNewTaskDate] = useState(date || new Date().toISOString().split('T')[0]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEE, d MMM");
  };

  const handleTaskCheck = (taskId: string, checked: boolean) => {
    updateTask(taskId, { completed: checked });
  };

  const handleAddTask = () => {
    if (!newTaskContent.trim()) return;
    
    addTask({
      content: newTaskContent,
      date: newTaskDate,
      completed: false,
      subject: newTaskSubject as any,
      isBacklog: false
    });
    
    // Reset form
    setNewTaskContent("");
    setNewTaskSubject(null);
    setIsAddTaskDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {date && (
            <Badge variant="outline" className="font-normal">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(date)}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox 
                    checked={task.completed} 
                    id={task.id} 
                    onCheckedChange={(checked) => 
                      handleTaskCheck(task.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={task.id}
                      className={`text-sm ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : ""}`}
                    >
                      {task.content}
                    </label>
                    {showDate && task.originalDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        From {formatDate(task.originalDate)}
                      </div>
                    )}
                  </div>
                  {showSubject && task.subject && (
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${task.subject === 'physics' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : ''}
                        ${task.subject === 'chemistry' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : ''}
                        ${task.subject === 'mathematics' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : ''}
                      `}
                    >
                      {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No tasks available
            </div>
          )}
          
          {showAddTask && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-primary"
              onClick={() => setIsAddTaskDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-content">Task Description</Label>
              <Input
                id="task-content"
                placeholder="Enter task description"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-subject">Subject (Optional)</Label>
              <Select value={newTaskSubject || ""} onValueChange={setNewTaskSubject}>
                <SelectTrigger id="task-subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-date">Date</Label>
              <Input
                id="task-date"
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
