import { useState, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Link } from "expo-router";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import { supabase } from "@/client/supabase";

const HERO_IMG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3d73cd62-75e6-4dec-acc9-345764868338.jpg";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace("/");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
        >
          {/* Hero with image */}
          <View style={{ height: 280 }}>
            <Image source={{ uri: HERO_IMG }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
            <LinearGradient
              colors={["rgba(5,46,22,0.75)", "rgba(5,46,22,0.6)", "rgba(5,46,22,0.92)"]}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="flex-1 px-6 pt-16 pb-8 justify-between">
              {/* Logo */}
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center" style={{ borderCurve: "continuous" }}>
                  <GraduationCap size={24} color="#fff" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">EduAssist AI</Text>
                  <View className="flex-row items-center gap-1">
                    <Sparkles size={9} color="#FCD34D" />
                    <Text className="text-white/70 text-xs">Powered by Gemini 2.5</Text>
                  </View>
                </View>
              </View>
              {/* Welcome copy */}
              <View className="gap-1">
                <Text className="text-white text-3xl font-bold tracking-tight">Welcome back!</Text>
                <Text className="text-white/75 text-sm leading-5">
                  Sign in to continue creating professional teaching materials.
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 pt-6 pb-10 gap-4">
            <View className="gap-1">
              <Text className="text-lg font-bold text-foreground">Sign in to your account</Text>
              <Text className="text-sm text-muted-foreground">Enter your credentials below</Text>
            </View>

            {/* Email */}
            <View className="gap-1.5">
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
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password */}
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Password</Text>
              <View className="flex-row items-center border border-border rounded-2xl bg-card px-4 gap-3" style={{ borderCurve: "continuous" }}>
                <Lock size={18} color="#166534" />
                <TextInput
                  ref={passwordRef}
                  className="flex-1 py-4 text-base text-foreground"
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} className="p-1 active:opacity-60">
                  {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                </Pressable>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Forgot password */}
            <Link href={"/(auth)/forgot-password" as RelativePathString} asChild>
              <Pressable className="self-end active:opacity-60" onPress={() => {}}>
                <Text className="text-sm text-primary font-semibold">Forgot password?</Text>
              </Pressable>
            </Link>

            {/* Sign in button */}
            <Pressable
              className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-85"
              style={{ borderCurve: "continuous" }}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-primary-foreground text-base font-bold">Sign In</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground font-medium">OR</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Register */}
            <Pressable
              className="border border-border rounded-2xl py-4 items-center bg-card active:opacity-70"
              style={{ borderCurve: "continuous" }}
              onPress={() => router.push("/(auth)/sign-up" as RelativePathString)}
            >
              <Text className="text-foreground text-sm font-semibold">Create a New Account</Text>
            </Pressable>

            <Text className="text-center text-xs text-muted-foreground">
              Free to use · No credit card required
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
