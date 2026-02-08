import { PieceType } from "@/types/gameTypes";

export const PIECES = {
    I:() => ({
        shape: [
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false]
        ],
        piece_type: PieceType.Cyan
    }),
    L: () => ({
        shape: [
            [false, true, false],
            [false, true, false],
            [false, true, true]
        ],
        piece_type: PieceType.Blue
    }),
    O: () => ({
        shape: [
            [true, true],
            [true, true]
        ],
        piece_type: PieceType.Yellow
    }),
    J: () => ({
        shape: [
            [false, true, false],
            [false, true, false],
            [true, true, false]
        ],
        piece_type: PieceType.Orange
    }),
    T: () => ({
        shape: [
            [false, true, false],
            [true, true, true],
            [false, false, false]
        ],
        piece_type: PieceType.Purple
    }),
    Z: () => ({
        shape: [
            [true, true, false],
            [false, true, true],
            [false, false, false]
        ],
        piece_type: PieceType.Green
    }),
    S: () => ({
        shape: [
            [false, true, true],
            [true, true, false],
            [false, false, false]
        ],
        piece_type: PieceType.Red
    })
};