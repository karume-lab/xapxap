import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Text variant="h2" className="text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            We encountered an unexpected error. Please try again.
          </Text>
          <Button onPress={() => this.setState({ hasError: false })} className="w-full">
            <Text>Try again</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
