import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install';

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey: string = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// On Web, navigator.locks contention causes "lock was stolen" warnings when
// multiple concurrent auth refresh requests race. Bypass the lock on Web
// since localStorage is synchronous and doesn't need it.
const isWeb = process.env.EXPO_OS === 'web'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noOpLock = <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    ...(isWeb && { lock: noOpLock }),
  },
})
