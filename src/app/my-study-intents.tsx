import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    deleteStudyIntent,
    getMyStudyIntents,
    updateStudyIntentStatus,
} from "@/services/firebase/studyIntentService";

import type { StudyIntent, StudyIntentStatus } from "@/types/study-intent";

export default function MyStudyIntentsScreen() {
  const [intents, setIntents] = useState<StudyIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchIntents = useCallback(async () => {
    try {
      const data = await getMyStudyIntents();
      setIntents(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";

      Alert.alert("Gagal mengambil data", message);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchIntents();
      setLoading(false);
    };

    initialize();
  }, [fetchIntents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIntents();
    setRefreshing(false);
  };

  const handleStatusChange = async (
    intentId: string,
    status: StudyIntentStatus,
  ) => {
    try {
      setProcessingId(intentId);

      await updateStudyIntentStatus(intentId, status);

      setIntents((current) =>
        current.map((intent) =>
          intent.id === intentId ? { ...intent, status } : intent,
        ),
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";

      Alert.alert("Gagal mengubah status", message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (intent: StudyIntent) => {
    Alert.alert(
      "Hapus Study Intent?",
      `Apakah kamu yakin ingin menghapus intent "${intent.courseName}"?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(intent.id);

              await deleteStudyIntent(intent.id);

              setIntents((current) =>
                current.filter((item) => item.id !== intent.id),
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Terjadi kesalahan.";

              Alert.alert("Gagal menghapus intent", message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: StudyIntentStatus) => {
    switch (status) {
      case "active":
        return "#16a34a";
      case "paused":
        return "#d97706";
      case "closed":
        return "#6b7280";
    }
  };

  const formatLabel = (value: string) => {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderIntent = (intent: StudyIntent) => {
    const isProcessing = processingId === intent.id;

    return (
      <View key={intent.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.courseName}>{intent.courseName}</Text>

            <Text style={styles.type}>
              {formatLabel(intent.type)} · {intent.topic}
            </Text>
          </View>

          <Text
            style={[styles.status, { color: getStatusColor(intent.status) }]}
          >
            {formatLabel(intent.status)}
          </Text>
        </View>

        <Text style={styles.description}>{intent.description}</Text>

        <View style={styles.detailContainer}>
          <Text style={styles.detail}>Target: {intent.goal}</Text>

          <Text style={styles.detail}>
            Mode: {formatLabel(intent.preferredMode)}
          </Text>

          <Text style={styles.detail}>
            Jadwal: {intent.preferredSchedule.map(formatLabel).join(", ")}
          </Text>

          {intent.mentorDirection && (
            <Text style={styles.detail}>
              Mentoring: {formatLabel(intent.mentorDirection)}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {intent.status !== "active" && (
            <Pressable
              style={styles.actionButton}
              disabled={isProcessing}
              onPress={() => handleStatusChange(intent.id, "active")}
            >
              <Text style={styles.actionText}>Activate</Text>
            </Pressable>
          )}

          {intent.status === "active" && (
            <Pressable
              style={styles.actionButton}
              disabled={isProcessing}
              onPress={() => handleStatusChange(intent.id, "paused")}
            >
              <Text style={styles.actionText}>Pause</Text>
            </Pressable>
          )}

          {intent.status !== "closed" && (
            <Pressable
              style={styles.actionButton}
              disabled={isProcessing}
              onPress={() => handleStatusChange(intent.id, "closed")}
            >
              <Text style={styles.actionText}>Close</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            disabled={isProcessing}
            onPress={() => handleDelete(intent)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>

        {isProcessing && <ActivityIndicator style={styles.processing} />}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Memuat Study Intent...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>My Study Intents</Text>

      <Text style={styles.subtitle}>
        Kelola semua kebutuhan akademis yang kamu buat.
      </Text>

      {intents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Belum ada Study Intent</Text>

          <Text style={styles.emptyDescription}>
            Buat Study Intent pertamamu untuk mulai mencari teman belajar.
          </Text>
        </View>
      ) : (
        intents.map(renderIntent)
      )}

      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/create-study-intent")}
      >
        <Text style={styles.createButtonText}>+ Create New Intent</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  type: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  detailContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  detail: {
    fontSize: 13,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteButton: {
    borderColor: "#dc2626",
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 12,
  },
  processing: {
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  emptyTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
