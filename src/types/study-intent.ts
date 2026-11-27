import type { Timestamp } from "firebase/firestore";

export type StudyIntentType = "study_buddy" | "project_partner" | "peer_mentor";

export type MentorDirection = "seeking_mentor" | "offering_mentorship";

export type PreferredMode = "online" | "offline" | "both";

export type StudyIntentStatus = "active" | "paused" | "closed";

export interface StudyIntent {
  id: string;
  ownerUid: string;

  type: StudyIntentType;
  courseName: string;
  topic: string;
  description: string;
  goal: string;

  preferredMode: PreferredMode;
  preferredSchedule: string[];

  mentorDirection?: MentorDirection;

  status: StudyIntentStatus;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateStudyIntentData = Omit<
  StudyIntent,
  "id" | "ownerUid" | "createdAt" | "updatedAt"
>;

export interface DiscoverableStudyIntent extends StudyIntent {
  ownerProfile: {
    username: string;
    fullName: string;
    avatar: string;
    university: string;
    major: string;
    semester: number;
    bio?: string;
  };
}

export interface RankedStudyIntent extends DiscoverableStudyIntent {
  compatibilityScore: number;
}
