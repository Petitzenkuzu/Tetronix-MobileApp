import { View, Text, StyleSheet, Pressable } from 'react-native';
import { User } from '@/types/auth';
import { Game } from '@/types/gameTypes';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat,Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { GameStats } from '@/types/gameTypes';
export default function Profile({user, gameStats}: {user: User, gameStats: GameStats|null}) {
    const animationProgression = useSharedValue(0);
    const amplitude = 5;
    const url = `/replayGame/${user.name}`;
    const router = useRouter();
    const animatedStyle = useAnimatedStyle(() => {
        const angle = animationProgression.value * 2 * Math.PI;
        const height = Math.cos(angle)* amplitude;
        return {
            transform: [{translateY: height}, {translateX: -height}]
        }
    })
    useEffect(() => {
        animationProgression.value = withRepeat(withTiming(1, {duration: 3000,easing: Easing.linear}), -1, false);
    }, []);
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '60%',
            marginBottom: '10%',
        },
        headerText: {
            color: "#e9e9e9",
            fontSize: 48,
            textAlign: 'center',
            borderBottomWidth: 2,
            borderColor: '#d5c5ff',
            fontFamily: 'Neoneon',
            paddingBottom: "5%",
        },
        body: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '75%',
            height: '40%',
            borderRadius: 50,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            gap: 15,
            marginBottom: '10%',
            borderWidth: 0.5,
            borderColor: 'white',
        },
        bodyText: {
            color: "#e9e9e9",
            fontSize: 26,
            textAlign: 'center',
            fontFamily: 'Quicksand',
        },
        replayBody: {
            flex: 1,
            borderRadius: 50,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 0.5,
            borderColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: '5%',
            paddingVertical: '5%',
            gap: 10,
        },
        replayBodyButton: {
            backgroundColor: '#d5c5ff',
            padding: 10,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        replayBodyButtonText: {
            color: "white",
            fontSize: 24,
            textAlign: 'center',
            fontFamily: 'Quicksand',
 
        }
    });
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Profile</Text>
            </View>
            <Animated.View style={[styles.body, animatedStyle]}>
                    <Text style={styles.bodyText}>Highest Score : {user?.best_score}</Text>
                    <Text style={styles.bodyText}>Highest Level : {user?.highest_level}</Text>
                    <Text style={styles.bodyText}>Games Played : {user?.number_of_games}</Text>
            </Animated.View>
            {gameStats && (
                    <Pressable style={styles.replayBodyButton} onPress={() => {
                        router.push({
                            pathname: "/replayGame/[gameOwner]",
                            params: {
                                gameOwner: user.name,
                            }
                        });
                    }}>
                        <Text style={styles.replayBodyButtonText}>REPLAY</Text>
                    </Pressable>
            )}
        </View>
    );
}