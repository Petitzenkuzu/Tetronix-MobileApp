import { View, Text, StyleSheet, Pressable, Modal, TextInput, Alert } from 'react-native';
import { User } from '@/types/auth';
import { useRef, useState, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat,Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { router, useRouter } from 'expo-router';
import { GameStats } from '@/types/gameTypes';
import { Image } from 'expo-image';
import { useApi } from '@/hooks/useApi';
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

export default function Profile({user, gameStats}: {user: User, gameStats: GameStats|null}) {
    const animationProgression = useSharedValue(0);
    const amplitude = 5;
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
            <ReplayModal user={user} gameStats={gameStats} />
        </View>
    );
}

async function getGameStats(name: string) {
    try {
        const api = await useApi();
        const response = await api.get(`/game/stats/${name}`);
        return response.data;
    } catch (error) {
        return null;
    }
    
}
function ReplayModal({user, gameStats}: {user: User, gameStats: GameStats|null}) {
    const modalStyles = StyleSheet.create({
        modalContainer: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: 300,
            height: 300,
            borderRadius: 20,
            backgroundColor: 'black',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            gap: 10,
        },
        selfReplayView: {
            width: 200,
            height: 50,
            backgroundColor: '#57B9FF',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'row',
            borderRadius: 10,
        },
        selfReplayText: {
            color: "white",
            fontSize: 24,
            textAlign: 'center',
            fontFamily: 'Quicksand',
        },
        selfReplayImage: {
            width: 25,
            height: 25,
            tintColor: 'white',
        },
        OtherReplayView: {
            width : 200,
            height: 50,
            marginRight: 5,
            backgroundColor: 'white',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexDirection: 'row',
            borderRadius: 10,
        },
        OtherReplayText: {
            color: "black",
            fontSize: 24,
            textAlign: 'center',
            fontFamily: 'Quicksand',
        },
        OtherReplayImageContainer: {
            width: 50,
            height: 50,
            tintColor: 'white',
            backgroundColor: 'red',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        OtherReplayContainer: {
            width: 200,
            height: 50,
            justifyContent: 'center',
            flexDirection: 'row',
        },
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const playerName = useRef('');

    // reset notFound après 3 secondes et remets le textInput
    useEffect(() => {
        if (notFound) {
            const timeout = setTimeout(() => {
                setnotFound(false);
            }, 3000);
            return () => {
                clearTimeout(timeout);
            }
        }
    }, [notFound]);
    
    return (
        <>
        <Pressable style={styles.replayBodyButton} onPress={() => {
            setModalVisible(true);
        }}>
            <Text style={styles.replayBodyButtonText}>REPLAY</Text>
        </Pressable>
        <Modal visible={modalVisible} transparent={true} animationType="slide">
                <Pressable onPress={() => {
                    setModalVisible(false);
                }}>
                <View style={modalStyles.modalContainer}>
                    <Pressable onPress={() => {}}>
                        <View style={modalStyles.modalContent}>
                        {gameStats ? 
                            <Pressable onPress={() => {
                                router.push({
                                    pathname: "/replayGame/[gameOwner]",
                                    params: {
                                        gameOwner: user.name,
                                    }
                                });
                            }}>
                                <View style={modalStyles.selfReplayView}>
                                    <Text style={modalStyles.selfReplayText}>YOUR REPLAY</Text>
                                    <Image 
                                        source={require('@/assets/images/play.png')} 
                                        style={modalStyles.selfReplayImage} 
                                        contentFit='contain' 
                                    />
                                </View>
                            </Pressable>
                                : 
                            <View style={[modalStyles.selfReplayView, {backgroundColor: 'red'}]}>
                                <Text style={modalStyles.selfReplayText}>NO SELF REPLAY</Text>
                            </View>
                        }
                            <Text style={{color: 'white', fontSize: 24, textAlign: 'center', fontFamily: 'Quicksand'}}>------------ OR ------------</Text>
                            <View style={modalStyles.OtherReplayContainer}>
                                {!notFound ? (
                                <View style={modalStyles.OtherReplayView}>
                                    <TextInput 
                                        style={modalStyles.OtherReplayText} 
                                        placeholder='Enter a name' 
                                        placeholderTextColor='black'  
                                        onChangeText={(text) => {
                                            playerName.current = text;
                                        }}
                                    />
                                </View>
                                ) : (
                                    <Animated.View entering={FadeIn} exiting={FadeOut} style={[modalStyles.OtherReplayView, {backgroundColor: 'red'}]}>
                                        <Text style={modalStyles.OtherReplayText}>NOT FOUND !</Text>
                                    </Animated.View>
                                )}
                            <Pressable 
                            onPress={async () => {
                                if (playerName.current.trim()) {
                                    const gameStats = await getGameStats(playerName.current.trim());
                                    if (gameStats) {
                                    router.push({
                                        pathname: "/replayGame/[gameOwner]",
                                        params: {
                                                gameOwner: playerName.current.trim(),
                                            }
                                        });
                                    } else {
                                        setnotFound(true);
                                    }
                                }
                            }}>
                                <View style={modalStyles.OtherReplayImageContainer}>
                                        <Image 
                                            source={require('@/assets/images/play.png')} 
                                            style={modalStyles.selfReplayImage} 
                                            contentFit='contain' 
                                        />
                                    </View>
                                </Pressable>
                            </View>
                            
                        </View>
                    </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}
