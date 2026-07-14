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
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, CheckCircle, Sparkles,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import type { RelativePathString } from "expo-router";
import { supabase } from "@/client/supabase";

const HERO_IMG = "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3d73cd62-75e6-4dec-acc9-345764868338.jpg";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
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
          <Text className="text-2xl font-bold text-foreground text-center">Check Your Email</Text>
          <Text className="text-sm text-muted-foreground text-center leading-6 px-4">
            We sent a verification link to{"\n"}
            <Text className="text-primary font-bold">{email}</Text>
          </Text>
        </View>
        <Pressable
          className="bg-primary rounded-2xl py-4 px-10 flex-row items-center gap-2 active:opacity-80"
          style={{ borderCurve: "continuous" }}
          onPress={() => router.replace("/(auth)/sign-in" as RelativePathString)}
        >
          <Text className="text-primary-foreground font-bold">Go to Sign In</Text>
          <ArrowRight size={16} color="#fff" />
        </Pressable>
      </View>
    );
  }

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
          <View style={{ height: 250 }}>
            <Image source={{ uri: HERO_IMG }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
            <LinearGradient
              colors={["rgba(5,46,22,0.75)", "rgba(5,46,22,0.6)", "rgba(5,46,22,0.92)"]}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="flex-1 px-6 pt-16 pb-8 justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center" style={{ borderCurve: "continuous" }}>
                  <GraduationCap size={24} color="#fff" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">EduAssist AI</Text>
                  <View className="flex-row items-center gap-1">
                    <Sparkles size={9} color="#FCD34D" />
                    <Text className="text-white/70 text-xs">Free to get started</Text>
                  </View>
                </View>
              </View>
              <View className="gap-1">
                <Text className="text-white text-3xl font-bold tracking-tight">Join EduAssist</Text>
                <Text className="text-white/75 text-sm leading-5">
                  Create professional teaching materials in seconds.
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 pt-6 pb-10 gap-4">
            <View className="gap-1">
              <Text className="text-lg font-bold text-foreground">Create your account</Text>
              <Text className="text-sm text-muted-foreground">It only takes a minute</Text>
            </View>

            {/* Full Name */}
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Full Name</Text>
              <View className="flex-row items-center border border-border rounded-2xl bg-card px-4 gap-3" style={{ borderCurve: "continuous" }}>
                <User size={18} color="#166534" />
                <TextInput
                  className="flex-1 py-4 text-base text-foreground"
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(t) => { setName(t); setError(""); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

            {/* Email */}
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Email Address</Text>
              <View className="flex-row items-center border border-border rounded-2xl bg-card px-4 gap-3" style={{ borderCurve: "continuous" }}>
                <Mail size={18} color="#166534" />
                <TextInput
                  ref={emailRef}
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
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
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

            {/* Submit */}
            <Pressable
              className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-85"
              style={{ borderCurve: "continuous" }}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-primary-foreground text-base font-bold">Create Account</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground">OR</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Sign in link */}
            <Pressable
              className="border border-border rounded-2xl py-4 items-center active:opacity-70"
              style={{ borderCurve: "continuous" }}
              onPress={() => router.push("/(auth)/sign-in" as RelativePathString)}
            >
              <Text className="text-foreground text-sm font-semibold">Already have an account? Sign In</Text>
            </Pressable>

            <Text className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our Terms of Service
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
