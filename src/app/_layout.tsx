import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { RouteGuard } from "@/components/route-guard";
import { AuthProvider } from "@/contexts/auth-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />

        <RouteGuard>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            <Stack.Screen name="login" options={{ headerShown: false }} />

            <Stack.Screen name="register" options={{ headerShown: false }} />

            <Stack.Screen
              name="onboarding"
              options={{
                title: "Complete Your Profile",
                headerBackVisible: false,
              }}
            />

            <Stack.Screen
              name="my-study-intents"
              options={{
                title: "My Study Intents",
              }}
            />

            <Stack.Screen
              name="create-study-intent"
              options={{
                title: "Create Study Intent",
              }}
            />
          </Stack>
        </RouteGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
