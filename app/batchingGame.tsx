import { View, Text as RNText, ImageBackground, StyleSheet, Modal, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React ,{ useState, useRef, useCallback, useEffect } from "react";
import { useSharedValue, useDerivedValue, useAnimatedReaction, runOnJS, useFrameCallback, SharedValue, runOnUI } from 'react-native-reanimated';
import { GRID_SIZE } from "../Constants/grid";
import { CELLS_COLOR } from "@/Constants/cellsColor";
import { deleteCompleteLines, getGhostX, getRandomPiece, isPiecePlaceable, placePiece, rotatePiece,getSetOfRandomPieces, getVoidPiece, placeAndAnimateCellForHardFall, movePieceTo } from "../utils/gameUtils";
import { useBlankGrid, usePiece } from "@/utils/gameHooks";
import { DIMENSIONS } from "../Constants/dimensions";
import { Canvas, RoundedRect, Text, useFont, BlurMask} from "@shopify/react-native-skia";
import { GridCell, Piece, ActivePieceCell, Action, Game} from '@/types/gameTypes';
import { User } from '@/types/auth';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { withTiming } from "react-native-reanimated";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useApi } from '@/hooks/useApi';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
  },
  statsContainer: {
    width: "100%",
    height: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  levelContainer: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreContainer: {
    width: "100%",
    height: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: "0%",
    paddingLeft: "0%",
  },
  scoreTextContainer: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  gameContainer: {
    width: DIMENSIONS.WIDTH * 0.8,
    height: DIMENSIONS.WIDTH * 1.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: "10%",
    borderRadius: 10,
    aspectRatio: 0.5,
  },
  statsText: {
    color: "white",
    fontSize: 28,
    fontFamily: "Quicksand",
  },
  gameCanvas: {
    width: "98%",
    height: "98%",
    justifyContent: "center",
    alignItems: "center",
  }
}); 

export default function GamePage() {
  const params = useLocalSearchParams();
  
  // User comme state pour pouvoir le modifier
  const [user, setUser] = useState<User>({
    name: params.userName as string,
    best_score: parseInt(params.userBestScore as string),
    highest_level: parseInt(params.userHighestLevel as string),
    number_of_games: parseInt(params.userNumberOfGames as string)
  });

  /**
   * ajoute des pièces choisie aléatoirement dans le set de pièces aléatoires
   * @param size nombre de pièces à ajouter
   */
  const addPieceToSetOfRandomPieces = useCallback((size : number) => {
    const newSetOfRandomPieces = [...setOfRandomPieces.value];
    for (let i = 0; i < size; i++) {
      newSetOfRandomPieces.push(getRandomPiece());
    }
    setOfRandomPieces.value = newSetOfRandomPieces;
  },[]);

  
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
  
  // Valeurs de la longueur d'une cellule
  const cellSize = DIMENSIONS.WIDTH * 0.8 * 0.98 / 10;
  // gap entre deux cellules
  const gap = 3;
  // delai pour modifiable pour pouvoir gérer facilement des délais ( celui de départ, celui de changement de pièce )
  const delay = useSharedValue(3000);
  // Queue d'actions à effectuer
  const actionQueue = useSharedValue<("right" | "left" | "rotate" | "hardDrop" | "fall")[]>([]);
  // Queue d'actions à effectuer
  const gameActions = useSharedValue<Action[]>([]);
  // Grille de jeu avec des sharedValues pour gérer les couleurs si c'est une cellule fill ou stroke
  const grid = useRef<GridCell[][]>(useBlankGrid(GRID_SIZE, cellSize, gap));
  // Valeurs de la pièce active
  const piece = useSharedValue<Piece>(getRandomPiece());
  // x de la pièce active 
  const x = useSharedValue(0);
  // y de la pièce active
  const y = useSharedValue(4);
  // x de la pièce fantôme
  const ghostX = useSharedValue(0);
  // Grille de la pièce active
  const CellPiece = useRef<ActivePieceCell[][]>(usePiece(piece.value, x, y, cellSize, gap));
  // Timestamp pour le décompte du temps
  const timestamp = useSharedValue(0);
  // Timestamp pour empêcher de spammer les hard drop
  const hardDropTimestamp = useSharedValue(-400);
  // Set de pièces aléatoires (obligatoire car pas de random dans les worklet)
  const setOfRandomPieces = useSharedValue<Piece[]>(getSetOfRandomPieces());
  // Distance de swipe (pour gérer les long swpie lent)
  const swipeDistance = useSharedValue(0);
  // Position initial du x au début d'un swipe
  const previousX = useSharedValue(0);
  // Game over
  const gameOver = useSharedValue(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);

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

  // Calcul des positions initiales des textes pour les centrer dans le canvas
  useEffect(() => {
    if (font) {
      xLevel.value = (DIMENSIONS.WIDTH - font.measureText("Level").width)/2;
      xScore.value = (DIMENSIONS.WIDTH/2 - font.measureText("Score").width)/2;
      xLines.value = (DIMENSIONS.WIDTH/2 - font.measureText("Lines").width)/2;
      xValueLevel.value = (DIMENSIONS.WIDTH - font.measureText(level.value.toString()).width)/2;
      xValueScore.value = (DIMENSIONS.WIDTH/2 - font.measureText(score.value.toString()).width)/2;
      xValueLines.value = (DIMENSIONS.WIDTH/2 - font.measureText(lines.value.toString()).width)/2;
    }
  },[font]);

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
  /**
   * fonction pour mettre à jour les stats de l'utilisateur
   * appelée lorsqu'une partie est terminé
   */
  const updateUser = useCallback(async() => {
    let tempScore = user.best_score;
    let tempLevel = user.highest_level;
    if (user.best_score < score.value) {
      tempScore = score.value;
    }
    if (user.highest_level < level.value) {
      tempLevel = level.value;
    }
    try{
      const api = await useApi();
      const response = await api.post(`/services/user`, {
        name: user.name,
        best_score: tempScore,
        highest_level: tempLevel,
        number_of_games: user.number_of_games + 1
      });
      if (response.status === 200) {
        setUser(response.data);
      }
      if (user.best_score < score.value) {
        const game : Game = {
          game_owner: user.name,
          game_score: score.value,
          game_level: level.value,
          game_lines: lines.value,
          game_actions: gameActions.value
        }
        const response = await api.post("/services/game", game);
        if (response.status === 200) {
          console.log("Game saved");
        }
      }
    } catch (error) {
      console.error(error);
    }
  },[]);

  /**
   * fonction pour changer la pièce active après un fall bloqué ou un hard drop, permet de mettre fin à la partie si on ne peut pas placer de nouvelle pièce
   */
  const handleChangingActivePiece = useCallback(() => {
    "worklet";
    x.value = 0;
    y.value = 4;
    deleteCompleteLines(grid.current, {score: score.value, level: level.value, lines: lines.value, add2Score: add2Score, add2Level: add2Level, add2Lines: add2Lines}, cellSize, gap);
    if (setOfRandomPieces.value.length <= 2) {
      runOnJS(addPieceToSetOfRandomPieces)(20);
    }
    // variable temporaire car délai de synchro pour l'affectation directe à piece.value
    const newPiece = setOfRandomPieces.value.pop()!;
    if (isPiecePlaceable(newPiece, grid.current, x.value, y.value)) {
      piece.value = newPiece;
      // replacement des cellules de la pièce et changement de couleur
      for (let i = 0; i < CellPiece.current.length; i++) {
        for (let j = 0; j < CellPiece.current[i].length; j++) {
          CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
          if (i < newPiece.shape.length && j < newPiece.shape[i].length && newPiece.shape[i][j]) {
            CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
            CellPiece.current[i][j].opacity.value = 1;
          } else {
            CellPiece.current[i][j].opacity.value = 0;
          }
        }
      }
    ghostX.value = getGhostX(newPiece, grid.current, x.value, y.value);
    placePiece({...newPiece, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
    delay.value = 500;
    return;
    } else {
      piece.value = getVoidPiece();
      for (let i = 0; i < CellPiece.current.length; i++) {
        for (let j = 0; j < CellPiece.current[i].length; j++) {
          CellPiece.current[i][j].opacity.value = 0;
        }
      }
      gameOver.value = true;
      gameActions.value.push({action_type: "end", timestamp: 0});
      runOnJS(setGameOverVisible)(true);
      runOnJS(updateUser)();
      return;
    }
  },[]);
  /**
   * fonction pour réinitialiser le jeu
   */
  const resetGame = useCallback(() => {
    "worklet";
    score.value = 0;
    level.value = 1;
    lines.value = 0;
    timestamp.value = 0;
    hardDropTimestamp.value = -400;
    gameActions.value = [];
    swipeDistance.value = 0;
    delay.value = 3000;
    x.value = 0;
    y.value = 4; 
    for (let i = 0; i < grid.current.length; i++) {
    for (let j = 0; j < grid.current[i].length; j++) {
    grid.current[i][j].color.value = "gray";
    grid.current[i][j].style.value = "stroke";
    }
    }
    if (setOfRandomPieces.value.length <= 2) {
    runOnJS(addPieceToSetOfRandomPieces)(20);
    }
    const newPiece = setOfRandomPieces.value.pop()!;
    piece.value = newPiece;
    for (let i = 0; i < CellPiece.current.length; i++) {
    for (let j = 0; j < CellPiece.current[i].length; j++) {
    CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
    CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
    CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
    if (i < newPiece.shape.length && j < newPiece.shape[i].length && newPiece.shape[i][j]) {
    CellPiece.current[i][j].opacity.value = 1;
    } else {
    CellPiece.current[i][j].opacity.value = 0;
    }
    }
    }
    gameOver.value = false;
    runOnJS(setGameOverVisible)(false);
  },[]);

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      "worklet";
      if (gameOver.value) {
        return;
      }
      actionQueue.value.push("rotate");
    });

    const swipe = Gesture.Pan()
    .onStart((event) => {
      "worklet";
      if (gameOver.value) {
        return;
      }
      previousX.value = event.x;
    })
      .onUpdate((event) => {
        "worklet";
        if (gameOver.value) {
          return;
        }
        swipeDistance.value = swipeDistance.value + (event.x-previousX.value);
        previousX.value = event.x;
        // guard pour éviter les swipe latéraux accidentels
        if (event.velocityY < 1500) {
          // déplacement vers la droite
        if (swipeDistance.value > cellSize) {
          swipeDistance.value = 0;
          actionQueue.value.push("right");
          return;
        }
        // déplacement vers la gauche
        if (swipeDistance.value < -cellSize) {
          swipeDistance.value = 0;
          actionQueue.value.push("left");
          return;
        }
        return;
      }
      }).onEnd((event) => {
        "worklet";
        if (gameOver.value) {
          return;
        }
        swipeDistance.value = 0;
        if (event.velocityY > 2500) {
          actionQueue.value.push("hardDrop");
        }
      });

  const gameLoop = useFrameCallback((frame) => {
    "worklet";
    if (gameOver.value) {
      return;
    }
    // initialisation du jeu
    if (timestamp.value === 0) {
      ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
      actionQueue.value = [];
      if (gameActions.value.length === 0) {
        gameActions.value.push({action_type: "start", piece: piece.value, timestamp: 0});
      }
    }
    // logique pour faire descendre la pièce  
    if (frame.timeSinceFirstFrame > timestamp.value + delay.value + 1000*(0.8**level.value)) {
      timestamp.value = frame.timeSinceFirstFrame;
      // reset du délai
      if (delay.value !== 0) {
        delay.value = 0;
      }
      actionQueue.value.push("fall");
    }
    if (actionQueue.value.length > 0) {
      const actions = actionQueue.value.splice(0);
      actionQueue.value = [];
      placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
      for (const action of actions) {
        switch (action) {
          case "rotate":
            const newPiece = rotatePiece(piece.value);
            if (isPiecePlaceable(newPiece, grid.current, x.value, y.value)) {
              piece.value = newPiece;
              for (let i = 0; i < newPiece.shape.length; i++) {
                for (let j = 0; j < newPiece.shape[i].length; j++) {
                  if (newPiece.shape[i][j]) {
                    CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
                    CellPiece.current[i][j].opacity.value = 1;
                  }
                  else {
                    CellPiece.current[i][j].opacity.value = 0;
                  }
                }
              }
              gameActions.value.push({action_type: "rotate", piece: newPiece, timestamp: Math.floor(frame.timeSinceFirstFrame)});
              break;
            }
            else if (isPiecePlaceable(newPiece, grid.current, x.value, y.value+1)) {
              piece.value = newPiece;
              y.value = y.value + 1;
              for (let i = 0; i < newPiece.shape.length; i++) {
                for (let j = 0; j < newPiece.shape[i].length; j++) {
                  if (newPiece.shape[i][j]) {
                    CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
                    CellPiece.current[i][j].opacity.value = 1;
                  }
                  else {
                    CellPiece.current[i][j].opacity.value = 0;
                  }
                }
              }
              movePieceTo(CellPiece.current, "right", cellSize);
              gameActions.value.push({action_type: "right", timestamp: Math.floor(frame.timeSinceFirstFrame)});
              gameActions.value.push({action_type: "rotate", piece: newPiece, timestamp: Math.floor(frame.timeSinceFirstFrame)});
              break;
            }
            else if (isPiecePlaceable(newPiece, grid.current, x.value, y.value-1)) {
              piece.value = newPiece;
              y.value = y.value - 1;
              for (let i = 0; i < newPiece.shape.length; i++) {
                for (let j = 0; j < newPiece.shape[i].length; j++) {
                  if (newPiece.shape[i][j]) {
                    CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
                    CellPiece.current[i][j].opacity.value = 1;
                  }
                  else {
                    CellPiece.current[i][j].opacity.value = 0;
                  }
                }
              }
              movePieceTo(CellPiece.current, "left", cellSize);
              gameActions.value.push({action_type: "left", timestamp: Math.floor(frame.timeSinceFirstFrame)});
              gameActions.value.push({action_type: "rotate", piece: newPiece, timestamp: Math.floor(frame.timeSinceFirstFrame)});
              break;
            }


            break;
          case "right":
            if (isPiecePlaceable(piece.value, grid.current, x.value, y.value+1)) {
              movePieceTo(CellPiece.current, "right", cellSize);
              y.value = y.value + 1;
              gameActions.value.push({action_type: "right", timestamp: Math.floor(frame.timeSinceFirstFrame)});
            }
            break;
          case "left":
            if (isPiecePlaceable(piece.value, grid.current, x.value, y.value-1)) {
              movePieceTo(CellPiece.current, "left", cellSize);
              y.value = y.value - 1;
              gameActions.value.push({action_type: "left", timestamp: Math.floor(frame.timeSinceFirstFrame)});
            }
            break;
          case "hardDrop":
            // empêche de spammer les hard drop
            if (frame.timeSinceFirstFrame < hardDropTimestamp.value + 400) {
              break;
            }
            hardDropTimestamp.value = frame.timeSinceFirstFrame;
            const diff = ghostX.value - x.value;
            if (diff > 0) {
              add2Score(diff*(level.value*10));
            }
            placeAndAnimateCellForHardFall(grid.current, piece.value, x.value, y.value, ghostX.value, cellSize, gap, level.value);
            gameActions.value.push({action_type: "hardDrop", timestamp: Math.floor(frame.timeSinceFirstFrame)});
            handleChangingActivePiece();
            gameActions.value.push({action_type: "changePiece", piece: piece.value, timestamp: Math.floor(frame.timeSinceFirstFrame)});
            break;
          case "fall":
            if (isPiecePlaceable(piece.value, grid.current, x.value+1, y.value)) {
              for (let i = 0; i < CellPiece.current.length; i++) {
                for (let j = 0; j < CellPiece.current[i].length; j++) {
                  CellPiece.current[i][j].y.value = withTiming(CellPiece.current[i][j].y.value + cellSize, {duration: (1000*(0.8**level.value))/5});
                }
              }
              x.value = x.value + 1;
              gameActions.value.push({action_type: "fall", timestamp: Math.floor(frame.timeSinceFirstFrame)});
            }
            else {
              // On remplace la pièce
              placePiece(piece.value, grid.current, x.value, y.value, "fill");
              handleChangingActivePiece();
              gameActions.value.push({action_type: "changePiece", piece: piece.value, timestamp: Math.floor(frame.timeSinceFirstFrame)});
          }
          break;
          default:
            break;
        }
        if (gameOver.value) {
          return;
        }
      }
      ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
    }
    else {
      return;
    }
});
const startGameLoop = () => {
  gameLoop.setActive(true);
};
const stopGameLoop = () => {
  gameLoop.setActive(false);
};
useEffect(() => {
  if (gameOver.value) {
    stopGameLoop();
  }
},[gameOverVisible]);

  return (
      <ImageBackground source={require("@/assets/images/backGround6.png")} style={styles.background} blurRadius={3}>
        <GestureHandlerRootView style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
          <SafeAreaView style={styles.container}>
            <View style={styles.statsContainer}>
                <View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
                  <View style={styles.levelContainer}>
                    <Canvas style={{ width: "100%", height: "100%" }}>
                      <Text x={xLevel} y={fontSize} text="Level" font={font} color="white" />
                      <Text x={xValueLevel} y={fontSize*2} text={levelText} font={font} color="white" />
                    </Canvas>
                  </View>
                <View style={styles.scoreContainer}>
                  <Canvas style={styles.scoreTextContainer}>
                    <Text x={xScore} y={fontSize} text="Score" font={font} color="white" />
                    <Text x={xValueScore} y={fontSize*2} text={scoreText} font={font} color="white" />
                  </Canvas>
                  <Canvas style={styles.scoreTextContainer}>
                    <Text x={xLines} y={fontSize} text="Lines" font={font} color="white" />
                    <Text x={xValueLines} y={fontSize*2} text={linesText} font={font} color="white" />
                  </Canvas>
                </View>
              </View>
            </View>
            <View style={styles.gameContainer}>
              <View style={styles.gameCanvas}>
                <GestureDetector gesture={Gesture.Exclusive(swipe,singleTap)}>
                  <Canvas style={{ width: "100%", height: "100%" }}>
                    {grid.current.map((row: GridCell[]) => row.map((cell: GridCell, x: number) =>
                    <RoundedRect 
                      key={`${x}-${y}`}
                      x={x*cellSize+gap/2} 
                      y={cell.y} 
                      width={cellSize-gap} 
                      height={cellSize-gap} 
                      r={(cellSize-gap)/5} 
                      color={cell.color} 
                      style={cell.style as any}    
                    >
                    <BlurMask blur={cell.blur} style="normal" />
                    </RoundedRect>
                  ))}
                    {CellPiece.current.map((row: ActivePieceCell[], y: number) => row.map((cell: ActivePieceCell, x: number) => 
                      <RoundedRect 
                          key={`${x}-${y}`}
                          x={cell.x}
                          y={cell.y}
                          width={cellSize-gap}
                          height={cellSize-gap}
                          r={(cellSize-gap)/5}
                          color={cell.color}
                          style={"fill"}
                          opacity={cell.opacity}   
                        /> ))}
                  </Canvas>
                </GestureDetector>
              </View>
            </View>
            <Modal visible={gameOverVisible} transparent={true} animationType="slide">
              <View style={modalStyle.container}>
                <View style={modalStyle.mainContent}>
                  <View style={modalStyle.gameOverView}>
                    <RNText style={modalStyle.gameOverText}>Game Over</RNText>
                  </View>
                  <View style={modalStyle.statsView}>
                    <RNText style={modalStyle.statsText}>Score: {score.value}</RNText>
                    <RNText style={modalStyle.statsText}>Level: {level.value}</RNText>
                    <RNText style={modalStyle.statsText}>Lines: {lines.value}</RNText>
                  </View>
                  <View style={modalStyle.buttonsView}>
                    <Pressable style={modalStyle.buttonPressableHome} onPress={() => { 
                      router.replace("/");
                    }}>
                      <RNText style={{color: "white", fontSize: 20, fontFamily: "Quicksand", textAlign: "center"}}>BACK TO MENU</RNText>
                    </Pressable>
                    <Pressable style={modalStyle.buttonPressableRestart} onPress={() => {
                      runOnUI(() => {
                        resetGame();
                        runOnJS(startGameLoop)();
                      })();
                    }}>
                      <Image source={require("@/assets/images/restart.png")} style={{height: "50%",width: "15%", tintColor: "white", aspectRatio: 1}} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
          </GestureHandlerRootView>
      </ImageBackground>
    );
}

const modalStyle = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    width: "65%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.95)",
    borderRadius: 20,
    borderWidth: 2,
  },
  gameOverView: {
    width: "100%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  gameOverText: {
    color: "red",
    fontSize: 40,
    fontFamily: "Neoneon",
    width: "100%",
    height: 44,
    textAlign: "center",
  },
  statsView: {
    width: "100%",
    height: "55%",
    justifyContent: "center",
    alignItems: "center",
  },
  statsText: {
    color: "white",
    fontSize: 36,
    fontFamily: "Quicksand",
  },
  buttonsView: {
    width: "100%",
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonPressableHome: {
    width: "70%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: "5%",
    backgroundColor: "red",
    borderRadius: 12,
  },
  buttonPressableRestart: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#57B9FF",
    borderRadius: 12,
  }
});

