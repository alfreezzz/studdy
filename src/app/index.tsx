import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/services/firebase/authService";

export default function IndexScreen() {
  const { status, profile, refreshProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert(
        "Logout gagal",
        error instanceof Error ? error.message : "Terjadi kesalahan.",
      );
    }
  };

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.message}>Memeriksa akun Studdy...</Text>
      </View>
    );
  }

  if (status === "signedOut") {
    return <Redirect href="/login" />;
  }

  if (status === "needsOnboarding") {
    return <Redirect href="/onboarding" />;
  }

  if (status === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Gagal memuat profil</Text>
        <Text style={styles.message}>
          Periksa koneksi internet dan coba kembali.
        </Text>

        <Pressable style={styles.button} onPress={() => void refreshProfile()}>
          <Text style={styles.buttonText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Selamat datang, {profile?.username}!</Text>

      <Text style={styles.message}>Profil Studdy berhasil dimuat.</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111",
    textAlign: "center",
  },
  message: {
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
