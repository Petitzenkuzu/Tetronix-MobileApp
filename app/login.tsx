import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ImageBackground } from "react-native";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { makeRedirectUri,useAuthRequest } from "expo-auth-session";
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
      scopes: [],
    },
    discovery
  );

async function login(params: string){
  try {
    let response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL || ""}/auth/github_mobile?${params}`);
    console.log(response.data);
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
    <ImageBackground source={require("@/assets/images/backGround5.png")} style={{flex:1,justifyContent : "center", alignItems : "center"}}>
      <SafeAreaView>
          <Image source={require("@/assets/images/tetronixLogo.png")} style={{width: 200, height: 200}}/>
          <View>
            <Button title="Login" onPress={() => promptAsync()}/>
          </View>
      </SafeAreaView>
    </ImageBackground>
  );
}