import { PieceType, Piece } from "@/types/gameTypes";
// Retiré: on définit les fonctions locales I, L, O, J, T, Z, S ci-dessous

export function getPieceFromType(type: PieceType ): Piece {
  "worklet";
  switch (type) {
    case PieceType.cyan:
      return {
        shape: [
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false]
        ],
        color: "cyan"
    };
    case PieceType.blue:
      return {
        shape: [
          [false, true, false],
          [false, true, false],
          [false, true, true]
        ],
        color: "blue"
      };
    case PieceType.yellow:
      return {
        shape: [
          [true, true],
          [true, true]
        ],
        color: "yellow"
      };
    case PieceType.orange:
      return {
        shape: [
          [false, true, false],
          [false, true, false],
          [true, true, false]
        ],
        color: "orange"
      };
    case PieceType.purple:
      return {
        shape: [
          [false, true, false],
          [true, true, true],
          [false, false, false]
        ],
        color: "purple"
      };
    case PieceType.green:
      return {
        shape: [
          [true, true, false],
          [false, true, true],
          [false, false, false]
        ],
        color: "green"
      };
    case PieceType.red:
      return {
        shape: [
          [false, true, true],
          [true, true, false],
          [false, false, false]
        ],
        color: "red"
      };
    default:
      return { shape: [], color: "gray" };
  }
}
