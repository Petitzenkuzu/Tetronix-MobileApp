import { View, Image, StyleSheet, Pressable } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import { useEffect } from "react";
import PagerView from 'react-native-pager-view';
import { setPage } from "./homePage/Pager";
export default function NavBar({actualPage}: {actualPage: string}) {
    const profileY = useSharedValue(0);
    const homeY = useSharedValue(0);
    const leaderboardY = useSharedValue(0);
    const profileScale = useSharedValue(1);
    const homeScale = useSharedValue(1);
    const leaderboardScale = useSharedValue(1);
    useEffect(() => {
        if (actualPage === "profile") {
            profileY.value = withSpring(-20, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            profileScale.value = withTiming(1.4, {duration: 250});
        } else {
            profileY.value = withSpring(0, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            profileScale.value = withTiming(1, {duration: 250});
        }

        if (actualPage === "home") {
            homeY.value = withSpring(-20, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            homeScale.value = withTiming(1.4, {duration: 250});
        } else {
            homeY.value = withSpring(0, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            homeScale.value = withTiming(1, {duration: 250});
        }

        if (actualPage === "leaderboard") {
            leaderboardY.value = withSpring(-20, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            leaderboardScale.value = withTiming(1.4, {duration: 250});
        } else {
            leaderboardY.value = withSpring(0, {damping: 10, stiffness: 100, velocity: 100, mass: 1});
            leaderboardScale.value = withTiming(1, {duration: 250});
        }
    }, [actualPage]);

    const profileAnimatedStyle = useAnimatedStyle(() => {
        return {    
            transform: [{translateY: profileY.value}, {scale: profileScale.value}]
        };
    });

    const homeAnimatedStyle = useAnimatedStyle(() => {
        return {    
            transform: [{translateY: homeY.value}, {scale: homeScale.value}]
        };
    });

    const leaderboardAnimatedStyle = useAnimatedStyle(() => {
        return {    
            transform: [{translateY: leaderboardY.value}, {scale: leaderboardScale.value}]
        };
    });

    const styles = StyleSheet.create({
        navBar: {
            height:'15%',
            width:'98%',
            borderRadius: 20,
            padding: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        navBarContent: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height:'70%',
            width:'100%',
            borderRadius: 20,
            padding: 10,
            backgroundColor:"#000B58",
            paddingRight: '10%',
            paddingLeft: '10%'
        },
        navBarItem: {
            height:"70%",
            width:"15%",
            resizeMode: 'contain',
            aspectRatio: 1,
            tintColor: 'white',
            zIndex: 2,
        }
    });
    return (
        <View style={styles.navBar}>
            <View style={styles.navBarContent}>
                <Pressable onPress={() => {
                    setPage(0);
                }}>
                    <Animated.Image 
                    source={require('@/assets/images/humain.png')} 
                    style={[
                        styles.navBarItem, 
                        profileAnimatedStyle
                    ]} 
                />
                </Pressable>
                <Animated.View style={[styles.navBarItem, {justifyContent: 'center', alignItems: 'center'}]}>
                    <Pressable onPress={() => {
                        setPage(1);
                    }}>
                <Animated.Image 
                    source={require('@/assets/images/accueil.png')} 
                    style={[
                        {width: '100%', height: '100%', tintColor: 'white', resizeMode: 'contain', aspectRatio: 1 , zIndex: 2}, 
                        homeAnimatedStyle
                    ]}
                />
                </Pressable>
                </Animated.View>
                <Pressable onPress={() => {
                    setPage(2);
                }}>
                <Animated.Image 
                    source={require('@/assets/images/trophee.png')} 
                    style={[
                        styles.navBarItem, 
                        leaderboardAnimatedStyle
                    ]} 
                />
                </Pressable>
            </View>
        </View>
    );
}

