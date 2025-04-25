import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { SubjectType } from "@/types";

export default function Progress() {
  const { studyData } = useAppContext();
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<{
    current: number;
    longest: number;
    totalHours: number;
    averageDaily: number;
  }>({
    current: 0,
    longest: 0,
    totalHours: 0,
    averageDaily: 0
  });
  
  const SUBJECT_COLORS = {
    physics: "#3B82F6", // blue-500
    chemistry: "#10B981", // green-500
    mathematics: "#F59E0B" // amber-500
  };

  // Prepare chart data based on selected period
  useEffect(() => {
    // Create date range
    const endDate = new Date();
    let startDate;
    
    switch(period) {
      case "week":
        startDate = subDays(endDate, 6);
        break;
      case "month":
        startDate = subDays(endDate, 29);
        break;
      case "year":
        startDate = subDays(endDate, 364);
        break;
    }
    
    // Generate date range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Prepare data for chart
    const data = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = studyData.dailyProgress.find(p => p.date === dateStr);
      
      return {
        date: period === "year" ? format(date, 'MMM') : format(date, 'dd MMM'),
        physics: dayProgress ? Math.round(dayProgress.subjects.physics / 60 * 10) / 10 : 0,
        chemistry: dayProgress ? Math.round(dayProgress.subjects.chemistry / 60 * 10) / 10 : 0,
        mathematics: dayProgress ? Math.round(dayProgress.subjects.mathematics / 60 * 10) / 10 : 0
      };
    });
    
    // For year view, aggregate by month
    if (period === "year") {
      const monthlyData: Record<string, any> = {};
      
      data.forEach(day => {
        const month = day.date;
        if (!monthlyData[month]) {
          monthlyData[month] = {
            date: month,
            physics: 0,
            chemistry: 0,
            mathematics: 0
          };
        }
        
        monthlyData[month].physics += day.physics;
        monthlyData[month].chemistry += day.chemistry;
        monthlyData[month].mathematics += day.mathematics;
      });
      
      // Convert back to array and round values
      const aggregatedData = Object.values(monthlyData).map(month => ({
        ...month,
        physics: Math.round(month.physics * 10) / 10,
        chemistry: Math.round(month.chemistry * 10) / 10,
        mathematics: Math.round(month.mathematics * 10) / 10
      }));
      
      setChartData(aggregatedData);
    } else {
      setChartData(data);
    }
    
    // Calculate subject distribution
    const totalPhysics = studyData.dailyProgress.reduce(
      (sum, day) => sum + day.subjects.physics, 0
    );
    const totalChemistry = studyData.dailyProgress.reduce(
      (sum, day) => sum + day.subjects.chemistry, 0
    );
    const totalMathematics = studyData.dailyProgress.reduce(
      (sum, day) => sum + day.subjects.mathematics, 0
    );
    
    const totalMinutes = totalPhysics + totalChemistry + totalMathematics;
    
    if (totalMinutes > 0) {
      setDistributionData([
        { name: "Physics", value: totalPhysics, percentage: Math.round((totalPhysics / totalMinutes) * 100) },
        { name: "Chemistry", value: totalChemistry, percentage: Math.round((totalChemistry / totalMinutes) * 100) },
        { name: "Mathematics", value: totalMathematics, percentage: Math.round((totalMathematics / totalMinutes) * 100) }
      ]);
    } else {
      setDistributionData([
        { name: "Physics", value: 1, percentage: 33 },
        { name: "Chemistry", value: 1, percentage: 33 },
        { name: "Mathematics", value: 1, percentage: 34 }
      ]);
    }
    
    // Calculate stats
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const daysWithStudy = studyData.dailyProgress.length;
    const averageDaily = daysWithStudy > 0 
      ? Math.round((totalHours / daysWithStudy) * 10) / 10
      : 0;
    
    setStreakData({
      current: studyData.streak.current,
      longest: Math.max(studyData.streak.current, 7), // Placeholder, should be calculated from historical data
      totalHours,
      averageDaily
    });
    
  }, [period, studyData.dailyProgress, studyData.streak.current]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Progress</h1>
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as "week" | "month" | "year")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Current Streak</h3>
            <div className="text-3xl font-bold">{streakData.current} days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Longest Streak</h3>
            <div className="text-3xl font-bold">{streakData.longest} days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Total Study Hours</h3>
            <div className="text-3xl font-bold">{streakData.totalHours}h</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Average Daily</h3>
            <div className="text-3xl font-bold">{streakData.averageDaily}h</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Hours Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study Hours by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="physics" name="Physics" fill={SUBJECT_COLORS.physics} />
                  <Bar dataKey="chemistry" name="Chemistry" fill={SUBJECT_COLORS.chemistry} />
                  <Bar dataKey="mathematics" name="Mathematics" fill={SUBJECT_COLORS.mathematics} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Subject Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {distributionData.map((entry, index) => {
                      const subject = entry.name.toLowerCase() as SubjectType;
                      return <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[subject]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => `${Math.round(value / 60 * 10) / 10}h`} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-3 gap-2 w-full mt-4">
                {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
                  <div key={subject} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                    <span className="text-xs">
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
