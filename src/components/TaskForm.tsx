import { useState, useEffect } from "react";
import { Task, storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || '1');
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate);
  const [categories] = useState(() => storage.getCategories());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    if (task) {
      // Update existing task
      const updatedTask = storage.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
      });
      if (updatedTask) {
        onSave(updatedTask);
      }
    } else {
      // Create new task
      const newTask = storage.addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        completed: false,
      });
      onSave(newTask);
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'متوسطة';
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 animate-slide-up">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold">
            {task ? 'تعديل المهمة' : 'مهمة جديدة'}
          </h1>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المهمة *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان المهمة"
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف تفصيلي للمهمة (اختياري)"
                  rows={3}
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>القائمة</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      locale={ar}
                      initialFocus
                    />
                    {dueDate && (
                      <div className="p-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDueDate(undefined)}
                          className="w-full"
                        >
                          إزالة التاريخ
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </Card>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1"
              size="lg"
            >
              <Save className="ml-2 h-5 w-5" />
              {task ? 'حفظ التغييرات' : 'إنشاء المهمة'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              size="lg"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}