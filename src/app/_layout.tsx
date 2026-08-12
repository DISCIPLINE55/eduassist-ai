import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider, useSession } from "@/ctx";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/lib/ThemeContext";
import "../global.css";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

function RootLayoutNav() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

const RootLayout: React.FC = () => {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SessionProvider>
            <RootLayoutNav />
            <PortalHost />
          </SessionProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
};

export default Sentry.wrap(RootLayout);
