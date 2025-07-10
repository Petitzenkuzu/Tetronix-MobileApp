import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, { FadeOut, useSharedValue, withTiming, withRepeat, withSequence, FadeIn, useAnimatedProps } from "react-native-reanimated";
import { Canvas, RoundedRect, Group} from "@shopify/react-native-skia";
import { DIMENSIONS } from "@/Constants/dimensions";

export default function LoadingPage() {
    const width = DIMENSIONS.WIDTH;
    const cellSize = width / 10;
    const gap = 2;
    const styles = StyleSheet.create({
        container: {
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
        },
        canvas: {
            width: cellSize*4+gap*3,
            height: cellSize*4+gap*3,
        },
    });
    //haut gauche
    const xrect1= useSharedValue(cellSize+gap);
    const yrect1= useSharedValue(cellSize+gap);
    //haut droite
    const xrect2= useSharedValue(cellSize*2+gap*2);
    const yrect2= useSharedValue(cellSize+gap);
    //bas gauche
    const xrect3= useSharedValue(cellSize+gap);
    const yrect3= useSharedValue(cellSize*2+gap*2);
    //bas droite
    const xrect4= useSharedValue(cellSize*2+gap*2);
    const yrect4= useSharedValue(cellSize*2+gap*2);
    useEffect(() => {
        "worklet";
        xrect1.value = withRepeat(withSequence(
                                                         withTiming(cellSize+gap, {duration: 1000}), 
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                         withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                         withTiming(0, {duration: 1000}),
                                                         withTiming(0, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                        ), -1,true);

        yrect1.value = withRepeat(withSequence(
                                                         withTiming(0, {duration: 1000}),
                                                         withTiming(0, {duration: 1000}), 
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                         withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                         withTiming(cellSize+gap, {duration: 1000}),
                                                        ), -1,true);

        xrect2.value = withRepeat(withSequence(
                                                        withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                        withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(0, {duration: 1000}),
                                                        withTiming(0, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        
                                                       ), -1,true);

       yrect2.value = withRepeat(withSequence(
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                        withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),
                                                        withTiming(0, {duration: 1000}),
                                                        withTiming(0, {duration: 1000}),
                                                        withTiming(cellSize+gap, {duration: 1000}),

                                                       ), -1,true);

      xrect3.value = withRepeat(withSequence(
                                                      withTiming(0, {duration: 1000}),
                                                      withTiming(0, {duration: 1000}),
                                                      withTiming(cellSize+gap, {duration: 1000}),

                                                      withTiming(cellSize+gap, {duration: 1000}),
                                                      withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                      withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                      withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                      withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                      withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                      withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                      withTiming(cellSize+gap, {duration: 1000}),
                                                      withTiming(cellSize+gap, {duration: 1000}),
                                                       
                                                      ), -1,true);

      yrect3.value = withRepeat(withSequence(
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),

                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                     
                                                       
                                                       
                                                       
                                                       
                                                      ), -1,true);

       xrect4.value = withRepeat(withSequence(
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       
                                                       
                                                      ), -1,true);

      yrect4.value = withRepeat(withSequence(
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*3+gap*3, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(0, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize+gap, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       withTiming(cellSize*2+gap*2, {duration: 1000}),
                                                       
                                                       
                                                       
                                                      ), -1,true);

        

    }, []);
    return (
        <Animated.View style={styles.container} exiting={FadeOut} entering={FadeIn}>
            <Canvas style={styles.canvas}>
                <RoundedRect x={xrect1} y={yrect1} width={cellSize-gap} height={cellSize-gap} color="red" r={5} />
                <RoundedRect x={xrect2} y={yrect2} width={cellSize-gap} height={cellSize-gap} color="blue" r={5} />
                <RoundedRect x={xrect3} y={yrect3} width={cellSize-gap} height={cellSize-gap} color="yellow" r={5} />
                <RoundedRect x={xrect4} y={yrect4} width={cellSize-gap} height={cellSize-gap} color="green" r={5} />
            </Canvas>
        </Animated.View>
    );
}