import { ScrollView, Text, View, Pressable, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  Sparkles,
  Globe,
  Clock,
  ShieldCheck,
  ArrowRight,
  Star,
  Zap,
  CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/lib/ThemeContext";
import type { RelativePathString } from "expo-router";

const HERO_IMG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e387c3f8-964d-4738-b290-af19a7fd6fd1.jpg";
const CLASSROOM_IMG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5a21c456-f7c0-42f6-9b4d-e62794259ded.jpg";

const FEATURES = [
  {
    icon: BookOpen,
    label: "Lesson Plans & Schemes",
    desc: "Curriculum-aligned plans generated in seconds, ready to use in any classroom.",
    color: "#166534",
    bg: "#DCFCE7",
  },
  {
    icon: ClipboardList,
    label: "Quizzes, Exams & Rubrics",
    desc: "Full assessments with answer keys and marking guides — auto-generated.",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  {
    icon: FileText,
    label: "Notes & Report Comments",
    desc: "Structured teaching notes and personalised student report comments.",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
];

const STATS = [
  { icon: Sparkles, value: "9+", label: "AI Tools", color: "#166534" },
  { icon: Clock, value: "70%", label: "Time Saved", color: "#D97706" },
  { icon: Globe, value: "8", label: "Languages", color: "#1D4ED8" },
  { icon: ShieldCheck, value: "24/7", label: "Available", color: "#7C3AED" },
];

const TESTIMONIALS = [
  { name: "Ms. Adaeze O.", role: "Secondary Teacher · Nigeria", text: "I now prep a full week's lessons in under an hour. This is a game-changer." },
  { name: "Mr. James T.", role: "Head of Dept · UK", text: "The exam generator saves my department days of work every term." },
];

const BENEFITS = [
  "Instant AI-generated content",
  "11 international curricula",
  "Answer keys auto-included",
  "No credit card required",
];

export default function LandingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerClassName="flex-grow"
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero with real image + gradient overlay ── */}
        <View style={{ height: 480 }}>
          <Image
            source={{ uri: HERO_IMG }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(5,46,22,0.85)", "rgba(5,46,22,0.65)", "rgba(5,46,22,0.9)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="flex-1 px-6 pt-16 pb-10 justify-between">
            {/* Logo row */}
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center" style={{ borderCurve: "continuous" }}>
                <GraduationCap size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold tracking-tight">EduAssist AI</Text>
                <View className="flex-row items-center gap-1">
                  <Sparkles size={9} color="#FCD34D" />
                  <Text className="text-white/70 text-xs font-medium">Powered by Gemini 2.5</Text>
                </View>
              </View>
            </View>

            {/* Hero copy */}
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-white text-4xl font-bold leading-tight tracking-tight">
                  Teach Smarter,{"\n"}Not Harder
                </Text>
                <Text className="text-white/80 text-base leading-6">
                  Generate lesson plans, quizzes, rubrics and report comments in seconds — powered by Gemini AI.
                </Text>
              </View>

              {/* Benefit pills */}
              <View className="flex-row flex-wrap gap-2">
                {BENEFITS.map((b) => (
                  <View key={b} className="flex-row items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                    <CheckCircle size={11} color="#86EFAC" />
                    <Text className="text-white/90 text-xs font-semibold">{b}</Text>
                  </View>
                ))}
              </View>

              {/* CTA buttons */}
              <View className="flex-row gap-3 mt-1">
                <Pressable
                  className="flex-1 bg-white rounded-2xl py-4 items-center active:opacity-85"
                  style={{ borderCurve: "continuous" }}
                  onPress={() => router.push("/(auth)/sign-up" as RelativePathString)}
                >
                  <Text className="text-primary text-sm font-bold">Get Started Free</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-white/15 border border-white/30 rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-75"
                  style={{ borderCurve: "continuous" }}
                  onPress={() => router.push("/(auth)/sign-in" as RelativePathString)}
                >
                  <Text className="text-white text-sm font-semibold">Sign In</Text>
                  <ArrowRight size={14} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <View className="flex-row bg-card border-b border-border">
          {STATS.map(({ icon: Icon, value, label, color }, idx) => (
            <View
              key={label}
              className={`flex-1 items-center py-5 gap-1 ${idx < STATS.length - 1 ? "border-r border-border" : ""}`}
            >
              <View className="w-8 h-8 rounded-full items-center justify-center mb-0.5" style={{ backgroundColor: `${color}15` }}>
                <Icon size={16} color={color} />
              </View>
              <Text className="text-base font-bold text-foreground">{value}</Text>
              <Text className="text-xs text-muted-foreground">{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Features ── */}
        <View className="px-5 pt-8 pb-4 gap-4">
          <View className="gap-1">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              What you can create
            </Text>
            <Text className="text-xl font-bold text-foreground">9 AI-powered tools</Text>
          </View>
          {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
            <View
              key={label}
              className="flex-row items-start gap-4 bg-card border border-border rounded-2xl p-4"
              style={{ borderCurve: "continuous" }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isDark ? `${color}22` : bg, borderCurve: "continuous" }}
              >
                <Icon size={24} color={color} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-sm font-bold text-foreground">{label}</Text>
                <Text className="text-sm text-muted-foreground leading-5">{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Classroom image section ── */}
        <View className="mx-5 mt-2 rounded-3xl overflow-hidden" style={{ height: 180, borderCurve: "continuous" }}>
          <Image source={{ uri: CLASSROOM_IMG }} style={{ flex: 1 }} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(5,46,22,0.88)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}
          />
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-5 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Globe size={13} color="#86EFAC" />
              <Text className="text-white text-sm font-bold">Works in any classroom, anywhere</Text>
            </View>
            <Text className="text-white/75 text-xs leading-5">
              Supports 8 languages and 11 international curricula — CAPS, Cambridge, CBC, Common Core & more.
            </Text>
          </View>
        </View>

        {/* ── Testimonials ── */}
        <View className="px-5 mt-6 gap-3">
          <View className="flex-row items-center gap-2">
            <View className="flex-row gap-0.5">
              {[1,2,3,4,5].map((i) => <Star key={i} size={12} color="#D97706" fill="#D97706" />)}
            </View>
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loved by teachers</Text>
          </View>
          {TESTIMONIALS.map(({ name, role, text }) => (
            <View
              key={name}
              className="bg-card border border-border rounded-2xl p-4 gap-3"
              style={{ borderCurve: "continuous" }}
            >
              <View className="flex-row gap-0.5">
                {[1,2,3,4,5].map((i) => <Star key={i} size={12} color="#D97706" fill="#D97706" />)}
              </View>
              <Text className="text-sm text-foreground leading-6 italic">"{text}"</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-primary/15 items-center justify-center">
                  <Text className="text-xs font-bold text-primary">{name[0]}</Text>
                </View>
                <View>
                  <Text className="text-xs font-bold text-foreground">{name}</Text>
                  <Text className="text-xs text-muted-foreground">{role}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── Final CTA ── */}
        <View className="px-5 pt-7 pb-16 gap-3">
          <Pressable
            className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-85"
            style={{ borderCurve: "continuous" }}
            onPress={() => router.push("/(auth)/sign-up" as RelativePathString)}
          >
            <Zap size={16} color="#fff" />
            <Text className="text-primary-foreground text-base font-bold">Start Generating for Free</Text>
          </Pressable>
          <Pressable
            className="bg-card border border-border rounded-2xl py-4 items-center active:opacity-70"
            style={{ borderCurve: "continuous" }}
            onPress={() => router.push("/(auth)/sign-in" as RelativePathString)}
          >
            <Text className="text-foreground text-base font-semibold">I already have an account</Text>
          </Pressable>
          <Text className="text-center text-xs text-muted-foreground mt-1">
            Free to use · No credit card required · Cancel anytime
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
