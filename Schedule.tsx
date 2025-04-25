import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, addDays, startOfWeek } from "date-fns";
import { SubjectType, ScheduleTimeSlot } from "@/types";

export default function Schedule() {
  const { studyData, addScheduleSlot, removeScheduleSlot, isHoliday } = useAppContext();
  
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [daySchedule, setDaySchedule] = useState<ScheduleTimeSlot[]>([]);
  
  // New slot form state
  const [slotSubject, setSlotSubject] = useState<SubjectType>("physics");
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("10:00");
  const [slotApplyTo, setSlotApplyTo] = useState<"day" | "weekday" | "all">("day");
  
  // Generate week days when selected week changes
  useEffect(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(selectedWeek, i));
    }
    setWeekDays(days);
  }, [selectedWeek]);
  
  // Filter schedule for selected day
  useEffect(() => {
    const daySlots = studyData.schedule.filter(slot => 
      slot.day === selectedDay || 
      slot.day === format(new Date(selectedDay), 'EEEE').toLowerCase()
    );
    
    // Sort by start time
    daySlots.sort((a, b) => {
      return a.startTime < b.startTime ? -1 : 1;
    });
    
    setDaySchedule(daySlots);
  }, [selectedDay, studyData.schedule]);
  
  const handleAddSlot = () => {
    const dayStr = selectedDay;
    
    // Validate times
    if (slotStartTime >= slotEndTime) {
      alert("End time must be after start time");
      return;
    }
    
    if (slotApplyTo === "day") {
      // Add to specific date
      addScheduleSlot({
        day: dayStr,
        subject: slotSubject,
        startTime: slotStartTime,
        endTime: slotEndTime
      });
    } else if (slotApplyTo === "weekday") {
      // Add to specific weekday (e.g., "monday")
      const weekday = format(new Date(dayStr), 'EEEE').toLowerCase();
      addScheduleSlot({
        day: weekday,
        subject: slotSubject,
        startTime: slotStartTime,
        endTime: slotEndTime
      });
    } else if (slotApplyTo === "all") {
      // Add to all weekdays
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      weekdays.forEach(weekday => {
        addScheduleSlot({
          day: weekday,
          subject: slotSubject,
          startTime: slotStartTime,
          endTime: slotEndTime
        });
      });
    }
    
    setIsAddSlotOpen(false);
  };
  
  const getSubjectColor = (subject: SubjectType) => {
    switch(subject) {
      case "physics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "chemistry":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "mathematics":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    }
  };
  
  const getHolidayStatus = () => {
    const status = isHoliday(selectedDay);
    if (!status.isHoliday) return null;
    
    return {
      ...status,
      label: status.isHalfDay 
        ? `Half Holiday (from ${status.startTime})`
        : "Full Holiday"
    };
  };
  
  const holidayStatus = getHolidayStatus();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Schedule</h1>
        <div className="flex gap-2">
          <Select
            value={format(selectedWeek, 'yyyy-MM-dd')}
            onValueChange={(value) => setSelectedWeek(new Date(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Weeks</SelectLabel>
                {[0, 1, 2, 3].map((offset) => {
                  const weekStart = startOfWeek(addDays(new Date(), offset * 7));
                  const weekEnd = addDays(weekStart, 6);
                  return (
                    <SelectItem key={offset} value={format(weekStart, 'yyyy-MM-dd')}>
                      {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddSlotOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Slot
          </Button>
        </div>
      </div>
      
      {/* Week days navigation */}
      <div className="flex overflow-x-auto mb-6 pb-2">
        {weekDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDay === dayStr;
          const dayHoliday = isHoliday(dayStr);
          
          return (
            <div
              key={dayStr}
              className={`flex-shrink-0 flex flex-col items-center mr-4 p-3 rounded-lg cursor-pointer ${
                isSelected 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedDay(dayStr)}
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {format(day, 'EEE')}
              </span>
              <span className="text-lg font-bold mt-1">{format(day, 'd')}</span>
              <span className="text-xs mt-1">
                {dayHoliday.isHoliday ? (
                  <span className="text-amber-500">
                    {dayHoliday.isHalfDay ? 'Half' : 'Holiday'}
                  </span>
                ) : (
                  format(day, 'MMM')
                )}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Schedule for selected day */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{format(new Date(selectedDay), 'EEEE, MMMM d, yyyy')}</CardTitle>
            {holidayStatus && (
              <div className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 rounded-full text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {holidayStatus.label}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {holidayStatus?.isHoliday && !holidayStatus.isHalfDay ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-16 w-16 mb-4 text-amber-500" />
              <h3 className="text-xl font-medium mb-2">Holiday</h3>
              <p>You're taking a holiday today. Enjoy your break!</p>
            </div>
          ) : (
            <>
              {daySchedule.length > 0 ? (
                <div className="space-y-3">
                  {daySchedule.map((slot) => (
                    <div 
                      key={slot.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${getSubjectColor(slot.subject)}`}
                    >
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3" />
                        <div>
                          <h4 className="font-medium">
                            {slot.subject.charAt(0).toUpperCase() + slot.subject.slice(1)}
                          </h4>
                          <p className="text-sm opacity-80">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeScheduleSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Schedule Yet</h3>
                  <p className="mb-4">Add study slots to create your schedule for this day.</p>
                  <Button onClick={() => setIsAddSlotOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Study Slot
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Add Schedule Slot Dialog */}
      <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Study Slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={slotSubject}
                onValueChange={(value) => setSlotSubject(value as SubjectType)}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Apply To</Label>
              <RadioGroup 
                value={slotApplyTo} 
                onValueChange={(value) => setSlotApplyTo(value as "day" | "weekday" | "all")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day" id="apply-day" />
                  <Label htmlFor="apply-day" className="cursor-pointer">
                    This day only ({format(new Date(selectedDay), 'MMM d')})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekday" id="apply-weekday" />
                  <Label htmlFor="apply-weekday" className="cursor-pointer">
                    Every {format(new Date(selectedDay), 'EEEE')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="apply-all" />
                  <Label htmlFor="apply-all" className="cursor-pointer">
                    All days of the week
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSlotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlot}>
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
