import { Stack } from "expo-router";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeProvider, useTheme } from "./theme-context"; 

function LayoutContent() {
  const { theme, colors, setTheme } = useTheme();

  const handleToggle = () => {
    console.log("----- КНОПКУ НАТИСНУТО! -----");
    // Логіка перемикання: викликаємо setTheme з протилежною темою
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === "light" ? "dark-content" : "light-content"} />

      {/* Кнопка перемикання теми (додано для тестування) */}
      <SafeAreaView style={styles.safeArea}>
        {/* 👇 ВИКЛИКАЄМО ВИПРАВЛЕНУ ФУНКЦІЮ handleToggle */}
        <TouchableOpacity onPress={handleToggle} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>
            {theme === "light" ? "🌙 Темна" : "☀️ Світла"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ГОЛОВНИЙ STACK */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  // 👇 ThemeProvider коректно обгортає LayoutContent
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    // Зміни в стилях safeArea можуть бути необхідні для коректного відображення кнопки
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  themeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10000,
  },
  themeButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  }
});