import { SharedValue } from "react-native-reanimated";

export type Piece = {
    shape: number[][];
    color: string;
}

export type Cell = {
    color: SharedValue<string>;
    style: SharedValue<string>;
};

export type CellSkia = {
    x: SharedValue<number>;
    y: SharedValue<number>;
    color: SharedValue<string>;
    opacity: SharedValue<number>;
}

export type scoreManager = {
    score : number;
    level : number;
    lines : number;
    add2Score : (score : number) => void;
    add2Level : (level : number) => void;
    add2Lines : (lines : number) => void;
  }