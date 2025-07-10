import { Platform } from "react-native";
import * as Device from "expo-device";

export default function useBackendUrl() : string {
  return process.env.EXPO_PUBLIC_BACKEND_URL || "";
}