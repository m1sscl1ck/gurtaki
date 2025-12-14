import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace("/auth");
          return;
        }
        
        setUser({
          username: "Студент",
          dorm_number: "11",
          photo: null 
        });

      } catch (error) {
        console.log(error);
        Alert.alert("Помилка", "Не вдалося завантажити профіль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace("/auth");
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#004E8C" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/images/background-pattern.png')} 
      style={{ flex: 1, backgroundColor: '#FDF5E6' }} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 20 }]}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Мій Профіль</Text>
        </View>

        <View style={styles.card}>
          {/* Аватарка */}
          <View style={styles.avatarContainer}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() || "?"}</Text>
              </View>
            )}
          </View>

          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.info}>Гуртожиток № {user?.dorm_number}</Text>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Інфо", "Редагування скоро буде!")}>
            <Text style={styles.buttonText}>Редагувати</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, { color: '#FFF' }]}>Вийти</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={styles.backText}>Назад до стрічки</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  header: { marginBottom: 20 },
  headerTitle: { 
    fontSize: 32, fontWeight: 'bold', color: '#004E8C',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2
  },
  card: {
    backgroundColor: '#004E8C',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8
  },
  avatarContainer: { marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFF' },
  avatarPlaceholder: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#3B82F6', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' 
  },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  info: { fontSize: 18, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 20 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginBottom: 20 },
  
  button: {
    backgroundColor: '#FDF5E6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  logoutButton: { backgroundColor: '#FF4D4D' }, 
  buttonText: { color: '#004E8C', fontWeight: 'bold', fontSize: 16 },
  backText: { color: '#FFF', textDecorationLine: 'underline' }
});