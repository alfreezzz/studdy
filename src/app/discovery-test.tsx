import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getDiscoverableStudyIntents } from "@/services/firebase/discoveryService";
import type { DiscoverableStudyIntent } from "@/types/study-intent";

export default function DiscoveryTestScreen() {
  const [intents, setIntents] = useState<DiscoverableStudyIntent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    try {
      setLoading(true);

      const data = await getDiscoverableStudyIntents();

      setIntents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#0f172a",
          marginBottom: 16,
        }}
      >
        Discovery Test
      </Text>

      <Button title="Load Study Intents" onPress={handleLoad} />

      {loading && <ActivityIndicator style={{ margin: 16 }} />}

      <Text
        style={{
          color: "#334155",
          marginVertical: 16,
        }}
      >
        Total: {intents.length}
      </Text>

      {intents.length === 0 ? (
        <Text style={{ color: "#64748b" }}>
          Belum ada Study Intent dari pengguna lain.
        </Text>
      ) : (
        intents.map((intent) => (
          <View
            key={intent.id}
            style={{
              padding: 16,
              marginBottom: 12,
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#0f172a",
              }}
            >
              {intent.courseName}
            </Text>

            <Text style={{ color: "#2563eb", marginTop: 4 }}>
              {intent.topic}
            </Text>

            <Text
              style={{
                color: "#475569",
                marginTop: 8,
              }}
            >
              {intent.description}
            </Text>

            <Text style={{ fontWeight: "bold", color: "#0f172a" }}>
              {intent.ownerProfile.fullName}
            </Text>

            <Text style={{ color: "#64748b" }}>
              @{intent.ownerProfile.username}
            </Text>

            <Text style={{ color: "#64748b" }}>
              {intent.ownerProfile.major} • Semester{" "}
              {intent.ownerProfile.semester}
            </Text>

            <Text style={{ color: "#64748b" }}>
              {intent.ownerProfile.university}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
