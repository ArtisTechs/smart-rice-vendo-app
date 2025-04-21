import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />{" "}
        {/* ✅ add this */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
