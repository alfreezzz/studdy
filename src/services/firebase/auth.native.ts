import type { FirebaseError } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  type Auth,
  // @ts-expect-error This export is available only in Firebase's React Native entry point.
  getReactNativePersistence,
} from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import app from "./config";

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if ((error as FirebaseError).code !== "auth/already-initialized") {
    throw error;
  }

  auth = getAuth(app);
}

export { auth };
