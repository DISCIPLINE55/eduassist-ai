import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { supabase } from "@/client/supabase";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  isDark: boolean;
  /** Call with userId after sign-in to pull cloud preference and enable cloud sync */
  initWithUser: (userId: string) => Promise<void>;
  /** Call on sign-out to stop cloud sync */
  clearUser: () => void;
  setPreference: (pref: ThemePreference) => Promise<void>;
  /** Quick toggle: cycles light → dark → light (ignores system) */
  toggleDark: () => Promise<void>;
}

const STORAGE_KEY = "@eduassist/theme";

const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  isDark: false,
  initWithUser: async () => {},
  clearUser: () => {},
  setPreference: async () => {},
  toggleDark: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const systemScheme = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const userIdRef = useRef<string | null>(null);

  const isDark =
    preference === "dark" ||
    (preference === "system" && systemScheme === "dark");

  // Apply to NativeWind whenever preference changes
  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  // Load from AsyncStorage on mount (fast, before cloud)
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setPreferenceState(saved);
          setColorScheme(saved);
        }
      } catch {
        // fall back to system
      }
    })();
  }, [setColorScheme]);

  const applyAndPersist = useCallback(
    async (pref: ThemePreference) => {
      setPreferenceState(pref);
      setColorScheme(pref);
      // Local persistence
      try { await AsyncStorage.setItem(STORAGE_KEY, pref); } catch { /* ignore */ }
      // Cloud sync — fire-and-forget, never block the UI
      if (userIdRef.current) {
        void supabase
          .from("user_preferences")
          .upsert({ user_id: userIdRef.current, theme: pref }, { onConflict: "user_id" });
      }
    },
    [setColorScheme],
  );

  const initWithUser = useCallback(
    async (userId: string) => {
      userIdRef.current = userId;
      // Pull cloud preference — it wins over local cache
      try {
        const { data } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", userId)
          .maybeSingle();
        const cloudTheme = data?.theme as ThemePreference | undefined;
        if (cloudTheme === "light" || cloudTheme === "dark" || cloudTheme === "system") {
          setPreferenceState(cloudTheme);
          setColorScheme(cloudTheme);
          await AsyncStorage.setItem(STORAGE_KEY, cloudTheme).catch(() => {});
        }
      } catch {
        // stay with locally cached value
      }
    },
    [setColorScheme],
  );

  const clearUser = useCallback(() => {
    userIdRef.current = null;
  }, []);

  const setPreference = useCallback(
    (pref: ThemePreference) => applyAndPersist(pref),
    [applyAndPersist],
  );

  const toggleDark = useCallback(async () => {
    const next = isDark ? "light" : "dark";
    await applyAndPersist(next);
  }, [isDark, applyAndPersist]);

  return (
    <ThemeContext.Provider value={{ preference, isDark, initWithUser, clearUser, setPreference, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
