import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CategoryManagementScreen } from './src/screens/CategoryManagementScreen';
import { TaskEditorScreen } from './src/screens/TaskEditorScreen';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { initDatabase } from './src/services/database';
import { ensureNotificationPermissions } from './src/services/notifications';

export type RootStackParamList = {
  TaskList: undefined;
  TaskEditor: { taskId?: number };
  Categories: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await ensureNotificationPermissions();
        setReady(true);
      } catch {
        setStartupError('Failed to initialize app services.');
      }
    };

    void initialize();
  }, []);

  if (startupError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{startupError}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
        <Stack.Screen
          name="TaskEditor"
          component={TaskEditorScreen}
          options={{ title: 'Task Editor' }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoryManagementScreen}
          options={{ title: 'Categories' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    fontWeight: '600',
  },
});
