import { useState, useEffect } from "react";
import { storage, AppSettings } from "@/lib/storage";
import { useTheme } from "@/components/ThemeProvider";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  SortAsc, 
  Bell, 
  Trash2,
  Download,
  Upload,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    sortBy: 'date',
    notifications: true,
  });
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const loadedSettings = storage.getSettings();
    setSettings(loadedSettings);
  }, []);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    
    if (key === 'theme') {
      setTheme(value);
    }

    toast({
      title: "تم الحفظ",
      description: "تم حفظ الإعدادات بنجاح",
    });
  };

  const handleExportData = () => {
    try {
      const data = {
        tasks: storage.getTasks(),
        categories: storage.getCategories(),
        settings: storage.getSettings(),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mahamma-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير",
        description: "تم تصدير البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.tasks) storage.saveTasks(data.tasks);
        if (data.categories) storage.saveCategories(data.categories);
        if (data.settings) storage.saveSettings(data.settings);

        toast({
          title: "تم الاستيراد",
          description: "تم استيراد البيانات بنجاح",
        });
        
        // Refresh page to load new data
        window.location.reload();
      } catch (error) {
        toast({
          title: "خطأ",
          description: "ملف غير صالح للاستيراد",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    storage.clearAll();
    toast({
      title: "تم المسح",
      description: "تم مسح جميع البيانات بنجاح",
    });
    
    // Refresh page to show empty state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getTaskCount = () => storage.getTasks().length;
  const getCategoryCount = () => storage.getCategories().length;

  const themeOptions = [
    { value: 'light', label: 'فاتح', icon: Sun },
    { value: 'dark', label: 'داكن', icon: Moon },
    { value: 'system', label: 'النظام', icon: Monitor },
  ];

  const sortOptions = [
    { value: 'date', label: 'التاريخ' },
    { value: 'priority', label: 'الأولوية' },
    { value: 'manual', label: 'يدوي' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>
            <p className="text-sm text-muted-foreground">تخصيص تجربة التطبيق</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Appearance Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نمط المظهر</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value: 'light' | 'dark' | 'system') => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SortAsc className="h-5 w-5" />
              المهام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ترتيب المهام</Label>
              <Select 
                value={settings.sortBy} 
                onValueChange={(value: 'date' | 'priority' | 'manual') => handleSettingChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>التنبيهات</Label>
                <div className="text-sm text-muted-foreground">
                  استقبال إشعارات للمهام المستحقة
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>إدارة البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* App Info */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">معلومات التطبيق</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">المهام:</span>
                  <span className="font-medium mr-2">{getTaskCount()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">القوائم:</span>
                  <span className="font-medium mr-2">{getCategoryCount()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Backup & Restore */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 ml-1" />
                  تصدير البيانات
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 ml-1" />
                  استيراد البيانات
                </Button>
                
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 ml-1" />
                    مسح جميع البيانات
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف جميع المهام والقوائم والإعدادات نهائياً. 
                      لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAllData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      نعم، احذف الكل
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>حول التطبيق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-center py-4">
              <h3 className="text-lg font-bold text-primary mb-2">مهمة</h3>
              <p className="text-sm text-muted-foreground mb-4">
                تطبيق إدارة المهام الذكي باللغة العربية
              </p>
              <div className="text-xs text-muted-foreground">
                الإصدار 1.0.0
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}