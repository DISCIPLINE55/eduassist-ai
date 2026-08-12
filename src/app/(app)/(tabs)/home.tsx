import { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  BookOpen,
  CalendarRange,
  FileText,
  CircleHelp,
  ClipboardList,
  ClipboardCheck,
  LayoutGrid,
  MessageSquare,
  Presentation,
  TrendingUp,
  Heart,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import { useSession } from "@/ctx";
import { getRecentDocuments, getDocumentCounts, getMonthlyUsage, getFavoriteDocuments } from "@/db/api";
import type { Document, DocumentType } from "@/types/types";
import { DOCUMENT_TYPE_LABELS } from "@/types/types";
import { useTheme } from "@/lib/ThemeContext";

const HERO_BG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a5121273-68ba-43dd-ad84-354428853b48.jpg";

const TOOL_ICONS: Record<DocumentType, React.ComponentType<{ size: number; color: string }>> = {
  lesson_plan: BookOpen,
  scheme_of_learning: CalendarRange,
  notes: FileText,
  quiz: CircleHelp,
  examination: ClipboardList,
  assignment: ClipboardCheck,
  rubric: LayoutGrid,
  report_comment: MessageSquare,
  presentation: Presentation,
};

const QUICK_TOOLS: { type: DocumentType; color: string; bg: string }[] = [
  { type: "lesson_plan", color: "#166534", bg: "#DCFCE7" },
  { type: "quiz", color: "#1D4ED8", bg: "#DBEAFE" },
  { type: "notes", color: "#7C3AED", bg: "#EDE9FE" },
  { type: "examination", color: "#B45309", bg: "#FEF3C7" },
];

const TYPE_COLORS: Record<DocumentType, string> = {
  lesson_plan: "#166534",
  scheme_of_learning: "#0369A1",
  notes: "#7C3AED",
  quiz: "#1D4ED8",
  examination: "#B45309",
  assignment: "#BE185D",
  rubric: "#0F766E",
  report_comment: "#6B21A8",
  presentation: "#DC2626",
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DocumentCard({ doc, onPress }: { doc: Document; onPress: () => void }) {
  const { isDark } = useTheme();
  const Icon = TOOL_ICONS[doc.type] ?? FileText;
  const color = TYPE_COLORS[doc.type] ?? "#166534";

  return (
    <Pressable
      className="bg-card border border-border rounded-2xl p-4 mr-3 active:opacity-75"
      style={{ width: 192, borderCurve: "continuous" }}
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: isDark ? `${color}22` : `${color}18` }}
      >
        <Icon size={20} color={color} />
      </View>
      <Text className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wide" numberOfLines={1}>
        {DOCUMENT_TYPE_LABELS[doc.type]}
      </Text>
      <Text className="text-sm font-bold text-foreground mb-1.5" numberOfLines={2}>
        {doc.title}
      </Text>
      {doc.subject ? (
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>{doc.subject}</Text>
      ) : null}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { isDark, toggleDark } = useTheme();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [favDocs, setFavDocs] = useState<Document[]>([]);
  const [counts, setCounts] = useState({ total: 0 });
  const [usage, setUsage] = useState({ total_generations: 0, total_tokens: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = session?.user?.user_metadata?.display_name
    || session?.user?.email?.split("@")[0]
    || "Teacher";

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [docs, favs, docCounts, monthUsage] = await Promise.all([
        getRecentDocuments(8),
        getFavoriteDocuments(10),
        getDocumentCounts(),
        getMonthlyUsage(),
      ]);
      setRecentDocs(docs);
      setFavDocs(favs);
      setCounts(docCounts);
      setUsage(monthUsage);
    } catch {
      // silently fail on dashboard
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  const goToGenerator = (type: DocumentType) => {
    router.push(`/(app)/generate/${type}` as RelativePathString);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#166534" />
        }
      >
        {/* ── Hero with image background ── */}
        <View style={{ height: 260 }}>
          <Image source={{ uri: HERO_BG }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
          <LinearGradient
            colors={["rgba(5,46,22,0.8)", "rgba(5,46,22,0.7)", "rgba(5,46,22,0.92)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="flex-1 px-5 pt-14 pb-5 justify-between">
            <View className="flex-row items-start justify-between">
              <View className="gap-0.5 flex-1 mr-3">
                <Text className="text-white/70 text-sm font-medium">{greeting()},</Text>
                <Text className="text-white text-2xl font-bold" numberOfLines={1}>{displayName} 👋</Text>
                <View className="flex-row items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 self-start mt-1.5">
                  <Sparkles size={10} color="#FCD34D" />
                  <Text className="text-xs font-semibold text-white/90">Gemini 2.5</Text>
                </View>
              </View>
              <Pressable
                className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center active:opacity-70"
                onPress={toggleDark}
              >
                {isDark ? <Sun size={18} color="#fff" /> : <Moon size={18} color="#fff" />}
              </Pressable>
            </View>

            {/* Stats row */}
            <View className="flex-row gap-2.5">
              {[
                { label: "Documents", value: counts.total, icon: TrendingUp },
                { label: "This month", value: usage.total_generations, icon: Zap },
                { label: "AI Tools", value: 9, icon: Sparkles },
              ].map(({ label, value, icon: Icon }) => (
                <View key={label} className="flex-1 bg-white/15 rounded-2xl p-3 gap-0.5" style={{ borderCurve: "continuous" }}>
                  <View className="flex-row items-center gap-1">
                    <Icon size={11} color="rgba(255,255,255,0.75)" />
                    <Text className="text-white text-lg font-bold">{value}</Text>
                  </View>
                  <Text className="text-white/65 text-xs font-medium">{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">Quick Generate</Text>
            <Pressable
              className="flex-row items-center gap-1 active:opacity-70"
              onPress={() => router.push("/(app)/(tabs)/tools" as RelativePathString)}
            >
              <Text className="text-xs text-primary font-semibold">All tools</Text>
              <ArrowRight size={13} color="#166534" />
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {QUICK_TOOLS.map(({ type, color, bg }) => {
              const Icon = TOOL_ICONS[type];
              return (
                <Pressable
                  key={type}
                  className="flex-row items-center gap-2.5 rounded-2xl px-4 py-3.5 active:opacity-75"
                  style={{ backgroundColor: isDark ? `${color}22` : bg, borderCurve: "continuous", minWidth: "46%" }}
                  onPress={() => goToGenerator(type)}
                >
                  <View className="w-7 h-7 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={15} color={color} />
                  </View>
                  <Text className="text-sm font-semibold flex-1" style={{ color }} numberOfLines={1}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Favorites ── */}
        {favDocs.length > 0 && (
          <View className="pt-6">
            <View className="px-5 flex-row items-center gap-2 mb-3">
              <Heart size={15} color="#DC2626" fill="#DC2626" />
              <Text className="text-base font-bold text-foreground">Favorites</Text>
            </View>
            <FlatList
              data={favDocs}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DocumentCard
                  doc={item}
                  onPress={() => router.push(`/(app)/document/${item.id}` as RelativePathString)}
                />
              )}
            />
          </View>
        )}

        {/* ── Recent Documents ── */}
        <View className="pt-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">Recent Documents</Text>
            <Pressable
              onPress={() => router.push("/(app)/(tabs)/library" as RelativePathString)}
              className="active:opacity-70"
            >
              <Text className="text-xs text-primary font-semibold">View All</Text>
            </Pressable>
          </View>

          {recentDocs.length === 0 ? (
            <View className="mx-5 bg-card border border-border rounded-2xl p-8 items-center gap-3" style={{ borderCurve: "continuous" }}>
              <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center" style={{ borderCurve: "continuous" }}>
                <Sparkles size={28} color="#166534" />
              </View>
              <Text className="text-base font-bold text-foreground">No documents yet</Text>
              <Text className="text-sm text-muted-foreground text-center leading-6">
                Use the AI Tools tab to generate your first professional teaching material.
              </Text>
              <Pressable
                className="bg-primary rounded-xl px-5 py-2.5 mt-1 flex-row items-center gap-2 active:opacity-80"
                onPress={() => router.push("/(app)/(tabs)/tools" as RelativePathString)}
              >
                <Zap size={14} color="#fff" />
                <Text className="text-primary-foreground text-sm font-bold">Start Generating</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={recentDocs}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DocumentCard
                  doc={item}
                  onPress={() => router.push(`/(app)/document/${item.id}` as RelativePathString)}
                />
              )}
            />
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

