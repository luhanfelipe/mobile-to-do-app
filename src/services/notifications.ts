import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const ensureNotificationPermissions = async () => {
  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
};

export const cancelNotification = async (notificationId?: string | null) => {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore cancellation errors for stale IDs.
  }
};

export const syncTaskNotification = async ({
  previousNotificationId,
  title,
  dueDateTime,
  completed,
}: {
  previousNotificationId?: string | null;
  title: string;
  dueDateTime?: string | null;
  completed: boolean;
}): Promise<string | null> => {
  await cancelNotification(previousNotificationId);

  if (completed || !dueDateTime) {
    return null;
  }

  const due = new Date(dueDateTime);
  if (Number.isNaN(due.getTime()) || due <= new Date()) {
    return null;
  }

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task reminder',
      body: `Task reminder: ${title}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: due,
    },
  });
};
