import { Text, View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import type { DocumentType } from "@/types/types";
import { DOCUMENT_TYPE_LABELS } from "@/types/types";
import { useTheme } from "@/lib/ThemeContext";

const TOOLS_HERO = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6146ac93-d7f2-4d74-a93f-fd0970dd81c8.jpg";
const TOOLS: {
  type: DocumentType;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bg: string;
  desc: string;
  badge?: string;
}[] = [
  { type: "lesson_plan", icon: BookOpen, color: "#166534", bg: "#DCFCE7", desc: "Full curriculum-aligned plans ready for any classroom", badge: "Popular" },
  { type: "scheme_of_learning", icon: CalendarRange, color: "#0369A1", bg: "#DBEAFE", desc: "Complete term plans with weekly breakdowns & objectives" },
  { type: "notes", icon: FileText, color: "#7C3AED", bg: "#EDE9FE", desc: "Structured teaching notes with examples & key concepts" },
  { type: "quiz", icon: CircleHelp, color: "#1D4ED8", bg: "#DBEAFE", desc: "Mixed-type quizzes with answer keys & marking guides", badge: "Popular" },
  { type: "examination", icon: ClipboardList, color: "#B45309", bg: "#FEF3C7", desc: "Professional exam papers with Bloom's Taxonomy & marking scheme" },
  { type: "assignment", icon: ClipboardCheck, color: "#BE185D", bg: "#FCE7F3", desc: "Homework, research projects & group activities with rubrics" },
  { type: "rubric", icon: LayoutGrid, color: "#0F766E", bg: "#CCFBF1", desc: "Detailed grading rubrics with performance level descriptors" },
  { type: "report_comment", icon: MessageSquare, color: "#6B21A8", bg: "#F3E8FF", desc: "Personalized, professional report card comments", badge: "New" },
  { type: "presentation", icon: Presentation, color: "#DC2626", bg: "#FEE2E2", desc: "Engaging slide content with speaker notes & visual suggestions" },
];

export default function ToolsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Hero with image */}
      <View style={{ height: 200 }}>
        <Image source={{ uri: TOOLS_HERO }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
        <LinearGradient
          colors={["rgba(5,46,22,0.82)", "rgba(5,46,22,0.65)", "rgba(5,46,22,0.95)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="flex-1 px-6 pt-14 pb-6 justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
              <Sparkles size={20} color="#FCD34D" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">AI Tools</Text>
              <Text className="text-white/70 text-xs mt-0.5">9 tools · Powered by Gemini 2.5</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            {["Instant generation", "Answer keys included", "8 languages"].map((t) => (
              <View key={t} className="flex-row items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                <Zap size={9} color="#FCD34D" />
                <Text className="text-xs text-white/90 font-medium">{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-5 pb-12 gap-3"
      >
        {TOOLS.map(({ type, icon: Icon, color, bg, desc, badge }) => (
          <Pressable
            key={type}
            className="flex-row items-center gap-4 bg-card border border-border rounded-2xl p-4 active:opacity-75"
            style={{ borderCurve: "continuous" }}
            onPress={() => router.push(`/(app)/generate/${type}` as RelativePathString)}
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0"
              style={{ backgroundColor: isDark ? `${color}22` : bg, borderCurve: "continuous" }}
            >
              <Icon size={26} color={color} />
            </View>
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-foreground">
                  {DOCUMENT_TYPE_LABELS[type]}
                </Text>
                {badge ? (
                  <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-bold text-primary">{badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs text-muted-foreground leading-5">{desc}</Text>
            </View>
            <View
              className="w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
              style={{ backgroundColor: isDark ? `${color}22` : bg }}
            >
              <ChevronRight size={16} color={color} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
