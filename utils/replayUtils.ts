import { PieceType, Piece } from "@/types/gameTypes";
// Retiré: on définit les fonctions locales I, L, O, J, T, Z, S ci-dessous

export function getPieceFromType(type: PieceType ): Piece {
  "worklet";
  switch (type) {
    case PieceType.Cyan:
      return {
        shape: [
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false]
        ],
        piece_type: PieceType.Cyan
    };
    case PieceType.Blue:
      return {
        shape: [
          [false, true, false],
          [false, true, false],
          [false, true, true]
        ],
        piece_type: PieceType.Blue
      };
    case PieceType.Yellow:
      return {
        shape: [
          [true, true],
          [true, true]
        ],
        piece_type: PieceType.Yellow
      };
    case PieceType.Orange:
      return {
        shape: [
          [false, true, false],
          [false, true, false],
          [true, true, false]
        ],
        piece_type: PieceType.Orange
      };
    case PieceType.Purple:
      return {
        shape: [
          [false, true, false],
          [true, true, true],
          [false, false, false]
        ],
        piece_type: PieceType.Purple
      };
    case PieceType.Green:
      return {
        shape: [
          [true, true, false],
          [false, true, true],
          [false, false, false]
        ],
        piece_type: PieceType.Green
      };
    case PieceType.Red:
      return {
        shape: [
          [false, true, true],
          [true, true, false],
          [false, false, false]
        ],
        piece_type: PieceType.Red
      };
    default:
      return { shape: [], piece_type: PieceType.Empty };
  }
}
