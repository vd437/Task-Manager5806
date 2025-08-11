import { useState, useEffect } from "react";
import { Task, Category, storage } from "@/lib/storage";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target,
  Award,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer
} from "recharts";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, subWeeks } from "date-fns";
import { ar } from "date-fns/locale";

export default function StatisticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setTasks(storage.getTasks());
    setCategories(storage.getCategories());
  }, []);

  // Calculate basic statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority distribution
  const priorityStats = {
    high: tasks.filter(task => task.priority === 'high' && !task.completed).length,
    medium: tasks.filter(task => task.priority === 'medium' && !task.completed).length,
    low: tasks.filter(task => task.priority === 'low' && !task.completed).length,
  };

  // Category distribution
  const categoryStats = categories.map(category => ({
    name: category.name,
    total: tasks.filter(task => task.category === category.id).length,
    completed: tasks.filter(task => task.category === category.id && task.completed).length,
    pending: tasks.filter(task => task.category === category.id && !task.completed).length,
    color: category.color,
  }));

  // Weekly progress data
  const getWeeklyData = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 6 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 6 });
      
      const weekTasks = tasks.filter(task => 
        isWithinInterval(task.createdAt, { start: weekStart, end: weekEnd })
      );
      
      const weekCompleted = weekTasks.filter(task => task.completed).length;
      
      weeks.push({
        week: `الأسبوع ${i + 1}`,
        created: weekTasks.length,
        completed: weekCompleted,
      });
    }
    return weeks;
  };

  const weeklyData = getWeeklyData();

  // Daily completion data for current week
  const getDailyData = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 6 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dayTasks = tasks.filter(task => 
        task.updatedAt.toDateString() === day.toDateString() && task.completed
      );
      
      return {
        day: format(day, 'EEEEE', { locale: ar }),
        completed: dayTasks.length,
      };
    });
  };

  const dailyData = getDailyData();

  // Pie chart data for priorities
  const priorityPieData = [
    { name: 'عالية', value: priorityStats.high, color: '#ef4444' },
    { name: 'متوسطة', value: priorityStats.medium, color: '#f59e0b' },
    { name: 'منخفضة', value: priorityStats.low, color: '#10b981' },
  ].filter(item => item.value > 0);

  const achievements = [
    {
      title: 'منجز المهام',
      description: `أكملت ${completedTasks} مهمة`,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'معدل الإنجاز',
      description: `${completionRate}% معدل الإكمال`,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'المهام النشطة',
      description: `${pendingTasks} مهمة قيد التنفيذ`,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'القوائم النشطة',
      description: `${categories.length} قائمة منظمة`,
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">الإحصائيات</h1>
            <p className="text-sm text-muted-foreground">تتبع تقدمك وإنجازاتك</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <Card key={index} className="card-hover animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${achievement.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${achievement.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{achievement.title}</p>
                      <p className="text-lg font-bold leading-tight">{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Progress Chart */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              التقدم الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="created" fill="#3b82f6" name="مهام جديدة" />
                  <Bar dataKey="completed" fill="#10b981" name="مهام مكتملة" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Completion Chart */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الإنجاز اليومي - هذا الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="مهام مكتملة"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        {priorityPieData.length > 0 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                توزيع المهام حسب الأولوية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {priorityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Statistics */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>إحصائيات القوائم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${category.color}-500`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-bold">{category.total}</div>
                      <div className="text-xs text-muted-foreground">المجموع</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{category.completed}</div>
                      <div className="text-xs text-muted-foreground">مكتمل</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-600">{category.pending}</div>
                      <div className="text-xs text-muted-foreground">معلق</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>رؤى الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completionRate >= 80 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">أداء ممتاز!</p>
                    <p className="text-sm text-green-600">معدل إنجازك مرتفع جداً، استمر على هذا النحو</p>
                  </div>
                </div>
              )}
              
              {priorityStats.high > 5 && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">انتباه!</p>
                    <p className="text-sm text-red-600">لديك {priorityStats.high} مهام عالية الأولوية معلقة</p>
                  </div>
                </div>
              )}
              
              {pendingTasks === 0 && totalTasks > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">مبروك!</p>
                    <p className="text-sm text-blue-600">أكملت جميع مهامك، حان وقت إنشاء مهام جديدة</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}