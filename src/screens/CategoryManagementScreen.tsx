import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createCategory,
  deleteCategory,
  getCategories,
  renameCategory,
} from '../services/database';
import { Category } from '../types';

export const CategoryManagementScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renameDrafts, setRenameDrafts] = useState<Record<number, string>>({});

  const loadCategories = useCallback(async () => {
    const loaded = await getCategories();
    setCategories(loaded);
    setRenameDrafts(
      loaded.reduce<Record<number, string>>((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {})
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories])
  );

  const onCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert('Validation error', 'Category name is required.');
      return;
    }

    try {
      await createCategory(name);
      setNewCategoryName('');
      await loadCategories();
    } catch {
      Alert.alert('Error', 'Could not create category. Name must be unique.');
    }
  };

  const onRenameCategory = async (category: Category) => {
    const nextName = (renameDrafts[category.id] ?? '').trim();
    if (!nextName) {
      Alert.alert('Validation error', 'Category name is required.');
      return;
    }

    try {
      await renameCategory(category.id, nextName);
      await loadCategories();
    } catch {
      Alert.alert('Error', 'Could not rename category. Name must be unique.');
    }
  };

  const onDeleteCategory = (category: Category) => {
    Alert.alert(
      'Delete category',
      `Delete "${category.name}"? Tasks that use it will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              await loadCategories();
            } catch {
              Alert.alert('Error', 'Could not delete category.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Category Management</Text>
      <Text style={styles.infoText}>
        Deleting a category sets linked tasks to uncategorized.
      </Text>

      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="New category"
        />
        <Pressable style={styles.primaryButton} onPress={() => void onCreateCategory()}>
          <Text style={styles.primaryButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No categories yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <TextInput
              style={styles.input}
              value={renameDrafts[item.id] ?? ''}
              onChangeText={(value) =>
                setRenameDrafts((prev) => ({
                  ...prev,
                  [item.id]: value,
                }))
              }
            />
            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={() => void onRenameCategory(item)}>
                <Text style={styles.secondaryButtonText}>Rename</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => onDeleteCategory(item)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  infoText: { color: '#444' },
  createRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  categoryItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  actionsRow: { flexDirection: 'row', gap: 8 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  secondaryButtonText: { color: '#4f46e5', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
});
