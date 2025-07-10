import { SharedValue } from "react-native-reanimated";

export type Piece = {
    shape: number[][];
    color: string;
}

export type GridCell = {
    color: SharedValue<string>;
    style: SharedValue<string>;
    y: SharedValue<number>;
    blur: SharedValue<number>;
};

export type ActivePieceCell = {
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