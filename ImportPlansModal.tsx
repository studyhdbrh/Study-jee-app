import { useState } from "react";
import { X, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function ImportPlansModal() {
  const { importPlans, setImportPlansModalOpen } = useAppContext();
  const { toast } = useToast();
  
  const [plansText, setPlansText] = useState("");

  const handleImport = () => {
    if (!plansText.trim()) {
      toast({
        title: "Error",
        description: "Please enter plans before importing",
        variant: "destructive",
      });
      return;
    }
    
    const result = importPlans(plansText);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setImportPlansModalOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setImportPlansModalOpen(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Plans</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your plans in the following format: <br />
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">
              |date|task1|task2|task3|
            </code>
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plans-input">Plans</Label>
            <Textarea 
              id="plans-input" 
              placeholder="|2023-07-15|Complete Physics chapter 5|Solve Math problems|Chemistry revision|"
              value={plansText}
              onChange={(e) => setPlansText(e.target.value)}
              rows={5}
            />
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Example:</span><br />
              |2023-07-15|Physics revision|Math problems|<br />
              |2023-07-16|Chemistry lab prep|Physics practical|Math exercise|
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setImportPlansModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
