import { useRef, useState } from "react";
import {
  Text,
  View,
  Pressable,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  BookOpen,
  ClipboardList,
  BarChart2,
  ArrowRight,
  GraduationCap,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RelativePathString } from "expo-router";
import { useTheme } from "@/lib/ThemeContext";

export const ONBOARDING_KEY = "@eduassist/onboarding_done";

const SLIDES = [
  {
    key: "1",
    Icon: BookOpen,
    color: "#166534",
    bg: "#DCFCE7",
    tag: "STEP 1 OF 3",
    title: "Plan Lessons in Seconds",
    subtitle:
      "Generate complete, curriculum-aligned lesson plans, schemes of learning, and teaching notes — tailored to your subject, grade, and language.",
    bullets: ["Lesson Plans", "Schemes of Learning", "Teaching Notes", "Presentations"],
  },
  {
    key: "2",
    Icon: ClipboardList,
    color: "#1D4ED8",
    bg: "#DBEAFE",
    tag: "STEP 2 OF 3",
    title: "Create Assessments Instantly",
    subtitle:
      "AI-powered quizzes, exams, assignments, and rubrics — complete with answer keys and marking guides ready to use.",
    bullets: ["Quizzes & Exams", "Assignments", "Grading Rubrics", "Report Comments"],
  },
  {
    key: "3",
    Icon: BarChart2,
    color: "#7C3AED",
    bg: "#EDE9FE",
    tag: "STEP 3 OF 3",
    title: "Your Library, Always Ready",
    subtitle:
      "Every document is saved, searchable, and exportable. Share with colleagues, edit anytime, and track your usage — all in one place.",
    bullets: ["Document Library", "Export & Share", "Favorites & Tags", "Usage Dashboard"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const flatRef = useRef<FlatList>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
    router.replace("/(app)/(tabs)/home" as RelativePathString);
  };

  const next = () => {
    if (activeIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIdx + 1, animated: true });
    } else {
      void finish();
    }
  };

  const isLast = activeIdx === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Skip */}
      <View className="absolute top-14 right-5 z-10">
        <Pressable onPress={finish} className="px-4 py-2 active:opacity-60">
          <Text className="text-sm font-semibold text-muted-foreground">Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={(e) => {
          setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => {
          const { Icon, color, bg, tag, title, subtitle, bullets } = item;
          return (
            <View style={{ width }} className="flex-1 px-6 pt-24 pb-6 justify-between">
              {/* Icon hero */}
              <View className="items-center gap-5">
                <View
                  className="w-28 h-28 rounded-3xl items-center justify-center"
                  style={{ backgroundColor: isDark ? `${color}22` : bg, borderCurve: "continuous" }}
                >
                  <Icon size={56} color={color} />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                    {tag}
                  </Text>
                  <Text className="text-3xl font-bold text-foreground text-center leading-9">
                    {title}
                  </Text>
                  <Text className="text-base text-muted-foreground text-center leading-7 mt-1">
                    {subtitle}
                  </Text>
                </View>
              </View>

              {/* Feature pills */}
              <View className="flex-row flex-wrap gap-2 justify-center mt-6">
                {bullets.map((b: string) => (
                  <View
                    key={b}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: isDark ? `${color}22` : bg }}
                  >
                    <GraduationCap size={12} color={color} />
                    <Text className="text-xs font-semibold" style={{ color }}>
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        }}
      />

      {/* Dots + CTA */}
      <View className="px-6 pb-14 gap-5 items-center">
        {/* Progress dots */}
        <View className="flex-row gap-2 items-center">
          {SLIDES.map((s, i) => (
            <Pressable key={s.key} onPress={() => flatRef.current?.scrollToIndex({ index: i, animated: true })}>
              <View
                className="rounded-full"
                style={{
                  width: i === activeIdx ? 24 : 8,
                  height: 8,
                  backgroundColor: i === activeIdx ? "#166534" : (isDark ? "#374151" : "#D1D5DB"),
                }}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          className="bg-primary w-full rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-85"
          style={{ borderCurve: "continuous" }}
          onPress={next}
        >
          <Text className="text-primary-foreground text-base font-bold">
            {isLast ? "Get Started" : "Next"}
          </Text>
          <ArrowRight size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
