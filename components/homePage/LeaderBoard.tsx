import { View, Text, StyleSheet, Image } from 'react-native';
import { User } from '@/types/auth';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
export default function LeaderBoard({leaderboard}: {leaderboard: User[]}) {
    let array = [...leaderboard];
    for (let i = leaderboard.length; i < 3; i++) {
        array.push({name: "No Name", best_score: 0, highest_level: 0, number_of_games: 0});
    }

    const firstPlace : number = -100;
    const secondPlace : number = -70;
    const thirdPlace : number = -40;
    const AmplitudeFlottement : number = 15;
    const animationProgression1 = useSharedValue(0);
    const animationProgression2 = useSharedValue(0);
    const animationProgression3 = useSharedValue(0);

    useEffect(() => {
        const timeout1 = setTimeout(() => {
            animationProgression1.value = withRepeat(withTiming(1, {duration: 3000,easing: Easing.linear}), -1, false);
        }, 300);
        const timeout2 = setTimeout(() => {
            animationProgression2.value = withRepeat(withTiming(1, {duration: 3000,easing: Easing.linear}), -1, false);
        }, 150);
        const timeout3 = setTimeout(() => {
            animationProgression3.value = withRepeat(withTiming(1, {duration: 3000,easing: Easing.linear}), -1, false);
        }, 0);
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
        }
    }, []);

    const firstPlaceStyle = useAnimatedStyle(() => {
        const angle = animationProgression1.value * Math.PI * 2;
        const hauteur = AmplitudeFlottement * Math.cos(angle);
        return {
            transform: [{translateY: firstPlace + hauteur}]
        }
    });
    const secondPlaceStyle = useAnimatedStyle(() => {
        const angle = animationProgression2.value * Math.PI * 2;
        const hauteur = AmplitudeFlottement * Math.cos(angle);
        return {
            transform: [{translateY: secondPlace + hauteur}]
        }
    });
    const thirdPlaceStyle = useAnimatedStyle(() => {
        const angle = animationProgression3.value * Math.PI * 2;
        const hauteur = AmplitudeFlottement * Math.cos(angle);
        return {
            transform: [{translateY: thirdPlace + hauteur}]
        }
    });
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
        },
        text: {
            color: "white",
            fontSize: 20,
            fontFamily: 'Quicksand',
            width: '100%',
            height: 30,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        title: {
            color: "white",
            fontSize: 20,
            fontFamily: 'Neoneon',
            width: '100%',
            height: 30,
            textAlign: 'center',
            transform: [{scale: 2.5},{translateY: 30}],

        },
        name: {
            color: "white",
            fontSize: 20,
            fontFamily: 'Quicksand',
            width: '100%',
            height: 30,
            textAlign: 'center',
        },
        line: {
            width: '70%',
            height: 0.5,
            marginTop: 10,
            marginBottom: 20,
        },
    });
    const stylesPlayerContainer = StyleSheet.create({
        container: {
            width: '30%',
            height: '70%',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        textContainer: {
            width: '100%',
            height: '55%',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 0.1,
            borderRadius: 10,
            borderColor: 'white',
        },
        line: {
            width: '70%',
            height: 0.5,
            backgroundColor: 'white',
            marginTop: 5,
            marginBottom: 5,
        },
    });
    

    

    return (
        <View style={{height: "100%", width: "100%"}}>
            <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.container}>
            <Animated.View style={[stylesPlayerContainer.container, secondPlaceStyle]}>
                <Text style={[styles.name, {color: 'rgba(89, 89, 89, 1)'}]}>{array[1].name}</Text>
                <View style={[styles.line, {backgroundColor: 'rgba(89, 89, 89, 1)'}]}/>
                <View style={[stylesPlayerContainer.textContainer, {backgroundColor: 'rgba(89, 89, 89, 0.9)'}]}>
                    <Text style={styles.text}>Score</Text>
                    <Text style={styles.text}>{array[1].best_score}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Level</Text>
                    <Text style={styles.text}>{array[1].highest_level}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Games</Text>
                    <Text style={styles.text}>{array[1].number_of_games}</Text>
                </View>
            </Animated.View>
            <Animated.View style={[stylesPlayerContainer.container, firstPlaceStyle]}> 
                <Text style={[styles.name, {color: 'rgba(252, 243, 0, 1)'}]}>{array[0].name}</Text>
                <View style={[styles.line, {backgroundColor: 'rgba(252, 243, 0, 1)'}]}/>
                <View style={[stylesPlayerContainer.textContainer, {backgroundColor: 'rgba(252, 243, 0, 0.3)'}]}>
                    <Text style={styles.text}>Score</Text>
                    <Text style={styles.text}>{array[0].best_score}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Level</Text>
                    <Text style={styles.text}>{array[0].highest_level}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Games</Text>
                    <Text style={styles.text}>{array[0].number_of_games}</Text>
                </View>
            </Animated.View>
            <Animated.View style={[stylesPlayerContainer.container, thirdPlaceStyle]}>
            <Text style={[styles.name, {color: 'rgba(111, 82, 59, 1)'}]}>{array[2].name}</Text>
            <View style={[styles.line, {backgroundColor: 'rgba(111, 82, 59, 1)'}]}/>
                <View style={[stylesPlayerContainer.textContainer, {backgroundColor: 'rgba(111, 82, 59, 0.9)'}]}>
                    <Text style={styles.text}>Score</Text>
                    <Text style={styles.text}>{array[2].best_score}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Level</Text>
                    <Text style={styles.text}>{array[2].highest_level}</Text>
                    <View style={stylesPlayerContainer.line}/>
                    <Text style={styles.text}>Games</Text>
                    <Text style={styles.text}>{array[2].number_of_games}</Text>
                </View>
            </Animated.View>
        </View>
        </View>
    );
}