import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import type { UserProfile } from "@/types/user";
import { db } from "./firestore";

type CreateUserProfileData = Omit<UserProfile, "uid" | "createdAt">;

// Create user profile
export const createUserProfile = async (
  uid: string,
  data: CreateUserProfileData,
): Promise<void> => {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
};

// Get user profile
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
};
