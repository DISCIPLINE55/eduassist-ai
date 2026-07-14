import { useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Star,
  Share2,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Check,
  X,
  FileText,
  Sparkles,
  Tag,
  Plus,
  PenLine,
} from "lucide-react-native";
import type { RelativePathString } from "expo-router";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  toggleFavorite,
  archiveDocument,
} from "@/db/api";
import type { Document } from "@/types/types";
import { DOCUMENT_TYPE_LABELS } from "@/types/types";
import { DocumentRenderer, formatDocumentAsText } from "@/components/DocumentRenderer";

const DOCUMENT_BG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a5121273-68ba-43dd-ad84-354428853b48.jpg";

// ---- Deep-clone a JSON value ----
function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ---- Recursive content editor ----
function ContentEditor({
  value,
  onChange,
  depth = 0,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  depth?: number;
}) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return (
      <TextInput
        className="border border-border rounded-lg bg-background px-3 py-2 text-sm text-foreground"
        style={{ textAlignVertical: "top", minHeight: String(value).length > 80 ? 80 : 40 }}
        value={String(value)}
        onChangeText={(t) => onChange(t)}
        multiline={String(value).length > 80}
        placeholderTextColor="#9CA3AF"
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <View className="gap-2">
        {value.map((item, i) => (
          <View key={i} className="flex-row gap-2 items-start">
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0 mt-1">
              <Text className="text-primary-foreground text-xs font-bold">{i + 1}</Text>
            </View>
            <View className="flex-1">
              <ContentEditor
                value={item}
                onChange={(v) => {
                  const next = [...(value as unknown[])];
                  next[i] = v;
                  onChange(next);
                }}
                depth={depth + 1}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      <View className="gap-3">
        {Object.entries(obj).map(([k, v]) => (
          <View key={k} className="gap-1" style={{ marginLeft: depth * 8 }}>
            <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {k.replace(/_/g, " ")}
            </Text>
            <ContentEditor
              value={v}
              onChange={(nv) => onChange({ ...obj, [k]: nv })}
              depth={depth + 1}
            />
          </View>
        ))}
      </View>
    );
  }

  return null;
}

// ---- Tags editor ----
function TagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag) => (
          <View key={tag} className="flex-row items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
            <Text className="text-primary text-xs font-semibold">{tag}</Text>
            <Pressable onPress={() => onChange(tags.filter((t) => t !== tag))} className="active:opacity-60">
              <X size={12} color="#166534" />
            </Pressable>
          </View>
        ))}
        {tags.length === 0 && (
          <Text className="text-xs text-muted-foreground">No tags yet</Text>
        )}
      </View>
      <View className="flex-row gap-2 items-center">
        <TextInput
          className="flex-1 border border-border rounded-lg bg-card px-3 py-2 text-sm text-foreground"
          placeholder="Add a tag..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTag}
          returnKeyType="done"
          autoCapitalize="none"
        />
        <Pressable
          className="w-9 h-9 bg-primary rounded-lg items-center justify-center active:opacity-80"
          onPress={addTag}
        >
          <Plus size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

export default function DocumentViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // content editing
  const [editMode, setEditMode] = useState(false);
  const [contentDraft, setContentDraft] = useState<Record<string, unknown>>({});
  const [savingContent, setSavingContent] = useState(false);

  // tags
  const [editingTags, setEditingTags] = useState(false);
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);

  // action states
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadDoc = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getDocumentById(id);
      if (!data) { setNotFound(true); return; }
      setDoc(data);
      setTitleDraft(data.title);
      setContentDraft(deepClone(data.content));
      setTagsDraft(data.tags ?? []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadDoc(); }, [loadDoc]));

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 2500); };
  const showErr = (msg: string) => { setActionError(msg); setTimeout(() => setActionError(""), 3000); };

  // ---- Title save ----
  const handleSaveTitle = async () => {
    if (!doc || !titleDraft.trim()) return;
    setSavingTitle(true);
    try {
      await updateDocument(doc.id, { title: titleDraft.trim() });
      setDoc((d) => d ? { ...d, title: titleDraft.trim() } : d);
      setEditingTitle(false);
      showMsg("Title saved");
    } finally {
      setSavingTitle(false);
    }
  };

  // ---- Content save ----
  const handleSaveContent = async () => {
    if (!doc) return;
    setSavingContent(true);
    try {
      await updateDocument(doc.id, { content: contentDraft });
      setDoc((d) => d ? { ...d, content: contentDraft } : d);
      setEditMode(false);
      showMsg("Content saved");
    } catch {
      showErr("Failed to save content");
    } finally {
      setSavingContent(false);
    }
  };

  // ---- Tags save ----
  const handleSaveTags = async () => {
    if (!doc) return;
    await updateDocument(doc.id, { tags: tagsDraft });
    setDoc((d) => d ? { ...d, tags: tagsDraft } : d);
    setEditingTags(false);
    showMsg("Tags saved");
  };

  // ---- Favorite ----
  const handleToggleFavorite = async () => {
    if (!doc || busy) return;
    await toggleFavorite(doc.id, !doc.is_favorite);
    setDoc((d) => d ? { ...d, is_favorite: !d.is_favorite } : d);
    showMsg(doc.is_favorite ? "Removed from favorites" : "Added to favorites");
  };

  // ---- Duplicate ----
  const handleDuplicate = async () => {
    if (!doc || busy) return;
    setBusy(true);
    try {
      const newDoc = await duplicateDocument(doc.id);
      showMsg("Duplicated — opening copy…");
      setTimeout(() => router.replace(`/(app)/document/${newDoc.id}` as RelativePathString), 800);
    } catch {
      showErr("Duplicate failed");
    } finally {
      setBusy(false);
    }
  };

  // ---- Archive ----
  const handleArchive = async () => {
    if (!doc || busy) return;
    setBusy(true);
    try {
      await archiveDocument(doc.id);
      showMsg("Archived");
      setTimeout(() => router.back(), 800);
    } catch {
      showErr("Archive failed");
    } finally {
      setBusy(false);
    }
  };

  // ---- Share (formatted plain text, not raw JSON) ----
  const handleShare = async () => {
    if (!doc) return;
    const text = formatDocumentAsText(doc.title, doc.type, doc.content);
    if (process.env.EXPO_OS === "web") {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showMsg("Copied to clipboard!");
      } else {
        // Fallback: open in new tab as plain text blob
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } else {
      await Share.share({ title: doc.title, message: text });
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!doc || busy) return;
    setBusy(true);
    try {
      await deleteDocument(doc.id);
      router.replace("/(app)/(tabs)/library" as RelativePathString);
    } catch {
      showErr("Delete failed");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notFound || !doc) {
    return <Redirect href={"/(app)/(tabs)/library" as RelativePathString} />;
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Gradient header with real background image */}
      <View style={{ minHeight: 160 }}>
        <Image
          source={{ uri: DOCUMENT_BG }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(5,46,22,0.85)", "rgba(5,46,22,0.7)", "rgba(5,46,22,0.95)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="px-4 pt-14 pb-5 gap-3">
          {/* Nav row */}
          <View className="flex-row items-center gap-3">
            <Pressable
              className="w-9 h-9 rounded-full items-center justify-center bg-white/20 active:opacity-70"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View className="flex-row items-center gap-2 flex-1">
              <FileText size={13} color="rgba(255,255,255,0.65)" />
              <Text className="text-white/65 text-xs font-semibold tracking-wide uppercase">
                {DOCUMENT_TYPE_LABELS[doc.type]}
              </Text>
            </View>
            <Pressable onPress={handleToggleFavorite} className="p-1 active:opacity-70">
              <Star
                size={20}
                color={doc.is_favorite ? "#FCD34D" : "rgba(255,255,255,0.55)"}
                fill={doc.is_favorite ? "#FCD34D" : "transparent"}
              />
            </Pressable>
          </View>

          {/* Title */}
          {editingTitle ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-white/20 rounded-xl px-4 py-2.5 text-white text-base font-semibold"
                value={titleDraft}
                onChangeText={setTitleDraft}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveTitle}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <Pressable onPress={handleSaveTitle} disabled={savingTitle} className="p-2 active:opacity-70">
                {savingTitle ? <ActivityIndicator color="#fff" size="small" /> : <Check size={20} color="#fff" />}
              </Pressable>
              <Pressable onPress={() => { setEditingTitle(false); setTitleDraft(doc.title); }} className="p-2 active:opacity-70">
                <X size={20} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
          ) : (
            <Pressable className="flex-row items-start gap-2 active:opacity-80" onPress={() => setEditingTitle(true)}>
              <Text className="text-white text-xl font-bold flex-1 leading-7" numberOfLines={3}>{doc.title}</Text>
              <Pencil size={15} color="rgba(255,255,255,0.55)" style={{ marginTop: 4 }} />
            </Pressable>
          )}

          {/* Meta pills */}
          <View className="flex-row gap-2 flex-wrap">
            {doc.subject ? (
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">{doc.subject}</Text>
              </View>
            ) : null}
            {doc.grade ? (
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">{doc.grade}</Text>
              </View>
            ) : null}
            {/* AI badge */}
            <View className="flex-row items-center gap-1 bg-white/15 rounded-full px-3 py-1">
              <Sparkles size={10} color="#FCD34D" />
              <Text className="text-white/85 text-xs font-semibold">EduAssist AI</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action bar */}
      <View className="flex-row px-4 py-3 border-b border-border gap-2">
        {[
          { icon: Share2, label: "Share", onPress: handleShare, destructive: false },
          { icon: Copy, label: "Duplicate", onPress: handleDuplicate, destructive: false },
          { icon: Archive, label: "Archive", onPress: handleArchive, destructive: false },
          { icon: Trash2, label: "Delete", onPress: () => setShowDeleteConfirm(true), destructive: true },
        ].map(({ icon: ActionIcon, label, onPress, destructive }) => (
          <Pressable
            key={label}
            className="flex-1 flex-col items-center gap-1 py-2 rounded-xl active:opacity-70"
            style={{ backgroundColor: destructive ? "#FEE2E2" : undefined }}
            onPress={onPress}
            disabled={busy}
          >
            <ActionIcon size={18} color={destructive ? "#DC2626" : undefined} className={destructive ? "" : "text-foreground"} />
            <Text className={`text-xs font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Feedback messages */}
      {actionMsg ? (
        <View className="mx-4 mt-3 bg-secondary rounded-xl px-4 py-2 flex-row items-center gap-2">
          <Sparkles size={14} color="#166534" />
          <Text className="text-primary text-sm font-medium">{actionMsg}</Text>
        </View>
      ) : null}
      {actionError ? (
        <View className="mx-4 mt-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2">
          <Text className="text-destructive text-sm">{actionError}</Text>
        </View>
      ) : null}

      {/* Delete confirmation */}
      {showDeleteConfirm ? (
        <View className="mx-4 mt-3 bg-destructive/10 border border-destructive/30 rounded-2xl p-4 gap-3" style={{ borderCurve: "continuous" }}>
          <Text className="text-sm font-semibold text-destructive">Delete this document?</Text>
          <Text className="text-xs text-muted-foreground">This action cannot be undone.</Text>
          <View className="flex-row gap-2">
            <Pressable className="flex-1 bg-destructive rounded-xl py-3 items-center active:opacity-80" onPress={handleDelete} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-white font-semibold text-sm">Delete</Text>}
            </Pressable>
            <Pressable className="flex-1 bg-secondary rounded-xl py-3 items-center active:opacity-80" onPress={() => setShowDeleteConfirm(false)}>
              <Text className="text-foreground font-semibold text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Content area */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pt-4 pb-12 gap-4"
      >
        {/* View / Edit mode toggle */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Content</Text>
          <Pressable
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-70"
            style={{ backgroundColor: editMode ? "#166534" : undefined }}
            onPress={() => {
              if (editMode) {
                // discard changes
                setContentDraft(deepClone(doc.content));
                setEditMode(false);
              } else {
                setContentDraft(deepClone(doc.content));
                setEditMode(true);
              }
            }}
          >
            {editMode
              ? <><X size={13} color="#fff" /><Text className="text-xs font-semibold text-white">Cancel Edit</Text></>
              : <><PenLine size={13} className="text-foreground" /><Text className="text-xs font-semibold text-foreground">Edit Content</Text></>
            }
          </Pressable>
        </View>

        <View className="bg-card border border-border rounded-2xl p-5 gap-4" style={{ borderCurve: "continuous" }}>
          {editMode ? (
            <>
              <ContentEditor value={contentDraft} onChange={(v) => setContentDraft(v as Record<string, unknown>)} />
              <Pressable
                className="bg-primary rounded-xl py-3 items-center flex-row justify-center gap-2 active:opacity-80 mt-2"
                onPress={handleSaveContent}
                disabled={savingContent}
              >
                {savingContent
                  ? <><ActivityIndicator color="#fff" size="small" /><Text className="text-primary-foreground font-semibold">Saving…</Text></>
                  : <><Check size={16} color="#fff" /><Text className="text-primary-foreground font-semibold">Save Changes</Text></>
                }
              </Pressable>
            </>
          ) : (
            <DocumentRenderer type={doc.type} content={doc.content} />
          )}
        </View>

        {/* Tags section */}
        <View className="bg-card border border-border rounded-2xl p-4 gap-3" style={{ borderCurve: "continuous" }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Tag size={14} color="#166534" />
              <Text className="text-sm font-semibold text-foreground">Tags</Text>
            </View>
            {editingTags ? (
              <View className="flex-row gap-2">
                <Pressable className="px-3 py-1 bg-primary rounded-full active:opacity-70" onPress={handleSaveTags}>
                  <Text className="text-primary-foreground text-xs font-semibold">Save</Text>
                </Pressable>
                <Pressable className="px-3 py-1 bg-secondary rounded-full active:opacity-70" onPress={() => { setTagsDraft(doc.tags ?? []); setEditingTags(false); }}>
                  <Text className="text-foreground text-xs font-semibold">Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable className="px-3 py-1 bg-secondary rounded-full active:opacity-70" onPress={() => setEditingTags(true)}>
                <Text className="text-foreground text-xs font-semibold">Edit Tags</Text>
              </Pressable>
            )}
          </View>
          {editingTags ? (
            <TagsEditor tags={tagsDraft} onChange={setTagsDraft} />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {(doc.tags ?? []).length > 0
                ? doc.tags.map((tag) => (
                    <View key={tag} className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="text-primary text-xs font-semibold">{tag}</Text>
                    </View>
                  ))
                : <Text className="text-xs text-muted-foreground">No tags — tap Edit Tags to add some</Text>
              }
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center gap-2 mt-2">
          <Sparkles size={12} color="#9CA3AF" />
          <Text className="text-xs text-muted-foreground">Generated by EduAssist AI</Text>
        </View>
      </ScrollView>
    </View>
  );
}
