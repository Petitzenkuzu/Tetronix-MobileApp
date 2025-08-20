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

import { useAnimatedReaction, useDerivedValue } from "react-native-reanimated";
import { useFont } from "@shopify/react-native-skia";
import { DIMENSIONS } from "@/Constants/dimensions";

export const useScore = () => {
    const fontSize = 28;
    const font = useFont(require("@/assets/fonts/Quicksand-Light.ttf"), fontSize);
    // stats du jeu
    const score = useSharedValue<number>(0);
    const level = useSharedValue<number>(1);
    const lines = useSharedValue<number>(0);
    
    // Valeur de décalage X des textes statiques pour les centrer dans le canvas
    const xLevel = useSharedValue<number>(0);
    const xScore = useSharedValue<number>(0);
    const xLines = useSharedValue<number>(0);
    
    // Valeur de décalage X des textes dynamiques pour les centrer dans le canvas
    const xValueLevel = useSharedValue<number>(0);
    const xValueScore = useSharedValue<number>(0);
    const xValueLines = useSharedValue<number>(0);
  
    // DerivedValues pour que les textes réagissent au changement de la valeur des stats
    const levelText = useDerivedValue<string>(() : string => {
      "worklet";
      return level.value.toString();
    });
    const scoreText = useDerivedValue<string>(() : string => {
      "worklet";
      return score.value.toString();
    });
    const linesText = useDerivedValue<string>(() : string => {
      "worklet";
      return lines.value.toString();
    });

  // Recalculer les positions des sharedValues quand elles changent 
  // permet de garder centrer les textes dans les canvas pour éviter d'utiliser un useState pour les textes et rerender tous les cubes
  useAnimatedReaction(
    () => {
      return {
        levelText: level.value.toString(),
        scoreText: score.value.toString(),
        linesText: lines.value.toString(),
        fontReady: font !== null
      };
    },
    (current) => {
      if (current.fontReady && font) {
        xValueLevel.value = (DIMENSIONS.WIDTH - font.measureText(current.levelText).width)/2;
        xValueScore.value = (DIMENSIONS.WIDTH/2 - font.measureText(current.scoreText).width)/2;
        xValueLines.value = (DIMENSIONS.WIDTH/2 - font.measureText(current.linesText).width)/2;
      }
    }
  );

  const add2Score = (score2add : number ) => {
    "worklet";
    score.value = score.value + score2add;
  };
  const add2Level = (level2add : number ) => {
    "worklet";
    level.value = level.value + level2add;
  };
  const add2Lines = (lines2add : number ) => {
    "worklet";
    lines.value = lines.value + lines2add;
  };

    return {
        fontSize,
        font,
        score,
        level,
        lines,
        xLevel,
        xScore,
        xLines,
        xValueLevel,
        xValueScore,
        xValueLines,
        levelText,
        scoreText,
        linesText,
        add2Score,
        add2Level,
        add2Lines,
    };
}