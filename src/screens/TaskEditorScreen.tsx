import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../App';
import {
  createTask,
  deleteTask,
  getCategories,
  getTaskById,
  updateTask,
} from '../services/database';
import { cancelNotification, syncTaskNotification } from '../services/notifications';
import { Category, Task } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskEditor'>;

export const TaskEditorScreen = ({ navigation, route }: Props) => {
  const taskId = route.params?.taskId;
  const isEditing = Boolean(taskId);

  const [task, setTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showInlinePicker, setShowInlinePicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);

      if (!taskId) {
        return;
      }

      const loadedTask = await getTaskById(taskId);
      if (!loadedTask) {
        Alert.alert('Error', 'Task not found.');
        navigation.goBack();
        return;
      }

      setTask(loadedTask);
      setTitle(loadedTask.title);
      setDescription(loadedTask.description ?? '');
      setCompleted(loadedTask.completed);
      setCategoryId(loadedTask.categoryId);
      setDueDate(loadedTask.dueDateTime ? new Date(loadedTask.dueDateTime) : null);
    };

    void loadData();
  }, [navigation, taskId]);

  const updateDueDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowInlinePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    setDueDate(selectedDate);
  };

  const openPicker = (mode: 'date' | 'time') => {
    const currentDate = dueDate ?? new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode,
        is24Hour: true,
        onChange: (_, selected) => {
          if (!selected) {
            return;
          }

          const base = dueDate ?? new Date();
          const next = new Date(base);

          if (mode === 'date') {
            next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
          } else {
            next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
          }

          setDueDate(next);
        },
      });
      return;
    }

    setShowInlinePicker(true);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation error', 'Task title is required.');
      return;
    }

    const dueDateTime = dueDate ? dueDate.toISOString() : null;

    try {
      const notificationId = await syncTaskNotification({
        previousNotificationId: task?.notificationId,
        title: title.trim(),
        dueDateTime,
        completed,
      });

      if (isEditing && taskId && task) {
        await updateTask(taskId, {
          ...task,
          title: title.trim(),
          description: description.trim() || null,
          completed,
          dueDateTime,
          categoryId,
          notificationId,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || null,
          completed,
          dueDateTime,
          createdAt: new Date().toISOString(),
          categoryId,
          notificationId,
        });
      }

      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save the task.');
    }
  };

  const onDelete = () => {
    if (!taskId || !task) {
      return;
    }

    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelNotification(task.notificationId);
            await deleteTask(taskId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Could not delete task.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task title" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Task description"
          multiline
        />

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Completed</Text>
          <Switch value={completed} onValueChange={setCompleted} />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categoryId ?? 'none'}
            onValueChange={(value) => setCategoryId(value === 'none' ? null : value)}
          >
            <Picker.Item label="No category" value="none" />
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.name} value={category.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Due date/time (optional)</Text>
        <Text style={styles.metaText}>{dueDate ? dueDate.toLocaleString() : 'No due date selected'}</Text>
        <View style={styles.rowButtons}>
          <Pressable style={styles.secondaryButton} onPress={() => openPicker('date')}>
            <Text style={styles.secondaryButtonText}>Set Date</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => openPicker('time')}>
            <Text style={styles.secondaryButtonText}>Set Time</Text>
          </Pressable>
          <Pressable style={styles.tertiaryButton} onPress={() => setDueDate(null)}>
            <Text style={styles.tertiaryButtonText}>Clear</Text>
          </Pressable>
        </View>

        {Platform.OS === 'ios' && showInlinePicker && (
          <DateTimePicker value={dueDate ?? new Date()} mode="datetime" onChange={updateDueDate} />
        )}

        <View style={styles.rowButtons}>
          <Pressable style={styles.primaryButton} onPress={() => void onSave()}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
          <Pressable style={styles.tertiaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.tertiaryButtonText}>Cancel</Text>
          </Pressable>
          {isEditing && (
            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  label: { fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  metaText: { color: '#444' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: '#4f46e5', fontWeight: '700' },
  tertiaryButton: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tertiaryButtonText: { color: '#444', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
});
