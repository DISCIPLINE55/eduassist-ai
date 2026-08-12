import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/client/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { ONBOARDING_KEY } from '@/app/(app)/onboarding';
import type { RelativePathString } from 'expo-router';

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const { initWithUser, clearUser } = useTheme();
  const router = useRouter();

  const checkAndShowOnboarding = async () => {
    try {
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!done) {
        router.replace('/(app)/onboarding' as RelativePathString);
      }
    } catch {
      // ignore — skip onboarding on error
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        void initWithUser(session.user.id);
        void checkAndShowOnboarding();
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        void initWithUser(session.user.id);
        // Only show onboarding on fresh sign-in, not on token refresh
        if (event === 'SIGNED_IN') {
          void checkAndShowOnboarding();
        }
      } else {
        clearUser();
      }
    });

    // iOS/Android background token refresh
    const appStateSubscription = AppState.addEventListener('change', async (nextState) => {
      if (Platform.OS !== 'web' && appState.current.match(/inactive|background/) && nextState === 'active') {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          await supabase.auth.signOut();
        }
      }
      appState.current = nextState;
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
