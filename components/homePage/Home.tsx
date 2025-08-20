import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from '@/types/auth';

const stylesLogo = StyleSheet.create({
    logo: {
        height:"90%",
        resizeMode: 'contain',
        //backgroundColor: 'red',
        aspectRatio: 1,
        zIndex: 1,
    },
    logoContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: "60%",
        overflow: 'hidden',
        marginTop: "5%",
        //backgroundColor: 'blue',
        
    },
})
const stylesButton = StyleSheet.create({
    button: {
        width: 175,
        height: 75,
        //backgroundColor: '#c463ff',
        borderWidth: 2,
        borderColor: '#10f8ff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: "20%",
        paddingLeft: 5,
        paddingBottom: 5,
    },
    text: {
        color: '#10f8ff',
        fontSize: 58,
        fontFamily: 'Neoneon',
        textShadowOffset: {width: 0, height: 0},
        textShadowRadius: 800,
        textShadowColor: '#10f8ff',
    }
})
export default function Home({ user }: { user: User }) {
    const router = useRouter();
    return (
        <View style={{width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={stylesLogo.logoContainer}>
                <Image source={require('@/assets/images/logo.png')} style={stylesLogo.logo} />
            </View>
            <Pressable style={stylesButton.button}  onPress={() => {
                router.replace({
                    pathname: `/game`,
                    params: { 
                        userName: user.name,
                        userBestScore: user.best_score.toString(),
                        userHighestLevel: user.highest_level.toString(),
                        userNumberOfGames: user.number_of_games.toString()
                    }
                });
            }}> 
                <Text style={stylesButton.text} >PLAY !</Text>
            </Pressable>
        </View> 
    );
}