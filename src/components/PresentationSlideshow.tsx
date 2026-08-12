import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  FlatList,
  useWindowDimensions,
  ViewToken,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  Maximize2,
} from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";

// ---- helpers ----
function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}
function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined) return [];
  return [v];
}

// ---- Slide colour palette (cycles) ----
const SLIDE_THEMES = [
  { bg: "#052e16", text: "#ffffff", accent: "#4ade80", sub: "rgba(255,255,255,0.7)" },
  { bg: "#1e3a5f", text: "#ffffff", accent: "#60a5fa", sub: "rgba(255,255,255,0.7)" },
  { bg: "#3b0764", text: "#ffffff", accent: "#c084fc", sub: "rgba(255,255,255,0.7)" },
  { bg: "#0c4a6e", text: "#ffffff", accent: "#38bdf8", sub: "rgba(255,255,255,0.7)" },
  { bg: "#422006", text: "#ffffff", accent: "#fb923c", sub: "rgba(255,255,255,0.7)" },
  { bg: "#1c1917", text: "#ffffff", accent: "#a8a29e", sub: "rgba(255,255,255,0.65)" },
];

interface SlideData {
  number: number;
  type: string;
  title: string;
  subtitle?: string;
  hook_question?: string;
  bullet_points: string[];
  real_world_connection?: string;
  activity_prompt?: string;
  youtube_search_query?: string;
  youtube_featured?: boolean;
  speaker_notes?: string;
  recap_questions?: string[];
  exit_ticket?: string;
}

function buildSlides(content: Record<string, unknown>): SlideData[] {
  const slides: SlideData[] = [];

  asArray(content.slides ?? content.presentation_slides ?? []).forEach((s, i) => {
    if (typeof s !== "object" || s === null) return;
    const sl = s as Record<string, unknown>;
    slides.push({
      number: Number(sl.number ?? i + 1),
      type: str(sl.type ?? sl.slide_type ?? "Content"),
      title: str(sl.title ?? sl.slide_title ?? `Slide ${i + 1}`),
      subtitle: str(sl.subtitle),
      hook_question: str(sl.hook_question),
      bullet_points: asArray(sl.bullet_points ?? sl.content ?? sl.bullets ?? sl.points ?? sl.key_points).map(str).filter(Boolean),
      real_world_connection: str(sl.real_world_connection),
      activity_prompt: str(sl.activity_prompt),
      youtube_search_query: str(sl.youtube_search_query),
      youtube_featured: !!sl.youtube_featured,
      speaker_notes: str(sl.speaker_notes ?? sl.notes),
      recap_questions: asArray(sl.recap_questions).map(str).filter(Boolean),
      exit_ticket: str(sl.exit_ticket),
    });
  });

  // append assessment slide if present
  const as_ = content.assessment_slide;
  if (typeof as_ === "object" && as_ !== null) {
    const a = as_ as Record<string, unknown>;
    slides.push({
      number: slides.length + 1,
      type: "Assessment / Summary",
      title: str(a.title ?? "What Did We Learn?"),
      bullet_points: [],
      recap_questions: asArray(a.recap_questions).map(str).filter(Boolean),
      exit_ticket: str(a.exit_ticket),
      youtube_search_query: str(a.youtube_search_query),
      speaker_notes: str(a.speaker_notes ?? a.notes),
    });
  }
  return slides;
}

// ---- Single fullscreen slide ----
function FullSlide({
  slide,
  width,
  height,
  theme,
  showNotes,
}: {
  slide: SlideData;
  width: number;
  height: number;
  theme: typeof SLIDE_THEMES[0];
  showNotes: boolean;
}) {
  const isTitle = slide.type === "Title Slide";
  const isSummary = slide.type.includes("Summary") || slide.type.includes("Assessment");

  const openYouTube = useCallback(async () => {
    if (!slide.youtube_search_query) return;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(slide.youtube_search_query)}`;
    if (process.env.EXPO_OS === "web") {
      window.open(url, "_blank");
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  }, [slide.youtube_search_query]);

  return (
    <View style={{ width, minHeight: height, backgroundColor: theme.bg, padding: 32, justifyContent: "center" }}>
      {/* Slide number badge */}
      <View style={{ position: "absolute", top: 20, left: 24, opacity: 0.45 }}>
        <Text style={{ color: theme.text, fontSize: 11, fontWeight: "700", letterSpacing: 2 }}>
          {slide.number}
        </Text>
      </View>

      {/* Type label */}
      <View style={{ position: "absolute", top: 20, right: 24 }}>
        <View style={{ backgroundColor: theme.accent + "33", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>
            {slide.type.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={{
        color: theme.text,
        fontSize: isTitle ? 32 : 26,
        fontWeight: "900",
        lineHeight: isTitle ? 40 : 34,
        marginBottom: isTitle ? 12 : 20,
        marginTop: 28,
      }}>
        {slide.title}
      </Text>

      {/* Subtitle (title slides) */}
      {slide.subtitle ? (
        <Text style={{ color: theme.sub, fontSize: 14, fontStyle: "italic", marginBottom: 20 }}>
          {slide.subtitle}
        </Text>
      ) : null}

      {/* Hook question */}
      {slide.hook_question ? (
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 14, marginBottom: 20 }}>
          <Text style={{ color: theme.accent, fontSize: 11, fontWeight: "800", marginBottom: 4, letterSpacing: 1 }}>
            OPENING QUESTION
          </Text>
          <Text style={{ color: theme.text, fontSize: 16, fontStyle: "italic", lineHeight: 24 }}>
            "{slide.hook_question}"
          </Text>
        </View>
      ) : null}

      {/* Bullet points */}
      {slide.bullet_points.length > 0 ? (
        <View style={{ gap: 10, marginBottom: 16 }}>
          {slide.bullet_points.map((b, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent, marginTop: 6, flexShrink: 0 }} />
              <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22, flex: 1 }}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Recap questions (summary slide) */}
      {(slide.recap_questions ?? []).length > 0 ? (
        <View style={{ gap: 8, marginBottom: 16 }}>
          <Text style={{ color: theme.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 4 }}>
            RECAP QUESTIONS
          </Text>
          {(slide.recap_questions ?? []).map((q, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: theme.accent, fontWeight: "800", fontSize: 14 }}>{i + 1}.</Text>
              <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20, flex: 1 }}>{q}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Exit ticket */}
      {slide.exit_ticket ? (
        <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: theme.accent }}>
          <Text style={{ color: theme.accent, fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 1 }}>EXIT TICKET</Text>
          <Text style={{ color: theme.text, fontSize: 13, fontStyle: "italic", lineHeight: 19 }}>{slide.exit_ticket}</Text>
        </View>
      ) : null}

      {/* Real-world connection */}
      {slide.real_world_connection ? (
        <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: theme.accent, fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 1 }}>🌍 REAL WORLD — GHANA</Text>
          <Text style={{ color: theme.sub, fontSize: 13, lineHeight: 19 }}>{slide.real_world_connection}</Text>
        </View>
      ) : null}

      {/* Activity */}
      {slide.activity_prompt ? (
        <View style={{ backgroundColor: "rgba(255,200,50,0.15)", borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: "#fbbf24" }}>
          <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 1 }}>✋ ACTIVITY</Text>
          <Text style={{ color: theme.text, fontSize: 13, lineHeight: 19 }}>{slide.activity_prompt}</Text>
        </View>
      ) : null}

      {/* YouTube button */}
      {slide.youtube_search_query ? (
        <Pressable
          onPress={openYouTube}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#dc2626", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignSelf: "flex-start", marginTop: 8 }}
        >
          <ExternalLink size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
            {slide.youtube_featured ? "Watch Featured Video" : "Find on YouTube"}
          </Text>
        </Pressable>
      ) : null}

      {/* Speaker notes overlay (toggle) */}
      {showNotes && slide.speaker_notes ? (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.85)", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "800", marginBottom: 4, letterSpacing: 1 }}>🎤 SPEAKER NOTES</Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 18 }}>{slide.speaker_notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---- Thumbnail strip ----
function SlideThumbnail({
  slide,
  index,
  active,
  theme,
  onPress,
}: {
  slide: SlideData;
  index: number;
  active: boolean;
  theme: typeof SLIDE_THEMES[0];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 80,
        height: 52,
        borderRadius: 8,
        backgroundColor: theme.bg,
        marginRight: 8,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.accent : "rgba(255,255,255,0.2)",
        overflow: "hidden",
        justifyContent: "center",
        padding: 6,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 6, fontWeight: "800", marginBottom: 2, opacity: 0.6 }}>
        {slide.number}
      </Text>
      <Text style={{ color: theme.text, fontSize: 7, fontWeight: "700", lineHeight: 9 }} numberOfLines={2}>
        {slide.title}
      </Text>
    </Pressable>
  );
}

// ---- Main export ----
export function PresentationSlideshow({
  visible,
  onClose,
  content,
  presentationTitle,
}: {
  visible: boolean;
  onClose: () => void;
  content: Record<string, unknown>;
  presentationTitle: string;
}) {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const thumbRef = useRef<FlatList>(null);

  const slides = buildSlides(content);
  const total = slides.length;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= total) return;
    flatRef.current?.scrollToIndex({ index: idx, animated: true });
    thumbRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
  }, [total]);

  const theme = (index: number) => SLIDE_THEMES[index % SLIDE_THEMES.length];

  if (slides.length === 0) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar style="light" backgroundColor="#000" />
      <View style={{ flex: 1, backgroundColor: "#000" }}>

        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10, gap: 12 }}>
          <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#fff" />
          </Pressable>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, flex: 1 }} numberOfLines={1}>
            {presentationTitle}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "600" }}>
            {currentIndex + 1} / {total}
          </Text>
          <Pressable
            onPress={() => setShowNotes(n => !n)}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: showNotes ? "#fbbf24" : "rgba(255,255,255,0.15)" }}
          >
            <Text style={{ color: showNotes ? "#000" : "#fff", fontSize: 11, fontWeight: "700" }}>NOTES</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowThumbs(s => !s)}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: showThumbs ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}
          >
            <List size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Slide FlatList — horizontal swipe */}
        <FlatList
          ref={flatRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item, index }) => (
            <FullSlide
              slide={item}
              width={width}
              height={height - 160}
              theme={theme(index)}
              showNotes={showNotes}
            />
          )}
        />

        {/* Bottom nav */}
        <View style={{ paddingBottom: 32, paddingTop: 12, paddingHorizontal: 24, gap: 12 }}>
          {/* Dot indicators */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {slides.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)}>
                <View style={{
                  width: i === currentIndex ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === currentIndex ? theme(currentIndex).accent : "rgba(255,255,255,0.3)",
                }} />
              </Pressable>
            ))}
          </View>

          {/* Prev / Next */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: currentIndex === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.18)", borderRadius: 16, paddingVertical: 12 }}
            >
              <ChevronLeft size={18} color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "#fff"} />
              <Text style={{ color: currentIndex === 0 ? "rgba(255,255,255,0.3)" : "#fff", fontWeight: "700", fontSize: 14 }}>Previous</Text>
            </Pressable>
            <Pressable
              onPress={() => goTo(currentIndex + 1)}
              disabled={currentIndex === total - 1}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: currentIndex === total - 1 ? "rgba(255,255,255,0.08)" : theme(currentIndex).accent + "cc", borderRadius: 16, paddingVertical: 12 }}
            >
              <Text style={{ color: currentIndex === total - 1 ? "rgba(255,255,255,0.3)" : "#fff", fontWeight: "700", fontSize: 14 }}>Next</Text>
              <ChevronRight size={18} color={currentIndex === total - 1 ? "rgba(255,255,255,0.3)" : "#fff"} />
            </Pressable>
          </View>
        </View>

        {/* Thumbnail strip (toggleable) */}
        {showThumbs ? (
          <View style={{ position: "absolute", bottom: 130, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.9)", paddingVertical: 12, paddingHorizontal: 16 }}>
            <FlatList
              ref={thumbRef}
              data={slides}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `thumb-${i}`}
              renderItem={({ item, index }) => (
                <SlideThumbnail
                  slide={item}
                  index={index}
                  active={index === currentIndex}
                  theme={theme(index)}
                  onPress={() => { goTo(index); setShowThumbs(false); }}
                />
              )}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
