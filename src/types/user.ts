import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  avatar: string;
  university: string;
  major: string;
  semester: number;
  bio?: string;
  createdAt: Timestamp;
}
