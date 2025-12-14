import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground
} from 'react-native';

import { api } from '../api/api'; 

export default function AddPost() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Увага', 'Потрібен дозвіл на доступ до галереї!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [4, 3],
      quality: 0.8, 
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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append('image', { uri: image, name: filename, type });
      }

      await api.post('/api/posts/', formData, {
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
    <ImageBackground 
      source={require('../assets/images/background-pattern.png')} 
      style={{ flex: 1, backgroundColor: '#FDF5E6' }} 
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Нове оголошення</Text>
          </View>

          <View style={styles.card}>
            
            <Text style={styles.label}>Заголовок</Text>
            <TextInput
              style={styles.input}
              placeholder="Назва товару / події"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Опис</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Деталі..."
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>
                {image ? "✅ Фото обрано (змінити)" : "📸 Додати фото"}
              </Text>
            </TouchableOpacity>

            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#004E8C" /> : <Text style={styles.submitText}>Опублікувати</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 20, marginTop: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#004E8C', textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  card: { backgroundColor: '#004E8C', borderRadius: 20, padding: 25, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#3B82F6', borderRadius: 10, padding: 12, fontSize: 16, color: 'black', fontWeight: '500' },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageButton: { marginTop: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderStyle: 'dashed' },
  imageButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginTop: 16, resizeMode: 'cover', borderWidth: 2, borderColor: '#FFF' },
  submitButton: { backgroundColor: '#FDF5E6', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  submitText: { color: '#004E8C', fontWeight: 'bold', fontSize: 18 },
  cancelText: { color: '#FFF', textDecorationLine: 'underline', opacity: 0.8 }
});