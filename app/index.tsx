import { ImageBackground, Text, View, Button, Image } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "@/types/auth";
import { useApi } from "@/hooks/useApi";
import BandeauUtilisateur from "@/components/BandeauUtilisateur";
import NavBar from "@/components/NavBar";
import Pager from "@/components/homePage/Pager";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import LoadingPage from "@/components/loadingPage";
import { GameStats } from "@/types/gameTypes";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [actualPage, setActualPage] = useState<string>("home");
  const [isReady, setIsReady] = useState(false);
  function handlePageChange(page: number) {
    switch (page) {
      case 0:
        setActualPage("profile");
        break;
      case 1:
        setActualPage("home");
        break;
      case 2:
        setActualPage("leaderboard");
        break;
    }
  }

  const handleLogout = async () => {
    setUser(null);
    const api = await useApi();
    await api.post(`/services/logout`);
    router.push("/login");
  }

    const [fontsLoaded,error] = useFonts({
      'Quicksand': require('@/assets/fonts/Quicksand-Light.ttf'),
      'Neoneon': require('@/assets/fonts/Neoneon.otf'),
    });
    useEffect(() => {
      if (fontsLoaded || error) {
        SplashScreen.hideAsync();
        setIsReady(true);
      }
    }, [fontsLoaded, error]);

  // fetch un user et le leaderboard
  const fetchInfo = useCallback(async () => {
    try {
      const api = await useApi();
      const response = await api.get(`/services/user`);
      setUser(response.data);
      const leaderboard = await api.get(`/services/leaderboard`);
      setLeaderboard(leaderboard.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    }
    try{
      const api = await useApi();
      const response = await api.get(`/services/game_stats`);
      setGameStats(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        console.error("Erreur lors de la récupération des stats du jeu:", error);
      }
    }
  }, [router]);

  useEffect(() => {
    if (isReady) {
      fetchInfo();
    }
  }, [isReady, fetchInfo]);

  // re fetch un user si y'en a pas en revenant sur la page d'accueil
  useFocusEffect(
    useCallback(() => {
      if (isReady) {
        fetchInfo();
      }
    }, [isReady, fetchInfo])
  );

  const styles = StyleSheet.create({
    image: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      
    }
  })
  return (
      <ImageBackground source={require("@/assets/images/backGround5.png")} style={styles.image} blurRadius={3}> 
          {
            user ? (
              <SafeAreaView style={{height:'100%', width:'100%', justifyContent: "center", alignItems: "center"}}>
              <View style={{width:'100%', height:'100%', justifyContent: "center", alignItems: "center"}}>
                <View style={{height:'15%', width:'100%'}}>
                  <BandeauUtilisateur user={user} handleLogout={handleLogout}/>
                </View>
                <View style={{height:'70%', width:'100%'}}>
                  <Pager user={user} leaderboard={leaderboard} gameStats={gameStats} handlePageChange={handlePageChange} />
                </View>
                <NavBar actualPage={actualPage}/>
              </View>
              </SafeAreaView>
            ) : (
              <LoadingPage />
            )
          }
      </ImageBackground>
  );
}
