import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, getTasks, updateTask } from '../services/database';
import { syncTaskNotification } from '../services/notifications';
import { Category, TaskStatusFilter, TaskWithCategory } from '../types';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

export const TaskListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | number>('all');

  const loadData = useCallback(async () => {
    const [loadedTasks, loadedCategories] = await Promise.all([getTasks(), getCategories()]);
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatches =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && task.completed) ||
        (statusFilter === 'pending' && !task.completed);

      const categoryMatches = categoryFilter === 'all' || task.categoryId === categoryFilter;

      return statusMatches && categoryMatches;
    });
  }, [tasks, statusFilter, categoryFilter]);

  const toggleTaskState = useCallback(
    async (task: TaskWithCategory) => {
      const completed = !task.completed;
      const notificationId = await syncTaskNotification({
        previousNotificationId: task.notificationId,
        title: task.title,
        dueDateTime: task.dueDateTime,
        completed,
      });

      await updateTask(task.id, {
        ...task,
        completed,
        notificationId,
      });

      await loadData();
    },
    [loadData]
  );

  const renderTask = ({ item }: { item: TaskWithCategory }) => (
    <Pressable
      onPress={() => navigation.navigate('TaskEditor', { taskId: item.id })}
      style={styles.taskItem}
    >
      <View style={styles.taskTextBlock}>
        <Text style={[styles.taskTitle, item.completed && styles.completedText]}>{item.title}</Text>
        <Text style={styles.taskMeta}>Status: {item.completed ? 'Completed' : 'Pending'}</Text>
        <Text style={styles.taskMeta}>Category: {item.categoryName ?? 'Uncategorized'}</Text>
        <Text style={styles.taskMeta}>
          Due: {item.dueDateTime ? new Date(item.dueDateTime).toLocaleString() : 'No due date'}
        </Text>
      </View>
      <Switch value={item.completed} onValueChange={() => void toggleTaskState(item)} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'completed'] as TaskStatusFilter[]).map((value) => (
          <Pressable
            key={value}
            style={[styles.filterButton, statusFilter === value && styles.filterButtonActive]}
            onPress={() => setStatusFilter(value)}
          >
            <Text style={styles.filterButtonText}>{value.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value)}
        >
          <Picker.Item label="All categories" value="all" />
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks found.</Text>}
      />

      <View style={styles.bottomButtons}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('TaskEditor', {})}
        >
          <Text style={styles.primaryButtonText}>New Task</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.secondaryButtonText}>Manage Categories</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterButton: {
    borderWidth: 1,
    borderColor: '#777',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterButtonText: { color: '#111', fontWeight: '600', fontSize: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  taskItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  taskTextBlock: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
  taskMeta: { color: '#444', fontSize: 12, marginTop: 2 },
  completedText: { textDecorationLine: 'line-through', color: '#666' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 24 },
  bottomButtons: { gap: 8, paddingVertical: 8 },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#4f46e5', fontWeight: '700' },
});
