import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { getPosts, Post } from "../../api/api"; 
import { useTheme } from '../theme-context'; // 👈 ІМПОРТ ТЕМИ

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // 👇 ВИПРАВЛЕНО: Використовуємо 'setTheme'
  const { theme, colors, setTheme } = useTheme(); 

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      if (Array.isArray(data)) {
        setPosts(data.reverse()); 
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.log("Помилка:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace("/auth");
        } else {
          fetchPosts();
        }
      };
      checkAuth();
    }, [router])
  );

  // 👇 ФУНКЦІЯ ПЕРЕМИКАННЯ ТЕМИ
  const handleToggleTheme = () => {
    // Встановлює протилежну тему, використовуючи setTheme
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View 
      style={[
        styles.postRow, 
        // Фон рядка оголошення
        { backgroundColor: theme === 'dark' ? colors.primary : colors.background, padding: 10, borderRadius: 12 }
      ]}
    > 
      
      {/* ВІДОБРАЖЕННЯ ФОТО АБО ЗАГЛУШКИ */}
      {item.image_url ? (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.postImagePlaceholder}
        />
      ) : (
        // Використовуємо колір акценту/card для заглушки в темній темі
        <View style={[styles.postImagePlaceholder, { backgroundColor: theme === 'dark' ? colors.card : '#004E8C' }]} /> 
      )}
      
      {/* Текст справа */}
      <View style={styles.postTextContainer}>
        <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.postDescription, { color: colors.secondaryText }]} numberOfLines={2}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Зміна кольору статус-бару */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* ШАПКА - колір primary */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        {/* Іконка профілю */}
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person-circle-outline" size={40} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Оголошення</Text>
        
        {/* КНОПКА ПЕРЕМИКАННЯ ТЕМИ */}
        <TouchableOpacity onPress={handleToggleTheme} style={styles.themeButton}>
           <Ionicons 
             name={theme === 'dark' ? 'moon' : 'sunny'} 
             size={26} 
             color={colors.text} 
           />
           <Text style={{ color: colors.text, fontSize: 16 }}>{theme === 'dark' ? 'Світла' : 'Темна'}</Text>
        </TouchableOpacity>
      </View>

      {/* СПИСОК */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchPosts(); }} 
              tintColor={colors.text} // Колір спінера
            />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Тут поки пусто.</Text>
          }
        />
      )}
      
      {/* КНОПКА ДОДАТИ (+) - Використовуємо акцентний колір card */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.card }]} 
        onPress={() => router.push("/add-post")}
      >
        <Ionicons name="add" size={32} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    // Колір фону динамічний
  },
  
  // Шапка
  header: {
    // Колір шапки динамічний
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    // Колір тексту динамічний
    textTransform: 'uppercase'
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  listContent: { 
    padding: 20 
  },

  // Рядок поста
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // Фон рядка динамічний
  },
  // Синій квадрат
  postImagePlaceholder: {
    width: 80,
    height: 80,
    // Колір заглушки динамічний
    borderRadius: 12,
    marginRight: 15,
    resizeMode: 'cover',
  },
  postTextContainer: {
    flex: 1,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // Колір тексту динамічний
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    // Колір тексту динамічний
  },

  emptyText: { 
    textAlign: 'center', 
    // Колір тексту динамічний
    marginTop: 50, 
    fontSize: 16 
  },

  // Кнопка "+"
  fab: {
    position: 'absolute', 
    right: 20, 
    bottom: 30,
    width: 60, 
    height: 60, 
    borderRadius: 30,
    // Колір кнопки динамічний
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8, 
    shadowColor: "#000", 
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
});