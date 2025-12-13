import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground, // 👈 Переконайтеся, що імпортовано
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { loginUser, registerUser } from '../api/api'; 
import { useTheme } from './theme-context'; // 👈 ІМПОРТ ТЕМИ

export default function AuthScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme(); 

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Помилка', 'Заповніть усі поля.');
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        const response = await loginUser(username, password);
        await AsyncStorage.setItem('userToken', response.token);
        router.replace('/'); 
      } else {
        await registerUser(username, password);
        Alert.alert('Успіх', 'Акаунт створено! Увійдіть.');
        setIsLogin(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Помилка підключення.';
      Alert.alert('Помилка', errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // 👇 ДИНАМІЧНЕ ВИЗНАЧЕННЯ ДЖЕРЕЛА ЗОБРАЖЕННЯ
  const backgroundSource = theme === 'light'
    ? require('../assets/images/background-pattern.png')
    : require('../assets/images/dark-pattern.png'); // 👈 НОВИЙ ФАЙЛ

  return (
    <ImageBackground 
      source={backgroundSource} 
      style={[styles.container, { backgroundColor: colors.background }]} 
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Картка входу/реєстрації */}
          <View style={[styles.card, { backgroundColor: colors.primary }]}>

            {/* Заголовок */}
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isLogin ? 'Вхід' : 'Реєстрація'}
            </Text>

            {/* Поле Username */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Ім'я користувача"
              placeholderTextColor={colors.secondaryText}
              value={username}
              onChangeText={setUsername}
            />

            {/* Поле Password */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Пароль"
              placeholderTextColor={colors.secondaryText}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Кнопка дії */}
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.card }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.text} /> : (
                <Text style={[styles.submitText, { color: colors.text }]}>
                  {isLogin ? 'Увійти' : 'Зареєструватися'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Кнопка перемикання режиму */}
            <TouchableOpacity 
              onPress={switchMode} 
              style={styles.switchButton}
            >
              <Text style={[styles.switchText, { color: colors.secondaryText }]}>
                {isLogin ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  contentContainer: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: { 
    borderRadius: 20, 
    padding: 25, 
    width: '100%', 
    maxWidth: 400,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: { 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    fontWeight: '500',
    marginBottom: 15,
  },
  submitButton: { 
    borderRadius: 10, 
    padding: 16, 
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 
  },
  submitText: { 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  switchButton: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  switchText: { 
    textDecorationLine: 'underline', 
    opacity: 0.8 
  }
});