import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Ваша IP (залиште ту, яка працює)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.23.168.1:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Content-Type тут буде змінено Axios'ом на multipart/form-data
    // коли ми надсилаємо FormData для постів/реєстрації
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  dorm_number: number;
  // 👇 ДОДАНО: Поле для URL зображення з бекенду
  image_url?: string; 
}

// ВХІД
export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/api/auth/login/', { 
    username: username, 
    password 
  });
  return response.data;
};

// РЕЄСТРАЦІЯ
export const registerUser = async (name: string, password: string) => {
  
  const response = await api.post('/api/auth/register/', { 
    username: name,
    password: password,
    dorm_number: 0, // Заглушка
    photo: null     // Заглушка
  });
  
  return response.data;
};

// ОТРИМАННЯ СПИСКУ ПОСТІВ
export const getPosts = async () => {
  const response = await api.get<Post[]>('/api/posts/'); 
  return response.data;
};

// ОТРИМАННЯ ДЕТАЛЕЙ ПОСТА ПО ID
export const getPostDetail = async (id: number) => {
  const response = await api.get<Post[]>(`/api/posts/${id}/`); 
  
  // Бекенд повертає масив, тому беремо перший елемент
  return response.data[0]; 
};


// СТВОРЕННЯ ПОСТА
// 👇 ДОДАНО: Можливість передавати image_uri для завантаження
export const createPost = async (title: string, content: string, imageUri?: string) => {
    
    // Якщо немає зображення, відправляємо простий JSON
    if (!imageUri) {
        const response = await api.post('/api/posts/', { title, content });
        return response.data;
    }

    // Якщо є зображення, використовуємо FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore: TypeScript не знає про API File/Blob у React Native FormData
    formData.append('image', { uri: imageUri, name: filename, type });

    // Відправляємо FormData з відповідним заголовком
    const response = await api.post('/api/posts/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};