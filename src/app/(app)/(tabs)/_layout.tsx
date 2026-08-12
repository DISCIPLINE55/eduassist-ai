import { Tabs } from "expo-router";
import { Home, Wrench, BookMarked, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/lib/ThemeContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor="transparent" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDark ? "#4ade80" : "#166534",
          tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
          tabBarStyle: {
            height: 62 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#262626" : "#E5E7EB",
            backgroundColor: isDark ? "#111111" : "#FFFFFF",
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: "AI Tools",
            tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
