import { useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    Text,
    View,
} from "react-native";

import { getRecommendedStudyIntents } from "@/services/firebase/recommendationService";
import type { RankedStudyIntent } from "@/types/study-intent";

export default function RecommendationTestScreen() {
  const [results, setResults] = useState<RankedStudyIntent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    try {
      setLoading(true);

      const data = await getRecommendedStudyIntents();

      setResults(data);
    } catch (error) {
      console.error("Recommendation error:", error);
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
        Recommendation Test
      </Text>

      <Button title="Load Recommendations" onPress={handleLoad} />

      {loading && <ActivityIndicator style={{ margin: 16 }} />}

      <Text style={{ color: "#334155", marginVertical: 16 }}>
        Total: {results.length}
      </Text>

      {results.map((intent) => (
        <View
          key={intent.id}
          style={{
            padding: 16,
            marginBottom: 12,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#0f172a",
            }}
          >
            {intent.ownerProfile.fullName}
          </Text>

          <Text style={{ color: "#64748b" }}>
            {intent.courseName} — {intent.topic}
          </Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#16a34a",
              marginTop: 8,
            }}
          >
            {intent.compatibilityScore}% Match
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
