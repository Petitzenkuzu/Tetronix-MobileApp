import { CELLS_COLOR } from "@/Constants/cellsColor";
import { Piece } from "@/types/gameTypes";
import { SharedValue, useSharedValue } from "react-native-reanimated";

/**
 * initialise une grille de jeu vide
 * @param GRID_SIZE taille de la grille
 * @param cellSize taille d'une cellule
 * @param gap espace entre les cellules
 * @returns grille de jeu vide avec des sharedValues pour gérer les couleurs si c'est une cellule fill ou stroke
 */
export const useBlankGrid = (GRID_SIZE: { HEIGHT: number; WIDTH: number }, cellSize: number, gap: number) => {
    return Array(GRID_SIZE.HEIGHT).fill(null).map((row, rowIndex) => 
        Array(GRID_SIZE.WIDTH).fill(null).map(() => ({
            color: useSharedValue("gray"), 
            style: useSharedValue("stroke"),
            y: useSharedValue(rowIndex*cellSize+gap/2),
            blur: useSharedValue(0)
        }))
    );
}

/**
 * initialise une pièce
 * @param piece pièce à initialiser
 * @param x position x de la pièce
 * @param y position y de la pièce
 * @param cellSize taille d'une cellule
 * @param gap espace entre les cellules
 * @returns grille permettant l'affichage dynamique de la pièce
 */
export const usePiece = (piece: Piece, x: SharedValue<number>, y: SharedValue<number>, cellSize: number, gap: number) => {
    "worklet";
    const newGrid = Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => ({
        color: useSharedValue("gray"), 
        style: useSharedValue("stroke"),
        x: useSharedValue(0),
        y: useSharedValue(0),
        opacity: useSharedValue(0)
      }))
    );
    for (let i = 0; i < piece.shape.length; i++) {
      for (let j = 0; j < piece.shape[i].length; j++) {
        if (piece.shape[i][j]) {  
          newGrid[i][j].color.value = CELLS_COLOR[piece.color as keyof typeof CELLS_COLOR];
          newGrid[i][j].opacity.value = 1;
          newGrid[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          newGrid[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
        }
        else {
          newGrid[i][j].color.value = CELLS_COLOR[piece.color as keyof typeof CELLS_COLOR];
          newGrid[i][j].opacity.value = 0;
          newGrid[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          newGrid[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
        }
      }
    }
    return newGrid;
  };

  /**
 * initialise une pièce
 * @param piece pièce à initialiser
 * @param x position x de la pièce
 * @param y position y de la pièce
 * @param cellSize taille d'une cellule
 * @param gap espace entre les cellules
 * @returns grille permettant l'affichage dynamique de la pièce
 */
export const useTransparentPiece = (x: SharedValue<number>, y: SharedValue<number>, cellSize: number, gap: number) => {
  "worklet";
  const newGrid = Array(4).fill(null).map(() => 
    Array(4).fill(null).map(() => ({
      color: useSharedValue("gray"), 
      style: useSharedValue("stroke"),
      x: useSharedValue(0),
      y: useSharedValue(0),
      opacity: useSharedValue(0)
    }))
  );
  return newGrid;
};