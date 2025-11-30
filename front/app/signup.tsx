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
import { registerUser } from "./api"; // Імпортуємо функцію реєстрації
import { useTheme } from "./theme-context";

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // 1. Валідація
    if (!name || !email || !password) {
      Alert.alert("Помилка", "Будь ласка, заповніть всі поля");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      console.log("Реєстрація:", email);
      
      // 2. Виклик API
      const response = await registerUser(name, email, password);
      console.log("Успішна реєстрація:", response);

      Alert.alert("Успіх", "Акаунт створено! Тепер увійдіть.");
      
      // 3. Перекидаємо на сторінку входу
      router.replace("/auth"); 

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Помилка при реєстрації";
      // Якщо Django повертає помилки полів (наприклад, email зайнятий)
      Alert.alert("Помилка", JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Реєстрація</Text>

            <View style={{ gap: 16 }}>
              {/* Input: Name */}
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
                placeholder="Ім'я"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />

              {/* Input: Email */}
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Input: Password */}
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
                placeholder="Пароль"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleSignUp}
                disabled={loading}
              >
                 {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={{ marginTop: 16, alignItems: 'center' }} 
              onPress={() => router.push("/auth")} // Або router.back()
            >
               <Text style={{ color: "#6B7280" }}>Вже є акаунт? Увійти</Text>
            </TouchableOpacity>
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
  input: { borderWidth: 1, borderRadius: 6, padding: 12, fontSize: 16 },
  button: { 
    backgroundColor: "#3B82F6", 
    borderRadius: 6, 
    paddingVertical: 12, 
    marginTop: 8, 
    alignItems: "center",
    height: 50,
    justifyContent: 'center'
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 }
});