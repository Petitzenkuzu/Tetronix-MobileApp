import { SharedValue } from "react-native-reanimated";

export type State = {
    timestamp: number;
    x: number;
    y: number;
    current_piece: Piece;
    grid: {grid: PieceType[][]}
    score: number;
    level: number;
    lines: number;
    last_processed_action: number;
    finished: boolean;
};

export type Piece = {
    shape: boolean[][];
    piece_type: PieceType;
}

export enum PieceType {
    Cyan = 0x00,
    Blue = 0x01,
    Yellow = 0x02,
    Orange = 0x03,
    Purple = 0x04,
    Green = 0x05,
    Red = 0x06,
    Empty = 0x07,
}

export type Action = {
    action_type: ActionType;
    timestamp: number;
    piece: PieceType;
}

export type ClientAction = {
    action_type: ClientActionType;
    id: number;
}

export enum ClientActionType {
    right = 0x00,
    left = 0x01,
    rotate = 0x02,
    hardDrop = 0x03,
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