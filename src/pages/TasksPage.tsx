import { useState, useEffect } from "react";
import { Task, storage } from "@/lib/storage";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Calendar, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, isThisWeek, startOfDay } from "date-fns";

type FilterType = 'all' | 'today' | 'week' | 'completed';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, activeFilter, searchQuery]);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(task => 
          task.dueDate && isToday(task.dueDate) && !task.completed
        );
        break;
      case 'week':
        filtered = filtered.filter(task => 
          task.dueDate && isThisWeek(task.dueDate, { weekStartsOn: 6 }) && !task.completed
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'all':
      default:
        filtered = filtered.filter(task => !task.completed);
        break;
    }

    // Sort tasks
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setFilteredTasks(filtered);
  };

  const handleTaskSave = (task: Task) => {
    loadTasks();
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = (id: string) => {
    storage.deleteTask(id);
    loadTasks();
  };

  const handleTaskToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      storage.updateTask(id, { completed: !task.completed });
      loadTasks();
    }
  };

  const getFilterCount = (filter: FilterType) => {
    switch (filter) {
      case 'today':
        return tasks.filter(task => 
          task.dueDate && isToday(task.dueDate) && !task.completed
        ).length;
      case 'week':
        return tasks.filter(task => 
          task.dueDate && isThisWeek(task.dueDate, { weekStartsOn: 6 }) && !task.completed
        ).length;
      case 'completed':
        return tasks.filter(task => task.completed).length;
      case 'all':
      default:
        return tasks.filter(task => !task.completed).length;
    }
  };

  const filters = [
    { key: 'all' as FilterType, label: 'الكل', icon: Calendar },
    { key: 'today' as FilterType, label: 'اليوم', icon: Clock },
    { key: 'week' as FilterType, label: 'هذا الأسبوع', icon: Calendar },
    { key: 'completed' as FilterType, label: 'مكتملة', icon: CheckCircle2 },
  ];

  if (showTaskForm) {
    return (
      <TaskForm
        task={editingTask}
        onSave={handleTaskSave}
        onCancel={() => {
          setShowTaskForm(false);
          setEditingTask(undefined);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">مهمة</h1>
            <Button
              onClick={() => setShowTaskForm(true)}
              size="sm"
              className="shadow-lg"
            >
              <Plus className="h-4 w-4 ml-1" />
              مهمة جديدة
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في المهام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "flex-shrink-0 gap-2",
                  activeFilter === key && "shadow-md"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                <Badge variant="secondary" className="text-xs">
                  {getFilterCount(key)}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Tasks List */}
      <main className="p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد مهام'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'جرب كلمات مختلفة للبحث'
                : 'ابدأ بإنشاء مهمة جديدة لتنظيم يومك'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 ml-1" />
                إنشاء مهمة جديدة
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="group">
                <TaskCard
                  task={task}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onToggle={handleTaskToggle}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}