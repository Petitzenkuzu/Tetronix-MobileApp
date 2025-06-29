import { View } from "react-native";
import React, { Component } from "react";
import Cell from "./Cell";
import { cells } from "@/types/piece";

interface GridRendererProps {
    grid: string[][];
}

export default class GridRenderer extends Component<any> {
    render() {
        return (
            <View style={{
                width: "100%", 
                height: "100%", 
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 1)",
            }}>
                <View style={{
                    width: "98%",
                    height: "98%",
                    borderRadius: 10,
                }}>
                    {this.props.grid.map((row: cells[], y: number) => (
                        row.map((cell: cells, x: number) => (
                            <Cell key={`${x}-${y}`} color={cell.color} x={x} y={y} final={cell.final} />
                        ))
                    ))}
                </View>
            </View>
        );
    }
}