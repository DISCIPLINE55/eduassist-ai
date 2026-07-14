import { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Mail,
  BookOpen,
  Globe,
  ChevronRight,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  Smartphone,
  Camera,
  FileText,
  Zap,
  Cpu,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react-native";
import { useSession } from "@/ctx";
import { supabase } from "@/client/supabase";
import {
  getUserPreferences,
  upsertUserPreferences,
  getDocumentCounts,
  getMonthlyUsage,
} from "@/db/api";
import type { UserPreferences } from "@/types/types";
import { LANGUAGE_OPTIONS, DOCUMENT_TYPE_LABELS } from "@/types/types";
import { useTheme, type ThemePreference } from "@/lib/ThemeContext";

const PROFILE_BG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a5121273-68ba-43dd-ad84-354428853b48.jpg";

async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: mime, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

interface UsageStats {
  totalDocs: number;
  monthlyGenerations: number;
  monthlyTokens: number;
  topDocType: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { preference, setPreference, isDark } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultGrade, setDefaultGrade] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [stats, setStats] = useState<UsageStats>({
    totalDocs: 0,
    monthlyGenerations: 0,
    monthlyTokens: 0,
    topDocType: null,
  });

  const loadData = useCallback(async () => {
    if (!session?.user) return;
    try {
      const [prefsData, counts, usage] = await Promise.all([
        getUserPreferences(session.user.id),
        getDocumentCounts(),
        getMonthlyUsage(),
      ]);
      setPrefs(prefsData);
      setDisplayName(prefsData?.display_name ?? session.user.user_metadata?.display_name ?? "");
      setDefaultSubject(prefsData?.default_subject ?? "");
      setDefaultGrade(prefsData?.default_grade ?? "");
      setDefaultLanguage(prefsData?.default_language ?? "English");
      setAvatarUrl(prefsData?.avatar_url ?? null);

      const topType = Object.entries(usage.by_type).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      setStats({
        totalDocs: counts.total,
        monthlyGenerations: usage.total_generations,
        monthlyTokens: usage.total_tokens,
        topDocType: topType,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setSaveMsg("Photo library permission denied.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setAvatarUploading(true);
    setSaveMsg("");
    try {
      const url = await uploadAvatar(session!.user.id, result.assets[0].uri);
      setAvatarUrl(url);
      await upsertUserPreferences(session!.user.id, { avatar_url: url });
      setSaveMsg("Photo updated!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Upload failed — please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await upsertUserPreferences(session.user.id, {
        display_name: displayName.trim() || undefined,
        default_subject: defaultSubject.trim() || undefined,
        default_grade: defaultGrade || undefined,
        default_language: defaultLanguage,
      });
      setSaveMsg("Preferences saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  const email = session?.user?.email ?? "";
  const initials = (displayName || email).substring(0, 2).toUpperCase();
  const topLabel = stats.topDocType
    ? (DOCUMENT_TYPE_LABELS[stats.topDocType as keyof typeof DOCUMENT_TYPE_LABELS] ?? stats.topDocType)
    : "None yet";

  const statCards = [
    { label: "Documents", value: String(stats.totalDocs), icon: FileText, color: "#166534" },
    { label: "This Month", value: String(stats.monthlyGenerations), icon: Zap, color: "#7C3AED" },
    { label: "Tokens Used", value: stats.monthlyTokens > 999 ? `${(stats.monthlyTokens / 1000).toFixed(1)}k` : String(stats.monthlyTokens), icon: Cpu, color: "#0369A1" },
    { label: "Top Tool", value: topLabel.split(" ")[0], icon: Award, color: "#B45309" },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Hero with real image background */}
      <View style={{ height: 230 }}>
        <Image
          source={{ uri: PROFILE_BG }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(5,46,22,0.8)", "rgba(5,46,22,0.65)", "rgba(5,46,22,0.95)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="flex-1 px-6 pt-14 pb-6 items-center justify-end gap-3">
          {/* Avatar */}
          <Pressable
            className="relative active:opacity-80"
            onPress={handlePickAvatar}
            disabled={avatarUploading}
            accessibilityLabel="Change profile photo"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" }}
                contentFit="cover"
              />
            ) : (
              <View
                className="bg-white/20 items-center justify-center"
                style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" }}
              >
                <Text className="text-white text-2xl font-bold">{initials}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full items-center justify-center border-2 border-primary">
              {avatarUploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Camera size={13} color="#fff" />}
            </View>
          </Pressable>
          {/* Name + email */}
          <View className="items-center gap-0.5">
            <Text className="text-white text-xl font-bold">{displayName || "Teacher"}</Text>
            <Text className="text-white/65 text-sm">{email}</Text>
          </View>
          {/* Badge */}
          <View className="flex-row items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
            <Sparkles size={10} color="#FCD34D" />
            <Text className="text-white/90 text-xs font-semibold">Powered by Gemini 2.5</Text>
          </View>
        </View>
      </View>

      {/* Usage stats band */}
      <View className="bg-card border-b border-border px-4 py-4">
        <View className="flex-row items-center gap-2 mb-3">
          <TrendingUp size={14} color="#166534" />
          <Text className="text-sm font-semibold text-foreground">Your Activity</Text>
        </View>
        <View className="flex-row gap-2">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <View
              key={label}
              className="flex-1 bg-background rounded-2xl p-3 items-center gap-1 border border-border"
              style={{ borderCurve: "continuous" }}
            >
              <View className="w-8 h-8 rounded-full items-center justify-center mb-0.5" style={{ backgroundColor: `${color}18` }}>
                <Icon size={15} color={color} />
              </View>
              <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{value}</Text>
              <Text className="text-xs text-muted-foreground text-center" numberOfLines={1}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-5 pb-12 gap-5"
      >
        {/* Account info */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
            <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <User size={15} color="#166534" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1">Display Name</Text>
                <TextInput
                  className="text-sm text-foreground"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row items-center gap-3 px-4 py-4">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Mail size={15} color="#166534" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-0.5">Email</Text>
                <Text className="text-sm text-foreground">{email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Teaching Preferences */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Teaching Preferences
          </Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
            <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <BookOpen size={15} color="#166534" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1">Default Subject</Text>
                <TextInput
                  className="text-sm text-foreground"
                  value={defaultSubject}
                  onChangeText={setDefaultSubject}
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <GraduationCap size={15} color="#166534" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1">Default Grade</Text>
                <TextInput
                  className="text-sm text-foreground"
                  value={defaultGrade}
                  onChangeText={setDefaultGrade}
                  placeholder="e.g. Grade 8"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row items-center gap-3 px-4 py-4">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Globe size={15} color="#166534" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground mb-1.5">Default Language</Text>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <Pressable
                      key={lang}
                      className="px-3 py-1 rounded-full active:opacity-70 border"
                      style={{
                        backgroundColor: defaultLanguage === lang ? "#166534" : "transparent",
                        borderColor: defaultLanguage === lang ? "#166534" : "#E5E7EB",
                      }}
                      onPress={() => setDefaultLanguage(lang)}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: defaultLanguage === lang ? "#fff" : "#6B7280" }}
                      >
                        {lang}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Save message */}
        {saveMsg ? (
          <View
            className={`rounded-xl px-4 py-3 ${saveMsg.includes("saved") || saveMsg.includes("updated") ? "bg-primary/10" : "bg-destructive/10"}`}
            style={{ borderCurve: "continuous" }}
          >
            <Text className={`text-sm text-center font-medium ${saveMsg.includes("saved") || saveMsg.includes("updated") ? "text-primary" : "text-destructive"}`}>
              {saveMsg}
            </Text>
          </View>
        ) : null}

        {/* Save button */}
        <Pressable
          className="bg-primary rounded-xl py-4 items-center active:opacity-80"
          style={{ borderCurve: "continuous" }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-primary-foreground font-semibold text-base">Save Preferences</Text>
          }
        </Pressable>

        {/* Appearance */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: "continuous" }}>
            {(
              [
                { key: "light" as ThemePreference, label: "Light", Icon: Sun },
                { key: "system" as ThemePreference, label: "System default", Icon: Smartphone },
                { key: "dark" as ThemePreference, label: "Dark", Icon: Moon },
              ] as const
            ).map(({ key, label, Icon }, idx, arr) => {
              const isActive = preference === key;
              return (
                <Pressable
                  key={key}
                  className={`flex-row items-center gap-3 px-4 py-4 active:opacity-70 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                  onPress={() => setPreference(key)}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${isActive ? "bg-primary" : "bg-secondary"}`}>
                    <Icon size={16} color={isActive ? "#fff" : "#166534"} />
                  </View>
                  <Text className={`flex-1 text-sm ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </Text>
                  {isActive ? (
                    <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </View>
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sign Out */}
        <Pressable
          className="flex-row items-center gap-3 bg-card border border-border rounded-2xl px-4 py-4 active:opacity-75"
          style={{ borderCurve: "continuous" }}
          onPress={handleSignOut}
        >
          <View className="w-8 h-8 rounded-full bg-destructive/10 items-center justify-center">
            <LogOut size={15} color="#DC2626" />
          </View>
          <Text className="flex-1 text-sm font-semibold text-destructive">Sign Out</Text>
          <ChevronRight size={16} color="#DC2626" />
        </Pressable>

        <Text className="text-center text-xs text-muted-foreground">EduAssist AI v1.0 · Powered by Gemini 2.5</Text>
      </ScrollView>
    </View>
  );
}
