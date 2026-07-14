import { Component } from "react";
import { Text, View, Pressable } from "react-native";
import { GraduationCap, RefreshCw } from "lucide-react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    // Sentry is already wired at the root — this just ensures we catch anything it misses
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background items-center justify-center px-8 gap-6">
          <View className="w-20 h-20 bg-destructive/10 rounded-full items-center justify-center">
            <GraduationCap size={40} color="#DC2626" />
          </View>
          <View className="gap-2 items-center">
            <Text className="text-xl font-bold text-foreground text-center">
              Something went wrong
            </Text>
            <Text className="text-sm text-muted-foreground text-center leading-6">
              EduAssist AI hit an unexpected error. Tap below to try again — your documents are safe.
            </Text>
          </View>
          {this.state.error ? (
            <View className="bg-muted rounded-xl px-4 py-3 w-full">
              <Text className="text-xs text-muted-foreground font-mono" numberOfLines={3}>
                {this.state.error}
              </Text>
            </View>
          ) : null}
          <Pressable
            className="bg-primary rounded-xl py-4 px-8 flex-row items-center gap-2 active:opacity-80"
            style={{ borderCurve: "continuous" }}
            onPress={this.handleReset}
          >
            <RefreshCw size={18} color="#fff" />
            <Text className="text-primary-foreground font-semibold text-base">Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
