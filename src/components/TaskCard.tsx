import { Task, storage } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Edit, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ar } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'task-priority-high';
      case 'medium': return 'task-priority-medium';
      case 'low': return 'task-priority-low';
      default: return 'task-priority-low';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'منخفضة';
    }
  };

  const getDateText = (date: Date) => {
    if (isToday(date)) return 'اليوم';
    if (isTomorrow(date)) return 'غداً';
    return format(date, 'dd/MM/yyyy', { locale: ar });
  };

  const isOverdue = task.dueDate && isPast(task.dueDate) && !task.completed;

  return (
    <Card className={cn(
      "p-4 card-hover animate-fade-in transition-all duration-300 group relative overflow-hidden",
      task.completed && "opacity-60",
      isOverdue && "border-l-4 border-l-destructive"
    )}>
      {/* Priority indicator */}
      <div className={cn(
        "absolute top-0 right-0 w-1 h-full",
        task.priority === 'high' && "bg-destructive",
        task.priority === 'medium' && "bg-warning",
        task.priority === 'low' && "bg-success"
      )} />

      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(task.id)}
          className={cn(
            "h-6 w-6 rounded-full border-2 p-0 flex-shrink-0 mt-1 transition-all duration-200",
            task.completed
              ? "bg-success text-success-foreground border-success scale-110"
              : "border-muted-foreground hover:border-primary hover:scale-110"
          )}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              "font-medium text-base leading-tight transition-all duration-200",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs border font-medium",
                  getPriorityColor(task.priority)
                )}
              >
                {getPriorityText(task.priority)}
              </Badge>

              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors",
                  isOverdue 
                    ? "text-destructive bg-destructive/10" 
                    : "text-muted-foreground bg-muted/50"
                )}>
                  {isOverdue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span className="font-medium">{getDateText(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}