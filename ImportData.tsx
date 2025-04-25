import { useState, useRef, ChangeEvent } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CloudDownload, FileJson, AlertTriangle, Check, UploadCloud, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudyData } from "@/types";

export default function ImportData() {
  const { importData } = useAppContext();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonData, setJsonData] = useState("");
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    data?: Partial<StudyData>;
  } | null>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonData(content);
        
        // Preview the data
        const parsedData = JSON.parse(content) as StudyData;
        const preview: Partial<StudyData> = {
          user: parsedData.user,
          tasks: parsedData.tasks?.length ? [...parsedData.tasks].slice(0, 3) : [],
          holidays: parsedData.holidays?.length ? [...parsedData.holidays].slice(0, 2) : [],
          schedule: parsedData.schedule?.length ? [...parsedData.schedule].slice(0, 2) : [],
          studySessions: parsedData.studySessions?.length ? [...parsedData.studySessions].slice(0, 2) : [],
        };
        
        setImportResult({
          success: true,
          message: "File loaded successfully. Review the data and click 'Import' to proceed.",
          data: preview
        });
      } catch (error) {
        setImportResult({
          success: false,
          message: "Error parsing JSON file. Please make sure it's a valid JSON file."
        });
        
        toast({
          title: "Invalid File",
          description: "The selected file is not a valid JSON file.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    if (!jsonData.trim()) {
      toast({
        title: "Error",
        description: "Please select a file or enter JSON data to import",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const result = importData(jsonData);
      
      setImportResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Data imported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while importing data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClear = () => {
    setJsonData("");
    setFileName("");
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Importing data will replace all your current data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="mb-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-4 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileJson className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium mb-1">
                  {fileName || "Select a JSON file to import"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click to browse or drag and drop
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileChange}
                />
              </div>
              
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                or paste JSON directly:
              </p>
              
              <Textarea
                placeholder="Paste your JSON data here..."
                rows={6}
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="mb-4"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleImport}
                disabled={isImporting || !jsonData.trim()}
                className="flex-1"
              >
                <CloudDownload className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClear}
                disabled={isImporting || (!jsonData.trim() && !fileName)}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {importResult ? (
              <div className={`mb-4 p-4 rounded-lg border ${
                importResult.success 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" 
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              }`}>
                <div className="flex items-start">
                  {importResult.success ? (
                    <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">
                      {importResult.success ? "Valid Data" : "Invalid Data"}
                    </h4>
                    <p className="text-sm mt-1">{importResult.message}</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {importResult?.success && importResult.data ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">User</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm"><span className="font-semibold">Name:</span> {importResult.data.user?.name}</p>
                    <p className="text-sm"><span className="font-semibold">Email:</span> {importResult.data.user?.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Tasks ({importResult.data.tasks?.length || 0} sample)</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    {importResult.data.tasks && importResult.data.tasks.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {importResult.data.tasks.map((task, idx) => (
                          <li key={idx}>• {task.content} ({task.subject || 'No subject'})</li>
                        ))}
                        {importResult.data.tasks.length > 3 && <li>• ...</li>}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Schedule ({importResult.data.schedule?.length || 0} sample)</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    {importResult.data.schedule && importResult.data.schedule.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {importResult.data.schedule.map((slot, idx) => (
                          <li key={idx}>• {slot.subject}: {slot.startTime} - {slot.endTime} ({slot.day})</li>
                        ))}
                        {importResult.data.schedule.length > 2 && <li>• ...</li>}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No schedule</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <FileUp className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                <p className="text-center mb-4">Import a file to see a preview of the data</p>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
