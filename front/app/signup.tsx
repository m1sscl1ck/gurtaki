import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ImageBackground, 
  ScrollView
} from "react-native";
import { registerUser } from "../api/api"; 

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleRegister = async () => {
    if (!name || !password) { Alert.alert("Увага", "Введіть ім'я та пароль!"); return; }
    setLoading(true);
    Keyboard.dismiss(); 
    try {
      await registerUser(name, password);
      Alert.alert("Успіх!", "Акаунт створено. Очікуйте активації адміністратором.", [{ text: "ОК", onPress: () => router.back() }]);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.detail || "Помилка реєстрації.";
      Alert.alert("Помилка", typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  return (
   <ImageBackground 
  source={require('../assets/images/background-pattern.png')} 
  style={{ flex: 1, width: '100%', height: '100%' }} // Можна і так, через відсотки
  resizeMode="cover"
>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.mainTitle}>Реєстрація</Text>
            <View style={styles.card}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: 20 }}>
                  <TextInput style={styles.input} placeholder="Придумайте Логін" placeholderTextColor="rgba(0, 0, 0, 0.5)" value={name} onChangeText={setName} />
                  <TextInput style={styles.input} placeholder="Пароль" placeholderTextColor="rgba(0, 0, 0, 0.5)" value={password} onChangeText={setPassword} secureTextEntry />
                  <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#004E8C" /> : <Text style={styles.registerButtonText}>Створити акаунт</Text>}
                  </TouchableOpacity>
                </View>
                <View style={styles.loginLinkContainer}>
                  <TouchableOpacity onPress={() => router.back()}><Text style={styles.loginLinkText}>Вже є профіль, увійти</Text></TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  mainTitle: { fontSize: 36, fontWeight: "bold", color: "#004E8C", marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  card: { backgroundColor: "#004E8C", borderRadius: 20, padding: 40, width: "100%", maxWidth: 350, elevation: 8 },
  input: { backgroundColor: "#3B82F6", borderRadius: 10, padding: 12, fontSize: 16, color: "black", fontWeight: "500" },
  registerButton: { backgroundColor: "#FDF5E6", borderRadius: 10, padding: 15, alignItems: "center", marginTop: 10 },
  registerButtonText: { color: "#004E8C", fontWeight: "bold", fontSize: 20 },
  loginLinkContainer: { marginTop: 30, alignItems: "center" },
  loginLinkText: { color: "#FFF", fontWeight: "bold", fontSize: 16, textDecorationLine: 'underline' },
});