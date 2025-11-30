import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getPosts, Post } from "./api";
import { useTheme } from "./theme-context";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  // Функція завантаження
  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Помилка завантаження постів:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Перевірка авторизації + завантаження при старті
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace("/auth");
      } else {
        fetchPosts();
      }
    };
    checkAuthAndLoad();
  }, [router]); //

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace("/auth");
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
      <Text style={styles.postDate}>ID: {item.id}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Стрічка</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Вийти</Text>
        </TouchableOpacity>
      </View>

      {/* Список */}
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchPosts();
            }} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
              Постів поки немає. Створіть перший!
            </Text>
          }
        />
      )}
      
      {/* Кнопка "Додати пост"*/}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/add-post")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 50, 
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  logoutButton: { padding: 8 },
  logoutText: { color: '#ef4444', fontWeight: 'bold' }, 
  
  listContent: { padding: 16 },
  
  card: {
    borderRadius: 12, padding: 16, marginBottom: 16,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5
  },
  postTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  postContent: { fontSize: 14, lineHeight: 20 },
  postDate: { fontSize: 12, color: '#888', marginTop: 8 },

  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.3,
  },
  fabText: { color: 'white', fontSize: 30, marginTop: -4 }
});