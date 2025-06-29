import { Platform } from "react-native";
import * as Device from "expo-device";

export default function useBackendUrl() : string {
  // Pour les tests sur téléphone réel, utilisez votre IP locale
  // Remplacez cette IP par l'IP de votre PC sur le réseau WiFi
  const LOCAL_IP = "192.168.1.97"; // Votre adresse IP actuelle
  
  if (__DEV__) {
    if (Platform.OS === "android") {
      if (Device.isDevice) {
        // Téléphone Android réel
        return `http://${LOCAL_IP}:8080`;
      } else {
        // Émulateur Android
        return "http://10.0.2.2:8080";
      }
    } else {
      // iOS ou autres plateformes
      return `http://${LOCAL_IP}:8080`;
    }
  } else {
    // En production, utilisez votre backend déployé
    return `http://${LOCAL_IP}:8080`;
    //return process.env.EXPO_PUBLIC_BACKEND_URL || `http://${LOCAL_IP}:8080`;
  }
}