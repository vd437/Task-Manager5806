export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sortBy: 'date' | 'priority' | 'manual';
  notifications: boolean;
}

const STORAGE_KEYS = {
  TASKS: 'mahamma_tasks',
  CATEGORIES: 'mahamma_categories',
  SETTINGS: 'mahamma_settings',
} as const;

// Local Storage Utilities
export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!stored) return [];
      return JSON.parse(stored).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch {
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tasks = storage.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tasks.push(newTask);
    storage.saveTasks(tasks);
    return newTask;
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
      storage.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTask: (id: string) => {
    const tasks = storage.getTasks();
    const filtered = tasks.filter(task => task.id !== id);
    storage.saveTasks(filtered);
  },

  // Categories
  getCategories: (): Category[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!stored) {
        // Default categories
        const defaultCategories: Category[] = [
          {
            id: '1',
            name: 'عام',
            color: 'blue',
            icon: 'List',
            createdAt: new Date(),
          },
          {
            id: '2',
            name: 'عمل',
            color: 'green',
            icon: 'Briefcase',
            createdAt: new Date(),
          },
          {
            id: '3',
            name: 'شخصي',
            color: 'purple',
            icon: 'User',
            createdAt: new Date(),
          },
        ];
        storage.saveCategories(defaultCategories);
        return defaultCategories;
      }
      return JSON.parse(stored).map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
      }));
    } catch {
      return [];
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => {
    const categories = storage.getCategories();
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    categories.push(newCategory);
    storage.saveCategories(categories);
    return newCategory;
  },

  deleteCategory: (id: string) => {
    const categories = storage.getCategories().filter(cat => cat.id !== id);
    storage.saveCategories(categories);
    
    // Move tasks from deleted category to default category
    const tasks = storage.getTasks();
    const updatedTasks = tasks.map(task => 
      task.category === id ? { ...task, category: '1' } : task
    );
    storage.saveTasks(updatedTasks);
  },

  // Settings
  getSettings: (): AppSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        const defaultSettings: AppSettings = {
          theme: 'system',
          sortBy: 'date',
          notifications: true,
        };
        storage.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(stored);
    } catch {
      return {
        theme: 'system',
        sortBy: 'date',
        notifications: true,
      };
    }
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};