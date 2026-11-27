import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { auth } from "./auth";
import { db } from "./firestore";

import type {
    CreateStudyIntentData,
    StudyIntent,
    StudyIntentStatus,
} from "@/types/study-intent";

const STUDY_INTENTS_COLLECTION = "studyIntents";

// Memastikan pengguna sudah login
const getCurrentUid = (): string => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Kamu harus login terlebih dahulu.");
  }

  return user.uid;
};

// 1. Membuat Study Intent
export const createStudyIntent = async (
  data: CreateStudyIntentData,
): Promise<string> => {
  const uid = getCurrentUid();

  if (
    !data.courseName.trim() ||
    !data.topic.trim() ||
    !data.description.trim() ||
    !data.goal.trim()
  ) {
    throw new Error("Semua informasi Study Intent harus diisi.");
  }

  if (data.type === "peer_mentor" && !data.mentorDirection) {
    throw new Error("Pilih apakah kamu mencari atau menawarkan mentor.");
  }

  const intentRef = await addDoc(collection(db, STUDY_INTENTS_COLLECTION), {
    ...data,
    courseName: data.courseName.trim(),
    topic: data.topic.trim(),
    description: data.description.trim(),
    goal: data.goal.trim(),
    ownerUid: uid,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return intentRef.id;
};

// 2. Mengambil Study Intent milik pengguna
export const getMyStudyIntents = async (): Promise<StudyIntent[]> => {
  const uid = getCurrentUid();

  const intentQuery = query(
    collection(db, STUDY_INTENTS_COLLECTION),
    where("ownerUid", "==", uid),
  );

  const snapshot = await getDocs(intentQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as StudyIntent[];
};

// 3. Mengubah status Study Intent
export const updateStudyIntentStatus = async (
  intentId: string,
  status: StudyIntentStatus,
): Promise<void> => {
  getCurrentUid();

  const intentRef = doc(db, STUDY_INTENTS_COLLECTION, intentId);

  await updateDoc(intentRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// 4. Menghapus Study Intent
export const deleteStudyIntent = async (intentId: string): Promise<void> => {
  getCurrentUid();

  const intentRef = doc(db, STUDY_INTENTS_COLLECTION, intentId);

  await deleteDoc(intentRef);
};
