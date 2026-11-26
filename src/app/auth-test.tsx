import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import type { User } from "firebase/auth";

import {
    login,
    logout,
    observeAuthState,
    register,
} from "@/services/firebase/authService";

export default function AuthTestScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(setUser);

    return unsubscribe;
  }, []);

  const handleRegister = async () => {
    try {
      setLoading(true);

      const user = await register(email, password);

      Alert.alert("Berhasil", `Akun dibuat: ${user.uid}`);
    } catch (error: any) {
      Alert.alert("Register gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const user = await login(email, password);

      Alert.alert("Berhasil", `Login: ${user.email}`);
    } catch (error: any) {
      Alert.alert("Login gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Berhasil", "Kamu sudah logout.");
    } catch (error: any) {
      Alert.alert("Logout gagal", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studdy Authentication Test</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.button}>
        <Button title="Register" onPress={handleRegister} disabled={loading} />
      </View>

      <View style={styles.button}>
        <Button title="Login" onPress={handleLogin} disabled={loading} />
      </View>

      <View style={styles.button}>
        <Button
          title="Logout"
          onPress={handleLogout}
          disabled={loading || !user}
        />
      </View>

      <View style={styles.status}>
        <Text style={styles.subtitle}>Authentication Status</Text>

        <Text>{user ? "Logged In" : "Not Logged In"}</Text>

        {user && (
          <>
            <Text>Email: {user.email}</Text>
            <Text>UID: {user.uid}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    marginBottom: 12,
  },
  status: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
    gap: 8,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
