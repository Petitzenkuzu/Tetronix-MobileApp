import { SharedValue } from "react-native-reanimated";

export type Piece = {
    shape: number[][];
    color: string;
}

export type Action = {
    action_type: string;
    timestamp: number;
    piece?: Piece;
}

export type Game = {
    game_owner: string;
    game_score: number;
    game_level: number;
    game_lines: number;
    game_actions: Action[];
}

export type GameStats = {
    game_score: number;
    game_level: number;
    game_lines: number;
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