import { rankStudyIntents } from "./compatibilityService";
import { getDiscoverableStudyIntents } from "./discoveryService";
import { getMyStudyIntents } from "./studyIntentService";

import type { RankedStudyIntent } from "@/types/study-intent";

export const getRecommendedStudyIntents = async (): Promise<
  RankedStudyIntent[]
> => {
  // Ambil Study Intent milik pengguna.
  const myIntents = await getMyStudyIntents();

  if (myIntents.length === 0) {
    return [];
  }

  // Ambil Study Intent pengguna lain.
  const candidates = await getDiscoverableStudyIntents();

  // Hitung skor setiap kandidat terhadap semua intent pengguna.
  const bestScores = new Map<string, RankedStudyIntent>();

  for (const myIntent of myIntents) {
    const ranked = rankStudyIntents(myIntent, candidates);

    for (const candidate of ranked) {
      const previous = bestScores.get(candidate.id);

      if (
        !previous ||
        candidate.compatibilityScore > previous.compatibilityScore
      ) {
        bestScores.set(candidate.id, candidate);
      }
    }
  }

  // Urutkan berdasarkan skor tertinggi.
  return Array.from(bestScores.values()).sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore,
  );
};
