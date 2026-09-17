export type Category = {
  id: number;
  name: string;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  dueDateTime: string | null;
  createdAt: string;
  categoryId: number | null;
  notificationId: string | null;
};

export type TaskWithCategory = Task & {
  categoryName: string | null;
};

export type TaskStatusFilter = 'all' | 'pending' | 'completed';
