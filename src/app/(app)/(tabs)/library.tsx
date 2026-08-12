import { useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Search,
  BookOpen,
  CalendarRange,
  FileText,
  CircleHelp,
  ClipboardList,
  ClipboardCheck,
  LayoutGrid,
  MessageSquare,
  Presentation,
  X,
  BookMarked,
  Archive,
  RotateCcw,
  Heart,
  Sparkles,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import { getDocuments, getArchivedDocuments, toggleFavorite, unarchiveDocument } from "@/db/api";
import type { Document, DocumentType } from "@/types/types";
import { DOCUMENT_TYPE_LABELS } from "@/types/types";
import { useTheme } from "@/lib/ThemeContext";

const LIBRARY_BG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5a21c456-f7c0-42f6-9b4d-e62794259ded.jpg";

const ICONS: Record<DocumentType, React.ComponentType<{ size: number; color: string }>> = {
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

const TYPE_COLORS: Record<DocumentType, { color: string; bg: string }> = {
  lesson_plan: { color: "#166534", bg: "#DCFCE7" },
  scheme_of_learning: { color: "#0369A1", bg: "#DBEAFE" },
  notes: { color: "#7C3AED", bg: "#EDE9FE" },
  quiz: { color: "#1D4ED8", bg: "#DBEAFE" },
  examination: { color: "#B45309", bg: "#FEF3C7" },
  assignment: { color: "#BE185D", bg: "#FCE7F3" },
  rubric: { color: "#0F766E", bg: "#CCFBF1" },
  report_comment: { color: "#6B21A8", bg: "#F3E8FF" },
  presentation: { color: "#DC2626", bg: "#FEE2E2" },
};

// All 9 types, no missing ones
const FILTERS: { label: string; type: DocumentType | null }[] = [
  { label: "All", type: null },
  { label: "Lesson Plans", type: "lesson_plan" },
  { label: "Quizzes", type: "quiz" },
  { label: "Notes", type: "notes" },
  { label: "Exams", type: "examination" },
  { label: "Assignments", type: "assignment" },
  { label: "Schemes", type: "scheme_of_learning" },
  { label: "Rubrics", type: "rubric" },
  { label: "Reports", type: "report_comment" },
  { label: "Slides", type: "presentation" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DocumentItem({
  doc,
  onPress,
  onToggleFavorite,
  archived,
  onUnarchive,
  isDark,
}: {
  doc: Document;
  onPress: () => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  archived?: boolean;
  onUnarchive?: (id: string) => void;
  isDark?: boolean;
}) {
  const Icon = ICONS[doc.type] ?? FileText;
  const { color, bg } = TYPE_COLORS[doc.type] ?? { color: "#166534", bg: "#DCFCE7" };

  return (
    <Pressable
      className="flex-row items-center gap-3 bg-card border border-border rounded-2xl p-4 active:opacity-75"
      style={{ borderCurve: "continuous" }}
      onPress={onPress}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isDark ? `${color}22` : bg, borderCurve: "continuous" }}
      >
        <Icon size={22} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{doc.title}</Text>
        <Text className="text-xs font-semibold text-muted-foreground">{DOCUMENT_TYPE_LABELS[doc.type]}</Text>
        {(doc.subject || doc.grade) ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {[doc.subject, doc.grade].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-2 flex-shrink-0">
        <Text className="text-xs text-muted-foreground">{timeAgo(doc.updated_at)}</Text>
        {archived ? (
          <Pressable className="p-1 active:opacity-60" onPress={() => onUnarchive?.(doc.id)}>
            <RotateCcw size={16} color="#0369A1" />
          </Pressable>
        ) : (
          <Pressable className="p-1 active:opacity-60" onPress={() => onToggleFavorite?.(doc.id, doc.is_favorite)}>
            <Heart
              size={16}
              color={doc.is_favorite ? "#DC2626" : "#9CA3AF"}
              fill={doc.is_favorite ? "#DC2626" : "transparent"}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [docs, setDocs] = useState<Document[]>([]);
  const [archivedDocs, setArchivedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<DocumentType | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const searchRef = useRef<TextInput>(null);

  // Debounce search: 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadDocs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [data, archived] = await Promise.all([
        getDocuments({
          type: activeFilter ?? undefined,
          isFavorite: favoritesOnly || undefined,
          search: debouncedSearch.trim() || undefined,
          limit: 50,
        }),
        getArchivedDocuments(),
      ]);
      setDocs(data);
      setArchivedDocs(archived);
    } catch {
      setDocs([]);
      setArchivedDocs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, favoritesOnly, debouncedSearch]);

  useFocusEffect(useCallback(() => { loadDocs(); }, [loadDocs]));

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await toggleFavorite(id, !current);
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, is_favorite: !current } : d));
  };

  const handleUnarchive = async (id: string) => {
    await unarchiveDocument(id);
    setArchivedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const navigateToDoc = (id: string) =>
    router.push(`/(app)/document/${id}` as RelativePathString);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Hero header with background image */}
      <View style={{ minHeight: 160 }}>
        <Image
          source={{ uri: LIBRARY_BG }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(5,46,22,0.82)", "rgba(5,46,22,0.68)", "rgba(5,46,22,0.96)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="px-5 pt-14 pb-4 gap-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Library</Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <Sparkles size={11} color="rgba(255,255,255,0.6)" />
                <Text className="text-xs text-white/60">{docs.length} document{docs.length !== 1 ? "s" : ""}</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
                style={{ backgroundColor: favoritesOnly ? "#D97706" : "rgba(255,255,255,0.2)" }}
                onPress={() => setFavoritesOnly((v) => !v)}
              >
                <Heart size={13} color="#fff" fill={favoritesOnly ? "#fff" : "transparent"} />
                <Text className="text-white text-xs font-semibold">Favorites</Text>
              </Pressable>
              <Pressable
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
                style={{ backgroundColor: showArchived ? "#6B7280" : "rgba(255,255,255,0.2)" }}
                onPress={() => setShowArchived((v) => !v)}
              >
                <Archive size={13} color="#fff" />
                <Text className="text-white text-xs font-semibold">Archived</Text>
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-white/20 rounded-2xl px-3 gap-2" style={{ borderCurve: "continuous" }}>
            <Search size={15} color="rgba(255,255,255,0.7)" />
            <TextInput
              ref={searchRef}
              className="flex-1 py-3 text-sm"
              placeholder="Search documents..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={{ color: "#fff" }}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search ? (
              <Pressable onPress={() => setSearch("")} className="p-1 active:opacity-60">
                <X size={14} color="rgba(255,255,255,0.7)" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {showArchived ? (
        <FlatList
          data={archivedDocs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => loadDocs(true)}
          refreshing={refreshing}
          ListHeaderComponent={
            <View className="flex-row items-center gap-2 mb-2">
              <Archive size={15} color="#6B7280" />
              <Text className="text-sm font-semibold text-muted-foreground">Archived ({archivedDocs.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 gap-3">
              <Archive size={44} color="#9CA3AF" />
              <Text className="text-base font-bold text-foreground">No archived documents</Text>
              <Text className="text-sm text-muted-foreground text-center px-8">Archived documents will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DocumentItem
              doc={item}
              onPress={() => navigateToDoc(item.id)}
              archived
              onUnarchive={handleUnarchive}
              isDark={isDark}
            />
          )}
        />
      ) : (
        <>
          {/* Type filter pills */}
          <View style={{ paddingVertical: 10 }}>
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => {
                const isAllActive = item.type === null && activeFilter === null;
                const active = isAllActive || activeFilter === item.type;
                return (
                  <Pressable
                    className="px-4 py-2 rounded-full active:opacity-70"
                    style={{
                      backgroundColor: active ? "#166534" : (isDark ? "#1F2937" : "#F3F4F6"),
                    }}
                    onPress={() => setActiveFilter(item.type)}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: active ? "#fff" : (isDark ? "#9CA3AF" : "#374151") }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#166534" />
            </View>
          ) : (
            <FlatList
              data={docs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
              showsVerticalScrollIndicator={false}
              onRefresh={() => loadDocs(true)}
              refreshing={refreshing}
              ListEmptyComponent={
                <View className="items-center justify-center py-20 gap-3">
                  <BookMarked size={44} color="#9CA3AF" />
                  <Text className="text-base font-bold text-foreground">No documents found</Text>
                  <Text className="text-sm text-muted-foreground text-center px-8">
                    {search
                      ? "Try a different search term or clear filters."
                      : "Use the AI Tools tab to generate your first document."}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <DocumentItem
                  doc={item}
                  onPress={() => navigateToDoc(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  isDark={isDark}
                />
              )}
            />
          )}
        </>
      )}
    </View>
  );
}
