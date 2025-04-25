import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, UmbrellaIcon, Clock, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Holiday } from "@/types";

export default function Holidays() {
  const { studyData, addHoliday, removeHoliday, getRemainingHolidays } = useAppContext();
  const { toast } = useToast();
  
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [startTime, setStartTime] = useState("12:00");
  const [currentMonthHolidays, setCurrentMonthHolidays] = useState<Holiday[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Filter holidays for the currently viewed month
  useEffect(() => {
    if (!calendarDate) return;
    
    const filtered = studyData.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameMonth(holidayDate, calendarDate);
    });
    
    setCurrentMonthHolidays(filtered);
  }, [studyData.holidays, calendarDate]);
  
  const handleAddHoliday = () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date for your holiday",
        variant: "destructive",
      });
      return;
    }
    
    // Check remaining holidays
    const remainingHolidays = getRemainingHolidays();
    const holidayValue = isHalfDay ? 0.5 : 1;
    
    if (remainingHolidays < holidayValue) {
      toast({
        title: "Limit Reached",
        description: `You only have ${remainingHolidays} holiday${remainingHolidays !== 1 ? 's' : ''} remaining this month`,
        variant: "destructive",
      });
      return;
    }
    
    // Format date to YYYY-MM-DD
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Check if holiday already exists for this date
    const existingHoliday = studyData.holidays.find(h => h.date === formattedDate);
    if (existingHoliday) {
      toast({
        title: "Holiday Already Scheduled",
        description: "You already have a holiday scheduled for this date",
        variant: "destructive",
      });
      return;
    }
    
    // Add holiday
    addHoliday({
      date: formattedDate,
      isHalfDay,
      startTime: isHalfDay ? startTime : undefined
    });
    
    toast({
      title: "Holiday Scheduled",
      description: `${isHalfDay ? 'Half' : 'Full'} holiday scheduled for ${format(selectedDate, 'MMMM d, yyyy')}`,
    });
    
    setIsAddHolidayOpen(false);
  };
  
  const handleRemoveHoliday = (holidayId: string) => {
    removeHoliday(holidayId);
    
    toast({
      title: "Holiday Removed",
      description: "Your holiday has been removed",
    });
  };
  
  const handleCalendarDayClick = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if the date already has a holiday
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingHoliday = studyData.holidays.find(h => h.date === formattedDate);
    
    if (existingHoliday) {
      toast({
        title: "Holiday Already Scheduled",
        description: `You have a ${existingHoliday.isHalfDay ? 'half' : 'full'} holiday scheduled for this date`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedDate(date);
    setIsAddHolidayOpen(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Holidays</h1>
        <Button onClick={() => setIsAddHolidayOpen(true)}>
          <UmbrellaIcon className="mr-2 h-4 w-4" /> Take Holiday
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holiday Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Holiday Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-2 bg-background rounded-lg shadow-sm border">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarDayClick}
                onMonthChange={setCalendarDate}
                className="rounded-md border"
                modifiers={{
                  holiday: (date) => {
                    const formatted = format(date, 'yyyy-MM-dd');
                    return currentMonthHolidays.some(h => h.date === formatted);
                  },
                  today: (date) => isToday(date)
                }}
                modifiersClassNames={{
                  holiday: "border-2 border-amber-500 text-amber-500 font-bold",
                  today: "bg-primary text-primary-foreground font-bold"
                }}
                components={{
                  DayContent: (props) => {
                    const formatted = format(props.date, 'yyyy-MM-dd');
                    const holiday = currentMonthHolidays.find(h => h.date === formatted);
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {props.date.getDate()}
                        {holiday && (
                          <div 
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                              holiday.isHalfDay ? 'bg-amber-300' : 'bg-amber-500'
                            }`}
                          ></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Click on a date to schedule a holiday. You have{" "}
                <span className="font-semibold text-amber-500">{getRemainingHolidays()}</span> of 7 holidays
                remaining this month.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">Full Holiday</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-300 mr-2"></div>
                  <span className="text-sm">Half Holiday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Scheduled Holidays */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            {studyData.holidays.length > 0 ? (
              <div className="space-y-3">
                {studyData.holidays.map((holiday) => (
                  <div 
                    key={holiday.id}
                    className="p-3 rounded-lg border flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300"
                  >
                    <div className="flex items-center">
                      <UmbrellaIcon className="h-5 w-5 mr-3" />
                      <div>
                        <h4 className="font-medium">
                          {format(new Date(holiday.date), 'MMMM d, yyyy')}
                        </h4>
                        <p className="text-sm opacity-80">
                          {holiday.isHalfDay 
                            ? `Half Day (from ${holiday.startTime})` 
                            : 'Full Day'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveHoliday(holiday.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UmbrellaIcon className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">No Holidays Scheduled</h3>
                <p className="mb-4">Take a break! You've earned it.</p>
                <Button onClick={() => setIsAddHolidayOpen(true)}>
                  <UmbrellaIcon className="mr-2 h-4 w-4" /> Take Holiday
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Holiday Dialog */}
      <Dialog open={isAddHolidayOpen} onOpenChange={setIsAddHolidayOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Holiday</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="holiday-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="holiday-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>Holiday Type</Label>
              <RadioGroup 
                value={isHalfDay ? "half" : "full"} 
                onValueChange={(value) => setIsHalfDay(value === "half")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="holiday-full" />
                  <Label htmlFor="holiday-full" className="cursor-pointer">
                    Full Day
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="half" id="holiday-half" />
                  <Label htmlFor="holiday-half" className="cursor-pointer">
                    Half Day
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {isHalfDay && (
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time (for half day)</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Study schedule after this time will be moved to backlog.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddHolidayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHoliday}>
              Schedule Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
