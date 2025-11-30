import { Stack } from "expo-router";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeProvider, useTheme } from "./theme-context";

function LayoutContent() {
  const { theme, toggleTheme, colors } = useTheme();

  const handlePress = () => {
    console.log("----- КНОПКУ НАТИСНУТО! -----"); // Цей текст має бути в консолі
    toggleTheme();
  };

  return (
    // Задаємо фон на рівні всього екрану
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === "light" ? "dark-content" : "light-content"} />

      {/* Кнопка перемикання теми */}
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={handlePress} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>
            {theme === "light" ? "🌙 Темна" : "☀️ Світла"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Тут рендеряться ваші сторінки */}
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' } // Прозорий, щоб було видно фон LayoutContent
        }} 
      />
    </View>
  );
}

export default function RootLayout() {
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
    zIndex: 9999, // Піднімаємо кнопку на самий верх
  },
  themeButton: {
    position: "absolute",
    top: 50, // Відступ зверху
    right: 20, // Відступ справа
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10000, // ГАРАНТІЯ, що кнопка поверх всього
  },
  themeButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  }
});