import { PIECES } from "../Constants/piece";
import { GRID_SIZE } from "../Constants/grid";
import { GridCell, Piece, scoreManager, ActivePieceCell } from "@/types/gameTypes";
import { withTiming, Easing, withSequence, withDelay, runOnJS} from "react-native-reanimated";
import { CELLS_COLOR } from "@/Constants/cellsColor";


/**
 * fonction pour générer une pièce aléatoire
 * @returns une pièce aléatoire
 */
export const getRandomPiece = () : Piece => {
  const pieceTypes = Object.keys(PIECES);
  const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
  return PIECES[randomType as keyof typeof PIECES]();
};

/**
 * fonction pour générer une pièce vide
 * @returns une pièce vide
 */
export const getVoidPiece = () : Piece => {
  "worklet";
  return {shape: [[0], [0], [0], [0]], color: "transparent"};
};

/**
 * fonction pour générer un ensemble de 10 pièces aléatoires
 * @returns un tableau de 10 pièces aléatoires
 */
export const getSetOfRandomPieces = () : Piece[] => {
  return Array(10).fill(null).map(() => getRandomPiece());
}

/**
 * fonction pour placer la pièce sur la grille
 * @param piece : la pièce
 * @param grid : grille de jeu
 * @param x : position x de la pièce
 * @param y : position y de la pièce
 * @param style : style de la pièce (stroke ou fill)
 */
export const placePiece = (piece : Piece, grid: GridCell[][], x: number, y: number, style: string) => {
  "worklet";
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j]) {
        grid[x + i][y + j].color.value = CELLS_COLOR[piece.color as keyof typeof CELLS_COLOR];
        grid[x + i][y + j].style.value = style;
      }
    }
  }
};

/**
 * fonction pour déplacer la pièce à droite ou à gauche d'une distance donnée
 * @param CellPiece : le tableau 2D contenant les SharedValues de la pièce active
 * @param direction : direction du déplacement (left ou right)
 * @param distance : distance du déplacement
 */
export const movePieceTo = (CellPiece: ActivePieceCell[][], direction: "left" | "right", distance: number) => {
  "worklet";
  switch (direction) {
    case "left":
      for (let i = 0; i < CellPiece.length; i++) {
        for (let j = 0; j < CellPiece[i].length; j++) {
          CellPiece[i][j].x.value = CellPiece[i][j].x.value - distance;
        }
      } 
      break;
    case "right":
      for (let i = 0; i < CellPiece.length; i++) {
        for (let j = 0; j < CellPiece[i].length; j++) {
          CellPiece[i][j].x.value = CellPiece[i][j].x.value + distance;
        }
      }   
      break;
    default:
      break;
  }
};

/**
 * fonction pour faire tourner la pièce
 * @param piece : la pièce
 * @returns la pièce tournée
 */
export const rotatePiece = (piece: Piece) : Piece => {
  "worklet";
  return {shape: piece.shape.map((row, index) => row.map((_, j) => piece.shape[piece.shape.length - j - 1][index])), color: piece.color};
};

/**
 * fonction pour vérifier si la pièce peut être placée à la position x,y
 * @param piece : la pièce
 * @param grid : grille de jeu
 * @param x : position x de la pièce
 * @param y : position y de la pièce
 * @returns true si la pièce peut être placée, false sinon
 */
export const isPiecePlaceable = (piece: Piece, grid: GridCell[][], x: number, y: number) : boolean => {
  "worklet";
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j]) {
        if (x + i >= GRID_SIZE.HEIGHT || x + i < 0 || y + j >= GRID_SIZE.WIDTH || y + j < 0){
          return false;
        }
        if (grid[x + i][y + j].style.value === "fill") {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * fonction pour calculer la position x du ghost
 * @param piece : la pièce
 * @param grid : grille de jeu
 * @param x : position x de la pièce
 * @param y : position y de la pièce
 * @returns position x du ghost
 */
export const getGhostX = (piece: Piece, grid: GridCell[][], x: number, y: number) : number => {
  "worklet";
  let ghostX = x;
  while (isPiecePlaceable(piece, grid, ghostX, y)) {
    ghostX++;
  }
  return ghostX - 1;
};

/**
 * fonction pour faire l'effet de hard drop
 * @param grid : grille de jeu
 * @param piece : la pièce
 * @param x : position x de la pièce
 * @param y : position y de la pièce
 * @param ghostX : position x du ghost
 * @param cellSize : taille d'une cellule
 * @param gap : espace entre deux cellules
 */
export const placeAndAnimateCellForHardFall = (grid : GridCell[][],piece : Piece, x : number, y : number, ghostX : number, cellSize : number, gap : number, level : number) => {
  "worklet";
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j]) {
        grid[ghostX + i][y + j].color.value = CELLS_COLOR[piece.color as keyof typeof CELLS_COLOR];
        grid[ghostX + i][y + j].style.value = "fill";
        grid[ghostX + i][y + j].blur.value = 20;
        grid[ghostX + i][y + j].y.value = x*cellSize+gap/2;
        grid[ghostX + i][y + j].blur.value = withTiming(0, {duration: (1000*(0.8**level))/4, easing: Easing.exp});
        grid[ghostX + i][y + j].y.value = withTiming((ghostX+i)*cellSize+gap/2, {duration: (1000*(0.8**level))/5, easing: Easing.exp});
      }
    }
  }
}

/**
 * fonction pour supprimer les lignes complétées et mettre à jour les scores
 * @param grid : grille de jeu
 * @param scoreManager : gestionnaire de score
 * @param cellSize : taille d'une cellule
 * @param gap : espace entre deux cellules
 */
export const deleteCompleteLines = (grid: GridCell[][], scoreManager: scoreManager, cellSize : number, gap : number) : void => {
  "worklet";
  let flag = false;
  let maxUnanimatedRow = 20;
  let tempGrid : {color : string, style : string, nbLinesCompleted : number}[][] = Array.from({length: GRID_SIZE.HEIGHT}, () => 
    Array.from({length: GRID_SIZE.WIDTH}, () => ({color: "gray", style: "stroke", nbLinesCompleted: 0}))
  );
  let completedLines = 0;
  let actualRow = GRID_SIZE.HEIGHT - 1;
  
  for (let i = GRID_SIZE.HEIGHT - 1; i >= 0; i--) {
    if (grid[i].every(cell => cell.style.value === "fill")) {
      completedLines++;
      flag = true;
    } else {
      if (!flag) {
        maxUnanimatedRow = i;
      }
      for (let j = 0; j < GRID_SIZE.WIDTH; j++) {
        tempGrid[actualRow][j].color = grid[i][j].color.value;
        tempGrid[actualRow][j].style = grid[i][j].style.value;
        tempGrid[actualRow][j].nbLinesCompleted = completedLines;
      }
      actualRow--;
    }
  }
  if (completedLines === 0) {
    return;
  }
  
  for (let i = 0; i < GRID_SIZE.HEIGHT; i++) {
    for (let j = 0; j < GRID_SIZE.WIDTH; j++) {
      if (tempGrid[i][j].color !== "gray") {
        grid[i][j].color.value = tempGrid[i][j].color;
        grid[i][j].style.value = tempGrid[i][j].style;
        if (i < maxUnanimatedRow) {
          grid[i][j].y.value = (i*cellSize+gap/2) - (cellSize*tempGrid[i][j].nbLinesCompleted);
          grid[i][j].y.value = withTiming(i*cellSize+gap/2, {duration: tempGrid[i][j].nbLinesCompleted*75 , easing: Easing.quad});
        }
      } else {
        grid[i][j].color.value = "gray";
        grid[i][j].style.value = "stroke";
      }
    }
  }

  // Score en fonction du level et du nombre de lignes complétées
  switch(completedLines){
    case 1:
        scoreManager.add2Score(40*scoreManager.level);
        break;
    case 2:
        scoreManager.add2Score(100*scoreManager.level);
        break;
    case 3:
        scoreManager.add2Score(300*scoreManager.level);
        break;
    case 4:
        scoreManager.add2Score(1200*scoreManager.level);
        break;
    default:
        break;
  }
  // verififcation de si il y a level up
  if ((scoreManager.lines + completedLines) % 10 < scoreManager.lines % 10) {
    scoreManager.add2Level(1);
  }
  scoreManager.add2Lines(completedLines);
  return;
}

