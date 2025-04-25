import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileInput, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImportPlans() {
  const { importPlans } = useAppContext();
  const { toast } = useToast();
  
  const [plansText, setPlansText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
  } | null>(null);
  
  const handleImport = () => {
    if (!plansText.trim()) {
      toast({
        title: "Error",
        description: "Please enter plans before importing",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const result = importPlans(plansText);
      setImportResult({
        success: result.success,
        message: result.message,
        imported: result.success ? parseInt(result.message.match(/\d+/)?.[0] || "0") : 0
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
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
        description: "An unexpected error occurred while importing plans",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClear = () => {
    setPlansText("");
    setImportResult(null);
  };
  
  const formatExample = `|2023-07-15|Physics revision chapter 5|Math problems set 3|
|2023-07-16|Chemistry lab preparation|Physics numerical problems|Math exercises|
|2023-07-17|Physics formulas revision|Chemistry organic reactions|`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Enter your plans in the following format:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono mb-4">
                |date|task1|task2|task3|
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Date format should be YYYY-MM-DD, for example:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono mb-4">
                |2023-07-15|Physics revision|Math problems|
              </div>
              
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Tasks containing the words "Physics", "Chemistry", or "Math" will be automatically tagged with the corresponding subject.
                </AlertDescription>
              </Alert>
            </div>
            
            <Textarea
              placeholder="Enter your plans here..."
              rows={10}
              value={plansText}
              onChange={(e) => setPlansText(e.target.value)}
              className="mb-4"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleImport}
                disabled={isImporting || !plansText.trim()}
                className="flex-1"
              >
                <FileInput className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import Plans"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClear}
                disabled={isImporting || !plansText.trim()}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Example and Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Example</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <pre className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono">
                  {formatExample}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Import Results</h3>
              
              {importResult ? (
                <div className={`p-4 rounded-lg border ${
                  importResult.success 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" 
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                }`}>
                  <div className="flex items-start">
                    {importResult.success ? (
                      <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium">
                        {importResult.success ? "Import Successful" : "Import Failed"}
                      </h4>
                      <p className="text-sm mt-1">{importResult.message}</p>
                      
                      {importResult.success && importResult.imported && (
                        <p className="text-sm mt-2">
                          ✓ {importResult.imported} task{importResult.imported !== 1 ? 's' : ''} imported successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
                  <FileInput className="h-10 w-10 mx-auto mb-2" />
                  <p>Enter your plans and click "Import Plans" to see results</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
