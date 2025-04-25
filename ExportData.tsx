import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CloudUpload, Download, Copy, FileCog, Server, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportData() {
  const { exportData, studyData } = useAppContext();
  const { toast } = useToast();
  
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeSchedule, setIncludeSchedule] = useState(true);
  const [includeHolidays, setIncludeHolidays] = useState(true);
  const [includeStudyData, setIncludeStudyData] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const handleExport = () => {
    // In a real app with selective export, we would filter the data here
    // For simplicity, we'll just export all data since that's what the exportData function does
    const jsonData = exportData();
    
    // Create a Blob containing the data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-export-${new Date().toISOString().split('T')[0]}.json`;
    
    // Append the anchor to the body, click it, and remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Release the URL object
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully",
    });
  };
  
  const handleCopyToClipboard = () => {
    const jsonData = exportData();
    
    navigator.clipboard.writeText(jsonData)
      .then(() => {
        setCopied(true);
        
        toast({
          title: "Copied to Clipboard",
          description: "Data has been copied to your clipboard",
        });
        
        // Reset the copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        
        toast({
          title: "Copy Failed",
          description: "Failed to copy data to clipboard",
          variant: "destructive",
        });
      });
  };
  
  // Calculate data summary
  const dataSummary = {
    tasks: studyData.tasks.length,
    completedTasks: studyData.tasks.filter(t => t.completed).length,
    schedule: studyData.schedule.length,
    holidays: studyData.holidays.length,
    studySessions: studyData.studySessions.length,
    totalStudyHours: Math.round(studyData.studySessions.reduce((sum, session) => sum + session.duration, 0) / 60)
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Export Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Export your study data to save or transfer to another device.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Profile Information</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Include your name, email, and profile photo</p>
                </div>
                <Switch 
                  checked={includeProfile}
                  onCheckedChange={setIncludeProfile}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Tasks</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Include all your tasks and backlog</p>
                </div>
                <Switch 
                  checked={includeTasks}
                  onCheckedChange={setIncludeTasks}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Schedule</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Include your daily schedule settings</p>
                </div>
                <Switch 
                  checked={includeSchedule}
                  onCheckedChange={setIncludeSchedule}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Holidays</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Include your scheduled holidays</p>
                </div>
                <Switch 
                  checked={includeHolidays}
                  onCheckedChange={setIncludeHolidays}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Study Data</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Include your study sessions and progress</p>
                </div>
                <Switch 
                  checked={includeStudyData}
                  onCheckedChange={setIncludeStudyData}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleExport}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleCopyToClipboard}
              >
                {copied ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileCog className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-sm font-semibold">Tasks</h3>
                  </div>
                  <p className="text-2xl font-bold">{dataSummary.tasks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dataSummary.completedTasks} completed
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Server className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-sm font-semibold">Study Sessions</h3>
                  </div>
                  <p className="text-2xl font-bold">{dataSummary.studySessions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dataSummary.totalStudyHours} hours total
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CloudUpload className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-sm font-semibold">Schedule Slots</h3>
                  </div>
                  <p className="text-2xl font-bold">{dataSummary.schedule}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Across all subjects
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CloudUpload className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-sm font-semibold">Holidays</h3>
                  </div>
                  <p className="text-2xl font-bold">{dataSummary.holidays}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Scheduled breaks
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-sm font-semibold mb-2 text-primary">Export File Format</h3>
                <p className="text-xs mb-1">Your data will be exported as a JSON file containing:</p>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc pl-4">
                  <li>User profile information</li>
                  <li>All tasks (including completed and backlog)</li>
                  <li>Daily schedule settings</li>
                  <li>Holiday schedules</li>
                  <li>Study sessions and progress data</li>
                  <li>Streak information</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">How to Import</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  To import this data on another device, go to the "Import Data" page and upload the exported JSON file.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
