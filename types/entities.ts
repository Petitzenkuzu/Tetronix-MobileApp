import { cells, Piece } from "./piece";

export type GameState = {
    lastFallTime: number;
    piece: Piece;
    x: number;
    y: number;
    ghostX: number;
    score: number;
    level: number;
    lines: number;
}

export type ScoreManager = {
    stopGame: () => void;
    addScore: (score: number) => void;
    addLines: (lines: number) => void;
    addLevel: (level: number) => void;
}

export type Entities = {
    grid: {grid: cells[][], renderer: React.ReactNode};
    scoreManager: ScoreManager;
    gameState: GameState;
}
