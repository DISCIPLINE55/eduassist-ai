import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft, ArrowRight, Send, CheckCircle } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import { supabase } from "@/client/supabase";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "eduassist://reset-password",
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-5">
        <StatusBar style="dark" />
        <View className="w-24 h-24 bg-primary/10 rounded-3xl items-center justify-center" style={{ borderCurve: "continuous" }}>
          <CheckCircle size={48} color="#166534" />
        </View>
        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-foreground text-center">Reset Link Sent</Text>
          <Text className="text-sm text-muted-foreground text-center leading-6 px-4">
            Check your inbox for a password reset link.{"\n"}It may take a few minutes to arrive.
          </Text>
        </View>
        <Pressable
          className="bg-primary rounded-2xl py-4 px-10 flex-row items-center gap-2 active:opacity-80"
          style={{ borderCurve: "continuous" }}
          onPress={() => router.replace("/(auth)/sign-in" as RelativePathString)}
        >
          <Text className="text-primary-foreground font-bold">Back to Sign In</Text>
          <ArrowRight size={16} color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="#166534" />
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Header */}
          <View className="bg-primary px-5 pt-14 pb-12 gap-5">
            <Pressable
              className="w-10 h-10 bg-primary-foreground/20 rounded-2xl items-center justify-center active:opacity-70 self-start"
              style={{ borderCurve: "continuous" }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View className="items-center gap-3">
              <View className="w-20 h-20 bg-primary-foreground/15 rounded-3xl items-center justify-center" style={{ borderCurve: "continuous" }}>
                <Send size={38} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-primary-foreground tracking-tight">Reset Password</Text>
              <Text className="text-primary-foreground/70 text-sm text-center">
                Enter your email and we'll send you{"\n"}a secure reset link right away.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 pt-6 pb-10 gap-5">
            <View className="gap-2">
              <Text className="text-base font-bold text-foreground">Forgot your password?</Text>
              <Text className="text-sm text-muted-foreground">No worries — it happens to everyone.</Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Email Address</Text>
              <View className="flex-row items-center border border-border rounded-2xl bg-card px-4 gap-3" style={{ borderCurve: "continuous" }}>
                <Mail size={18} color="#166534" />
                <TextInput
                  className="flex-1 py-4 text-base text-foreground"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
              </View>
            </View>

            {error ? (
              <View className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            ) : null}

            <Pressable
              className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-85"
              style={{ borderCurve: "continuous" }}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-primary-foreground text-base font-bold">Send Reset Link</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </Pressable>

            <Pressable
              className="border border-border rounded-2xl py-4 items-center active:opacity-70"
              style={{ borderCurve: "continuous" }}
              onPress={() => router.back()}
            >
              <Text className="text-foreground text-sm font-semibold">Back to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
