import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth } from "./auth";
import { db } from "./firestore";

import type {
  DiscoverableStudyIntent,
  StudyIntent,
} from "@/types/study-intent";

export const getDiscoverableStudyIntents = async (): Promise<
  DiscoverableStudyIntent[]
> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Kamu harus login terlebih dahulu.");
  }

  const intentQuery = query(
    collection(db, "studyIntents"),
    where("status", "==", "active"),
  );

  const snapshot = await getDocs(intentQuery);

  const otherIntents = snapshot.docs
    .map(
      (document) =>
        ({
          ...document.data(),
          id: document.id,
        }) as StudyIntent,
    )
    .filter((intent) => intent.ownerUid !== currentUser.uid);

  const results: (DiscoverableStudyIntent | null)[] = await Promise.all(
    otherIntents.map(
      async (intent): Promise<DiscoverableStudyIntent | null> => {
        const userRef = doc(db, "users", intent.ownerUid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          return null;
        }

        const profile = userSnapshot.data();

        return {
          ...intent,
          ownerProfile: {
            username: profile.username,
            fullName: profile.fullName,
            avatar: profile.avatar,
            university: profile.university,
            major: profile.major,
            semester: profile.semester,
            bio: profile.bio,
          },
        };
      },
    ),
  );

  return results.filter(
    (item): item is DiscoverableStudyIntent => item !== null,
  );
};
