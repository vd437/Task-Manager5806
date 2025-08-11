import { Button } from "@/components/ui/button";
import { Home, List, BarChart3, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'الرئيسية',
      isActive: location.pathname === '/'
    },
    { 
      path: '/categories', 
      icon: List, 
      label: 'القوائم',
      isActive: location.pathname === '/categories'
    },
    { 
      path: '/statistics', 
      icon: BarChart3, 
      label: 'الإحصائيات',
      isActive: location.pathname === '/statistics'
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'الإعدادات',
      isActive: location.pathname === '/settings'
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label, isActive }) => (
          <Button
            key={path}
            variant="ghost"
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-all duration-200",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 transition-transform duration-200",
              isActive && "scale-110"
            )} />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}