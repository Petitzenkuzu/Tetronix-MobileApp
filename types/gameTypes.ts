import { SharedValue } from "react-native-reanimated";

export type Piece = {
    shape: boolean[][];
    color: string;
}

export type Action = {
    action_type: ActionType;
    timestamp: number;
    piece: PieceType;
}

export enum ActionType {
    start = 0x00,
    rotate = 0x01,
    right = 0x02,
    left = 0x03,
    fall = 0x04,
    hardDrop = 0x05,
    changePiece = 0x06,
    end = 0x07,
    ping = 0xFF,
}

export enum PieceType {
    cyan = 0x00,
    blue = 0x01,
    yellow = 0x02,
    orange = 0x03,
    purple = 0x04,
    green = 0x05,
    red = 0x06,
    void = 0x07,
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