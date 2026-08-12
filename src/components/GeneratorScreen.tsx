import { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Sparkles, ChevronDown, X, WifiOff, Zap } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import * as Network from "expo-network";
import { generateContent, createDocument } from "@/db/api";
import type { DocumentType } from "@/types/types";
import { DOCUMENT_TYPE_LABELS } from "@/types/types";
import type { RelativePathString } from "expo-router";

export interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  options?: string[];
  required?: boolean;
}

interface GeneratorScreenProps {
  type: DocumentType;
  fields: FieldConfig[];
}

// ---- SelectPill with Modal bottom sheet ----
function SelectPill({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-foreground">{label}</Text>
      <Pressable
        className="flex-row items-center justify-between border border-border rounded-2xl bg-card px-4 py-3.5 active:opacity-75"
        style={{ borderCurve: "continuous" }}
        onPress={() => setOpen(true)}
      >
        <Text className={value ? "text-base font-medium text-foreground" : "text-base text-muted-foreground"}>
          {value || `Select ${label}`}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)}>
          <View className="flex-1 justify-end">
            <Pressable onPress={() => {}} className="bg-card rounded-t-3xl overflow-hidden">
              <View className="items-center pt-3 pb-1">
                <View className="w-10 h-1 bg-border rounded-full" />
              </View>
              <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
                <Text className="text-base font-bold text-foreground">{label}</Text>
                <Pressable onPress={() => setOpen(false)} className="p-1.5 bg-secondary rounded-full active:opacity-60">
                  <X size={16} color="#6B7280" />
                </Pressable>
              </View>
              <ScrollView
                style={{ maxHeight: 340 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 36 }}
              >
                {options.map((opt) => {
                  const selected = value === opt;
                  return (
                    <Pressable
                      key={opt}
                      className="px-5 py-4 border-b border-border active:bg-secondary flex-row items-center justify-between"
                      onPress={() => { onChange(opt); setOpen(false); }}
                    >
                      <Text className={`text-sm flex-1 ${selected ? "font-bold text-primary" : "font-normal text-foreground"}`}>
                        {opt}
                      </Text>
                      {selected ? (
                        <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function GeneratorScreen({ type, fields }: GeneratorScreenProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const requiredCount = fields.filter((f) => f.required).length;
  const filledRequired = fields.filter((f) => f.required && values[f.key]?.trim()).length;
  const progress = requiredCount > 0 ? filledRequired / requiredCount : 1;

  const setValue = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setError("");
  }, []);

  const handleGenerate = async () => {
    const missing = fields.filter((f) => f.required && !values[f.key]?.trim()).map((f) => f.label);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    const netState = await Network.getNetworkStateAsync();
    if (!netState.isConnected || !netState.isInternetReachable) {
      setError("No internet connection. Please check your network and try again.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const { content } = await generateContent(type, values);
      const title = (content as Record<string, string>).title
        || `${DOCUMENT_TYPE_LABELS[type]}: ${values.topic || values.subject || "Untitled"}`;
      const doc = await createDocument({
        type,
        title: String(title),
        content,
        inputs: values,
        status: "complete",
        is_favorite: false,
        tags: [],
        subject: values.subject,
        grade: values.grade,
        topic: values.topic,
      });
      router.replace(`/(app)/document/${doc.id}` as RelativePathString);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="#166534" />

      {/* Header */}
      <View className="bg-primary px-5 pt-14 pb-5 gap-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="w-10 h-10 rounded-2xl items-center justify-center bg-primary-foreground/20 active:opacity-70"
            onPress={() => router.back()}
            style={{ borderCurve: "continuous" }}
          >
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-primary-foreground">
              {DOCUMENT_TYPE_LABELS[type]}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Zap size={10} color="#D97706" />
              <Text className="text-primary-foreground/70 text-xs">Powered by Gemini AI</Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-2xl items-center justify-center bg-primary-foreground/20" style={{ borderCurve: "continuous" }}>
            <Sparkles size={20} color="#D97706" />
          </View>
        </View>

        {/* Progress bar for required fields */}
        {requiredCount > 0 && (
          <View className="gap-1.5">
            <View className="flex-row justify-between">
              <Text className="text-xs text-primary-foreground/70">
                {filledRequired} of {requiredCount} required fields
              </Text>
              <Text className="text-xs text-primary-foreground/70 font-semibold">
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary-foreground rounded-full"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </View>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 }}
        >
          {fields.map((field) =>
            field.options ? (
              <SelectPill
                key={field.key}
                label={`${field.label}${field.required ? " *" : ""}`}
                options={field.options}
                value={values[field.key] ?? ""}
                onChange={(v) => setValue(field.key, v)}
              />
            ) : (
              <View key={field.key} className="gap-2">
                <Text className="text-sm font-bold text-foreground">
                  {field.label}{field.required ? " *" : ""}
                </Text>
                <TextInput
                  className="border border-border rounded-2xl bg-card px-4 py-3.5 text-base text-foreground"
                  style={{
                    borderCurve: "continuous",
                    minHeight: field.multiline ? 90 : undefined,
                    textAlignVertical: field.multiline ? "top" : "center",
                  }}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={values[field.key] ?? ""}
                  onChangeText={(v) => setValue(field.key, v)}
                  multiline={field.multiline}
                  returnKeyType={field.multiline ? "default" : "next"}
                />
              </View>
            )
          )}

          {error ? (
            <View className="bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3 flex-row items-start gap-2" style={{ borderCurve: "continuous" }}>
              {error.includes("internet") || error.includes("connection") ? (
                <WifiOff size={16} color="#DC2626" style={{ marginTop: 2 }} />
              ) : null}
              <Text className="text-destructive text-sm flex-1 leading-5">{error}</Text>
            </View>
          ) : null}

          {/* Generate button */}
          <Pressable
            className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2.5 active:opacity-80 mt-1"
            style={{ borderCurve: "continuous" }}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-primary-foreground font-bold text-base">Generating…</Text>
              </>
            ) : (
              <>
                <Sparkles size={18} color="#fff" />
                <Text className="text-primary-foreground font-bold text-base">Generate with AI</Text>
              </>
            )}
          </Pressable>

          {generating && (
            <View className="items-center gap-2">
              <Text className="text-muted-foreground text-xs text-center">
                Gemini AI is crafting your document. This usually takes 5–15 seconds…
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
