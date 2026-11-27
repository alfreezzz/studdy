import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  let redirectTo: "/login" | "/onboarding" | "/" | null = null;

  if (status === "signedOut" && !isAuthPage) {
    redirectTo = "/login";
  } else if (status === "needsOnboarding" && pathname !== "/onboarding") {
    redirectTo = "/onboarding";
  } else if (status === "ready" && (isAuthPage || pathname === "/onboarding")) {
    redirectTo = "/";
  }

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  if (status === "loading" || redirectTo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
