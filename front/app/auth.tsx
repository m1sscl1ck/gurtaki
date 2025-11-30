import AsyncStorage from '@react-native-async-storage/async-storage'; // Імпорт для збереження токена
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { loginUser } from "./api";
import { useTheme } from "./theme-context";

export default function Auth() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Помилка", "Будь ласка, заповніть всі поля");
      return;
    }

    setLoading(true);
    Keyboard.dismiss(); 

    try {
      console.log("Відправляю запит на вхід...");
      const response = await loginUser(email, password);
      console.log("Відповідь сервера:", response);

      const token = response.access_token || response.token || response.key || response.access;

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        Alert.alert("Успіх", "Ви успішно увійшли!");
        
        router.replace("/"); 
      } else {
        Alert.alert("Помилка", "Сервер не повернув токен. Перевірте бекенд.");
      }
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.detail || "Помилка з'єднання або невірні дані";
      Alert.alert("Помилка входу", typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>єГуртaк</Text>
            <Text style={styles.subtitle}>Log In</Text>

            <View style={{ gap: 16 }}>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]} 
                placeholder="Email" 
                placeholderTextColor="#888"
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]} 
                placeholder="Password" 
                placeholderTextColor="#888"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
              
              {/* Активна кнопка з логікою завантаження */}
              <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>LOG IN</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 16, alignItems: "center", gap: 8 }}>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={{ color: "#6B7280" }}>На головну</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={{ color: "#3B82F6", fontWeight: "bold" }}>SIGNUP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, padding: 32, width: "85%", elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  subtitle: { textAlign: "center", color: "#93C5FD", marginBottom: 16, fontSize: 18, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, fontSize: 16 },
  button: { 
    backgroundColor: "#3B82F6", 
    borderRadius: 6, 
    paddingVertical: 12, 
    marginTop: 8, 
    alignItems: "center",
    height: 50, // Фіксована висота, щоб не стрибало при появі крутилки
    justifyContent: 'center'
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 }
});