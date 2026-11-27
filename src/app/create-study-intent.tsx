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

import { createStudyIntent } from "@/services/firebase/studyIntentService";

import type {
    CreateStudyIntentData,
    MentorDirection,
    PreferredMode,
    StudyIntentType,
} from "@/types/study-intent";

const SCHEDULE_OPTIONS = [
  { label: "Weekday Morning", value: "weekday_morning" },
  { label: "Weekday Afternoon", value: "weekday_afternoon" },
  { label: "Weekday Evening", value: "weekday_evening" },
  { label: "Weekend", value: "weekend" },
];

export default function CreateStudyIntentScreen() {
  const [type, setType] = useState<StudyIntentType>("study_buddy");
  const [mentorDirection, setMentorDirection] =
    useState<MentorDirection>("seeking_mentor");

  const [courseName, setCourseName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");

  const [preferredMode, setPreferredMode] = useState<PreferredMode>("both");

  const [preferredSchedule, setPreferredSchedule] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const toggleSchedule = (value: string) => {
    setPreferredSchedule((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const handleSubmit = async () => {
    if (
      !courseName.trim() ||
      !topic.trim() ||
      !description.trim() ||
      !goal.trim()
    ) {
      Alert.alert("Perhatian", "Semua kolom harus diisi.");
      return;
    }

    if (preferredSchedule.length === 0) {
      Alert.alert("Perhatian", "Pilih minimal satu jadwal.");
      return;
    }

    const data: CreateStudyIntentData = {
      type,
      courseName,
      topic,
      description,
      goal,
      preferredMode,
      preferredSchedule,
      ...(type === "peer_mentor" ? { mentorDirection } : {}),
      status: "active",
    };

    try {
      setLoading(true);

      const intentId = await createStudyIntent(data);

      Alert.alert(
        "Berhasil",
        `Study Intent berhasil dibuat.\nID: ${intentId}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";

      Alert.alert("Gagal membuat Study Intent", message);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.option, selected && styles.selectedOption]}
    >
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Study Intent</Text>
        <Text style={styles.subtitle}>
          Ceritakan kebutuhan akademismu untuk menemukan teman belajar yang
          cocok.
        </Text>

        <Text style={styles.label}>Jenis kebutuhan</Text>
        <View style={styles.optionsContainer}>
          {renderOption("Study Buddy", type === "study_buddy", () =>
            setType("study_buddy"),
          )}

          {renderOption("Project Partner", type === "project_partner", () =>
            setType("project_partner"),
          )}

          {renderOption("Peer Mentor", type === "peer_mentor", () =>
            setType("peer_mentor"),
          )}
        </View>

        {type === "peer_mentor" && (
          <>
            <Text style={styles.label}>Kebutuhan mentoring</Text>
            <View style={styles.optionsContainer}>
              {renderOption(
                "Mencari Mentor",
                mentorDirection === "seeking_mentor",
                () => setMentorDirection("seeking_mentor"),
              )}

              {renderOption(
                "Menawarkan Mentoring",
                mentorDirection === "offering_mentorship",
                () => setMentorDirection("offering_mentorship"),
              )}
            </View>
          </>
        )}

        <Text style={styles.label}>Mata kuliah</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Struktur Data"
          value={courseName}
          onChangeText={setCourseName}
        />

        <Text style={styles.label}>Topik</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Linked List"
          value={topic}
          onChangeText={setTopic}
        />

        <Text style={styles.label}>Deskripsi kebutuhan</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Ceritakan apa yang ingin kamu cari..."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Target belajar</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Memahami konsep Linked List"
          value={goal}
          onChangeText={setGoal}
        />

        <Text style={styles.label}>Metode belajar</Text>
        <View style={styles.optionsContainer}>
          {renderOption("Online", preferredMode === "online", () =>
            setPreferredMode("online"),
          )}

          {renderOption("Offline", preferredMode === "offline", () =>
            setPreferredMode("offline"),
          )}

          {renderOption("Both", preferredMode === "both", () =>
            setPreferredMode("both"),
          )}
        </View>

        <Text style={styles.label}>Jadwal tersedia</Text>
        <View style={styles.optionsContainer}>
          {SCHEDULE_OPTIONS.map((item) =>
            renderOption(
              item.label,
              preferredSchedule.includes(item.value),
              () => toggleSchedule(item.value),
            ),
          )}
        </View>

        <Pressable
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Intent</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 21,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 8,
  },
  multilineInput: {
    minHeight: 100,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  selectedOption: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  optionText: {
    color: "#333",
    fontSize: 13,
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
