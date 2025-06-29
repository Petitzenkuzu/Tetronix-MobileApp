import { PIECES } from "../Constants/piece";
import { GRID_SIZE } from "../Constants/grid";
import { Cell, Piece, scoreManager } from "@/types/piece";
import { runOnJS } from "react-native-reanimated";

export const getRandomPiece = () : Piece => {
  const pieceTypes = Object.keys(PIECES);
  const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
  return PIECES[randomType as keyof typeof PIECES]();
};

export const placePiece = (piece : Piece, grid: Cell[][], x: number, y: number, style: string) => {
  "worklet";
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j]) {
        grid[x + i][y + j].color.value = piece.color;
        grid[x + i][y + j].style.value = style;
      }
    }
  }
};

export const rotatePiece = (piece: Piece) : Piece => {
  "worklet";
  return {shape: piece.shape.map((row, index) => row.map((_, j) => piece.shape[piece.shape.length - j - 1][index])), color: piece.color};
};

export const isPiecePlaceable = (piece: Piece, grid: Cell[][], x: number, y: number) : boolean => {
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

export const getGhostX = (piece: Piece, grid: Cell[][], x: number, y: number) : number => {
  "worklet";
  let ghostX = x;
  while (isPiecePlaceable(piece, grid, ghostX, y)) {
    ghostX++;
  }
  return ghostX - 1;
};


export const deleteCompleteLines = (grid: Cell[][], scoreManager: scoreManager) : void => {
  "worklet";

  let tempGrid : {color : string, style : string}[][] = Array.from({length: GRID_SIZE.HEIGHT}, () => 
    Array.from({length: GRID_SIZE.WIDTH}, () => ({color: "gray", style: "stroke"}))
  );
  let completedLines = 0;
  let actualRow = GRID_SIZE.HEIGHT - 1;
  
  for (let i = GRID_SIZE.HEIGHT - 1; i >= 0; i--) {
    if (grid[i].every(cell => cell.style.value === "fill")) {
      completedLines++;
    } else {
      for (let j = 0; j < GRID_SIZE.WIDTH; j++) {
        tempGrid[actualRow][j].color = grid[i][j].color.value;
        tempGrid[actualRow][j].style = grid[i][j].style.value;
      }
      actualRow--;
    }
  }
  if (completedLines === 0) {
    return;
  }
  
  // On mets la grille réel à jour
  for (let i = 0; i < GRID_SIZE.HEIGHT; i++) {
    for (let j = 0; j < GRID_SIZE.WIDTH; j++) {
      grid[i][j].color.value = tempGrid[i][j].color;
      grid[i][j].style.value = tempGrid[i][j].style;
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