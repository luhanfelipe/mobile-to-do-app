import * as SQLite from 'expo-sqlite';
import { Category, Task, TaskWithCategory } from '../types';

const db = SQLite.openDatabaseSync('todo.db');

const mapTaskRow = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  completed: row.completed === 1,
  dueDateTime: row.dueDateTime,
  createdAt: row.createdAt,
  categoryId: row.categoryId,
  notificationId: row.notificationId,
});

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      dueDateTime TEXT,
      createdAt TEXT NOT NULL,
      categoryId INTEGER,
      notificationId TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);
};

export const getTasks = async (): Promise<TaskWithCategory[]> => {
  const rows = await db.getAllAsync<any>(`
    SELECT t.*, c.name as categoryName
    FROM tasks t
    LEFT JOIN categories c ON c.id = t.categoryId
    ORDER BY t.completed ASC, t.createdAt DESC
  `);

  return rows.map((row) => ({ ...mapTaskRow(row), categoryName: row.categoryName }));
};

export const getTaskById = async (id: number): Promise<Task | null> => {
  const row = await db.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
  return row ? mapTaskRow(row) : null;
};

export const createTask = async (task: Omit<Task, 'id'>): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO tasks (title, description, completed, dueDateTime, createdAt, categoryId, notificationId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.dueDateTime,
      task.createdAt,
      task.categoryId,
      task.notificationId,
    ]
  );

  return result.lastInsertRowId;
};

export const updateTask = async (id: number, task: Omit<Task, 'id'>) => {
  await db.runAsync(
    `UPDATE tasks
     SET title = ?, description = ?, completed = ?, dueDateTime = ?, categoryId = ?, notificationId = ?
     WHERE id = ?`,
    [
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.dueDateTime,
      task.categoryId,
      task.notificationId,
      id,
    ]
  );
};

export const deleteTask = async (id: number) => {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};

export const getCategories = async (): Promise<Category[]> => {
  return await db.getAllAsync<Category>('SELECT id, name FROM categories ORDER BY name ASC');
};

export const createCategory = async (name: string): Promise<number> => {
  const result = await db.runAsync('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
  return result.lastInsertRowId;
};

export const renameCategory = async (id: number, name: string) => {
  await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id]);
};

export const deleteCategory = async (id: number) => {
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};
