import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { UserProfile } from "@/types/user";
import type { User } from "firebase/auth";

import { observeAuthState } from "@/services/firebase/authService";
import { getUserProfile } from "@/services/firebase/userService";

type AuthStatus =
  | "loading"
  | "signedOut"
  | "needsOnboarding"
  | "ready"
  | "error";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  refreshProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    const unsubscribe = observeAuthState(async (currentUser) => {
      if (!active) return;

      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setStatus("signedOut");
        return;
      }

      setStatus("loading");

      try {
        const userProfile = await getUserProfile(currentUser.uid);

        if (!active) return;

        setProfile(userProfile);
        setStatus(userProfile ? "ready" : "needsOnboarding");
      } catch (error) {
        console.error("Failed to fetch user profile:", error);

        if (active) {
          setStatus("error");
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async (): Promise<boolean> => {
    const currentUser = user;

    if (!currentUser) {
      setProfile(null);
      setStatus("signedOut");
      return false;
    }

    setStatus("loading");

    try {
      const userProfile = await getUserProfile(currentUser.uid);

      setProfile(userProfile);
      setStatus(userProfile ? "ready" : "needsOnboarding");

      return userProfile !== null;
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      setStatus("error");
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, status, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
