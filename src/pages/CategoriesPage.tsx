import { useState, useEffect } from "react";
import { Category, storage } from "@/lib/storage";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, List, Briefcase, User, Heart, Home, BookOpen, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconOptions = [
  { name: 'List', icon: List, label: 'قائمة' },
  { name: 'Briefcase', icon: Briefcase, label: 'عمل' },
  { name: 'User', icon: User, label: 'شخصي' },
  { name: 'Heart', icon: Heart, label: 'صحة' },
  { name: 'Home', icon: Home, label: 'منزل' },
  { name: 'BookOpen', icon: BookOpen, label: 'تعليم' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'ترفيه' },
];

const colorOptions = [
  { name: 'blue', class: 'bg-blue-500', label: 'أزرق' },
  { name: 'green', class: 'bg-green-500', label: 'أخضر' },
  { name: 'purple', class: 'bg-purple-500', label: 'بنفسجي' },
  { name: 'red', class: 'bg-red-500', label: 'أحمر' },
  { name: 'yellow', class: 'bg-yellow-500', label: 'أصفر' },
  { name: 'pink', class: 'bg-pink-500', label: 'وردي' },
  { name: 'indigo', class: 'bg-indigo-500', label: 'نيلي' },
  { name: 'orange', class: 'bg-orange-500', label: 'برتقالي' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: 'blue',
    icon: 'List'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const loadedCategories = storage.getCategories();
    setCategories(loadedCategories);
  };

  const getCategoryTaskCount = (categoryId: string) => {
    const tasks = storage.getTasks();
    return tasks.filter(task => task.category === categoryId && !task.completed).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم القائمة",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: formData.name.trim(), color: formData.color, icon: formData.icon }
          : cat
      );
      storage.saveCategories(updatedCategories);
      toast({
        title: "تم التحديث",
        description: "تم تحديث القائمة بنجاح"
      });
    } else {
      // Create new category
      storage.addCategory({
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon
      });
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء القائمة بنجاح"
      });
    }

    loadCategories();
    handleCloseDialog();
  };

  const handleDelete = (categoryId: string) => {
    if (categoryId === '1') {
      toast({
        title: "تحذير",
        description: "لا يمكن حذف القائمة الافتراضية",
        variant: "destructive"
      });
      return;
    }

    storage.deleteCategory(categoryId);
    loadCategories();
    toast({
      title: "تم الحذف",
      description: "تم حذف القائمة وتم نقل المهام إلى القائمة العامة"
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCategory(null);
    setFormData({ name: '', color: 'blue', icon: 'List' });
  };

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.icon : List;
  };

  const getColorClass = (colorName: string) => {
    const colorOption = colorOptions.find(option => option.name === colorName);
    return colorOption ? colorOption.class : 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">القوائم</h1>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-lg">
                <Plus className="h-4 w-4 ml-1" />
                قائمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'تعديل القائمة' : 'قائمة جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم القائمة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم القائمة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>الأيقونة</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map(({ name, icon: Icon, label }) => (
                      <Button
                        key={name}
                        type="button"
                        variant={formData.icon === name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                        className="h-12 w-12 p-0"
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>اللون</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(({ name, class: colorClass }) => (
                      <Button
                        key={name}
                        type="button"
                        variant={formData.color === name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, color: name }))}
                        className="h-8 w-full p-0 relative"
                      >
                        <div className={`w-6 h-6 rounded ${colorClass}`} />
                        {formData.color === name && (
                          <div className="absolute inset-0 border-2 border-primary rounded" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'حفظ التغييرات' : 'إنشاء القائمة'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Categories List */}
      <main className="p-4">
        <div className="grid gap-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const taskCount = getCategoryTaskCount(category.id);
            
            return (
              <Card key={category.id} className="p-4 card-hover animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${getColorClass(category.color)} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {taskCount} مهمة نشطة
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    {category.id !== '1' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <List className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا توجد قوائم</h3>
            <p className="text-muted-foreground mb-6">
              أنشئ قوائم لتنظيم مهامك بشكل أفضل
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 ml-1" />
              إنشاء قائمة جديدة
            </Button>
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}