import { View, StyleSheet } from "react-native"
import { DIMENSIONS } from "../../Constants/dimensions";
import { GRID_SIZE } from "../../Constants/grid";
import { CELLS_COLOR } from "../../Constants/cellsColor";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

export default function Cell(props: { color: string, x: number, y: number, final: boolean }) {
    const scale = useSharedValue(1);
    useEffect(() => {
        if (props.final) {
            scale.value = withSequence(withSpring(1.2, {duration: 250}), withTiming(1, {duration: 250}));
        } else {
            scale.value = withTiming(1, {duration: 100});       
        }
    }, [props.final]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}]
        }
    });
    const cellWidth = 100 / GRID_SIZE.WIDTH;  // 100% / 10 colonnes = 10%
    const cellHeight = 100 / GRID_SIZE.HEIGHT; // 100% / 20 lignes = 5%
    const widthGap : number = 1.5;
    const heightGap : number = widthGap/2;
    const fullCell = StyleSheet.create({
        cell: {
            width: `${cellWidth-widthGap}%`,
            height: `${cellHeight-heightGap}%`,
            borderRadius: "10%",
            borderWidth: 1,
            borderColor: CELLS_COLOR[props.color as keyof typeof CELLS_COLOR],
            backgroundColor: CELLS_COLOR[props.color as keyof typeof CELLS_COLOR],
            position: "absolute",
            left: `${props.x * cellWidth + widthGap/2}%`,
            top: `${props.y * cellHeight + heightGap/2}%`,
        }
    });
    const emptyCell = StyleSheet.create({
        cell: {
            width: `${cellWidth-widthGap}%`,
            height: `${cellHeight-heightGap}%`,
            borderRadius: "10%",
            borderWidth: 1,
            borderColor: CELLS_COLOR[props.color as keyof typeof CELLS_COLOR],
            position: "absolute",
            left: `${props.x * cellWidth + widthGap/2}%`,
            top: `${props.y * cellHeight + heightGap/2}%`
        }
    });

    return (
        <Animated.View style={props.color === "gray" || props.color === "white" ? emptyCell.cell : [fullCell.cell, animatedStyle]} />
    );
}
