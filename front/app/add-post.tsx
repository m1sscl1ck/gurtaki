import * as ImagePicker from 'expo-image-picker'; // Бібліотека для фото
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { api } from './api';
import { useTheme } from './theme-context';

export default function AddPost() {
  const router = useRouter();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null); // Стан для картинки
  const [loading, setLoading] = useState(false);

  // 1. Функція вибору фото
  const pickImage = async () => {
    // Запитуємо дозвіл
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Увага', 'Потрібен дозвіл на доступ до галереї!');
      return;
    }

    // Відкриваємо галерею
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Можна обрізати фото
      aspect: [4, 3],
      quality: 0.8, // Стискаємо трохи, щоб швидше вантажилось
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Помилка', 'Заповніть заголовок і текст');
      return;
    }

    setLoading(true);
    try {
      // 2. Створюємо FormData (спеціальний формат для файлів)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      if (image) {
        // Додаємо картинку. В React Native це виглядає саме так:
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore (TypeScript іноді свариться на формат файлу в RN, це ок)
        formData.append('image', { uri: image, name: filename, type });
      }

      // ⚠️ Важливо: axios сам поставить заголовок 'multipart/form-data'
      await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Успіх', 'Оголошення додано!');
      router.replace('/'); 
    } catch (error: any) {
      console.error(error);
      Alert.alert('Помилка', 'Не вдалося завантажити пост');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>Скасувати</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Новий пост</Text>
            <View style={{ width: 60 }} /> 
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Заголовок</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
              placeholder="Назва товару"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: colors.text }]}>Опис</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
              placeholder="Деталі..."
              placeholderTextColor="#888"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Кнопка додавання фото */}
            <Text style={[styles.label, { color: colors.text }]}>Фото</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>📷 Обрати фото</Text>
            </TouchableOpacity>

            {/* Прев'ю картинки */}
            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Опублікувати</Text>}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  backButton: { color: '#3B82F6', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, height: 100 },
  
  imageButton: { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  imageButtonText: { color: '#333', fontWeight: '600' },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 16, resizeMode: 'cover' },

  submitButton: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});2