import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ImageBackground } from "react-native";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { makeRedirectUri,useAuthRequest,Prompt } from "expo-auth-session";
import { useEffect } from "react";
import axios from "axios";

export default function Login() {
  const router = useRouter();

  const discovery = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || ""}`,
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || "",
      redirectUri: makeRedirectUri({scheme :"tetronix"}),
      prompt : Prompt.Consent,
      scopes: [],
    },
    discovery
  );

async function login(params: string){
  try {
    console.log("params",params);
    let response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL || ""}/auth/github?${params}`);
    console.log(response.data);
    if(response.status === 200){
      router.push("/");
    }

  } 
  catch (error:any) {
      console.log("erreur",error);
  }
  
}

  useEffect(() => {
    if (response?.type === "success") {
      const {code} = response.params;
      const params = new URLSearchParams({
        code : code,
        redirect_uri : makeRedirectUri({scheme :"tetronix"})
      });
      login(params.toString());
    }
    
  }, [response]);

  return (
    <ImageBackground source={require("@/assets/images/backGround5.png")} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} contentFit="contain"/>
        </View>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.buttonPressable} onPress={() => promptAsync()}>
                <Text style={styles.buttonText}>LOGIN WITH GITHUB</Text>
                <Image source={require("@/assets/images/github-mark.png")} style={styles.githubIcon} contentFit="contain"/>
            </Pressable>
          </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%", 
    justifyContent : "center", 
    alignItems : "center"
  },
  logoContainer: {
    width: "85%",
    height: "40%",
    justifyContent : "center",
    alignItems : "center"
  },
  logo: {
    width: "100%",
    height: 100,
  },
  buttonContainer: {
    width: "100%",
    height: "20%",
    justifyContent : "center",
    alignItems : "center",
  },
  buttonPressable: {
    height: 60,
    borderRadius: 20,
    justifyContent : "center",
    alignItems : "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    flexDirection: "row",
    gap: 10
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Quicksand"
  },
  githubIcon: {
    height: 50,
    width: 50,
    tintColor: "white"
  }
});