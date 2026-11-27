import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/services/firebase/auth";
import { createUserProfile } from "@/services/firebase/userService";

const AVATARS = ["avatar_01", "avatar_02", "avatar_03", "avatar_04"];

export default function OnboardingScreen() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("avatar_01");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [semester, setSemester] = useState("1");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const { refreshProfile } = useAuth();

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Sesi tidak ditemukan", "Silakan login kembali.");
      router.replace("/login");
      return;
    }

    const parsedSemester = Number(semester);

    if (
      !username.trim() ||
      !fullName.trim() ||
      !university.trim() ||
      !major.trim()
    ) {
      Alert.alert("Data belum lengkap", "Lengkapi semua informasi wajib.");
      return;
    }

    if (
      !Number.isInteger(parsedSemester) ||
      parsedSemester < 1 ||
      parsedSemester > 14
    ) {
      Alert.alert("Semester tidak valid", "Masukkan semester 1–14.");
      return;
    }

    try {
      setLoading(true);

      await createUserProfile(user.uid, {
        username: username.trim(),
        fullName: fullName.trim(),
        avatar,
        university: university.trim(),
        major: major.trim(),
        semester: parsedSemester,
        bio: bio.trim(),
      });

      const profileReady = await refreshProfile();

      if (!profileReady) {
        throw new Error("Profil tersimpan, tetapi gagal dimuat kembali.");
      }

      Alert.alert("Berhasil", "Profil Studdy berhasil dibuat.", [
        {
          text: "Lanjutkan",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan profil.";

      Alert.alert("Gagal menyimpan profil", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Lengkapi Profilmu</Text>
        <Text style={styles.description}>
          Kenali calon study partner-mu dengan memberikan informasi akademik.
        </Text>

        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: alex123"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={20}
        />

        <Text style={styles.label}>Nama lengkap *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama lengkap"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Pilih avatar *</Text>
        <View style={styles.avatarContainer}>
          {AVATARS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setAvatar(item)}
              style={[
                styles.avatarOption,
                avatar === item && styles.avatarSelected,
              ]}
            >
              <Text>{item.replace("avatar_", "Avatar ")}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Universitas *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Universitas Pendidikan Indonesia"
          value={university}
          onChangeText={setUniversity}
        />

        <Text style={styles.label}>Program studi *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Ilmu Komputer"
          value={major}
          onChangeText={setMajor}
        />

        <Text style={styles.label}>Semester *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 1"
          value={semester}
          onChangeText={setSemester}
          keyboardType="number-pad"
          maxLength={2}
        />

        <Text style={styles.label}>Bio (opsional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Ceritakan sedikit tentang dirimu..."
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={160}
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Simpan Profil</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 28,
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111",
  },
  avatarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  avatarOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  avatarSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  bioInput: {
    height: 100,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
