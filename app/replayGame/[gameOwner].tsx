import { View, Text as RNText, ImageBackground, Pressable, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Piece } from "@/types/gameTypes";
import { Game } from "@/types/gameTypes";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import LoadingPage from "@/components/loadingPage";
import { Canvas, RoundedRect, Text, BlurMask } from "@shopify/react-native-skia";
import { useSharedValue, withTiming, useFrameCallback } from "react-native-reanimated";
import { useRef } from "react";
import { runOnUI, runOnJS } from "react-native-reanimated";
import { DIMENSIONS } from "@/Constants/dimensions";
import { GRID_SIZE } from "@/Constants/grid";
import { CELLS_COLOR } from "@/Constants/cellsColor";
import { deleteCompleteLines, getGhostX, getRandomPiece, placePiece, rotatePiece, placeAndAnimateCellForHardFall, movePieceTo } from "@/utils/gameUtils";
import { useBlankGrid, useTransparentPiece, useScore } from "@/utils/gameHooks";
import { GridCell, ActivePieceCell } from "@/types/gameTypes";
import { ActionType } from "@/types/gameTypes";
import { getPieceFromType } from "@/utils/replayUtils";
import { useTimer } from "@/hooks/useTimer";

export default function ReplayGamePage() {
    const { gameOwner } = useLocalSearchParams();
    const [game, setGame] = useState<Game | null>(null);

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
    
  const {fontSize, font, score, level, lines, xLevel, xScore, xLines, xValueLevel, xValueScore, xValueLines, levelText, scoreText, linesText, add2Score, add2Level, add2Lines} = useScore();

  const {timer, xTimer, yTimer, opacity, timerFont} = useTimer();

  const cellSize = DIMENSIONS.WIDTH * 0.8 * 0.98 / 10;
  // gap entre deux cellules
  const gap = 3;
  // grille de jeux
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
  const CellPiece = useRef<ActivePieceCell[][]>(useTransparentPiece(x, y, cellSize, gap));
  // Timestamp pour le décompte du temps
  const timestamp = useSharedValue(0);
  // index du tableau 
  const index = useSharedValue(0);
  // game over
  const gameOver = useSharedValue(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);

  const router = useRouter();
  useEffect(() => {
      const fetchGame = async () => {
          try {
              const api = await useApi();
              const response = await api.get(`/game/replay/${gameOwner}`);
              setGame(response.data);
          } catch (error) {
              router.back();
          }
        }
        fetchGame();
    }, []);

  const gameLoop = useFrameCallback((frame) => {
    "worklet";
    if (gameOver.value || !game) {
      return;
    }
    // Initialisation de la première pièce du jeu
    if (index.value === 0) {
      const action = game.game_actions[index.value];
      piece.value = getPieceFromType(action.piece);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (piece.value.shape.length > i && piece.value.shape[i].length > j && piece.value.shape[i][j]) {
            CellPiece.current[i][j].color.value = CELLS_COLOR[piece.value.color as keyof typeof CELLS_COLOR];
            CellPiece.current[i][j].opacity.value = 1;
            CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
            CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
          }
          else {
            CellPiece.current[i][j].opacity.value = 0;
          }
        }
      }
      ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
      index.value = index.value + 1;
    }

    if (frame.timeSinceFirstFrame <= 4000) {
      if (frame.timeSinceFirstFrame > 3000) {
        opacity.value = withTiming(0, {duration: 500});
      }
      if (frame.timeSinceFirstFrame > 2000) {
        timer.value = "1";
      }
      else if (frame.timeSinceFirstFrame > 1000) {
        timer.value = "2";
      }
      else {
        timer.value = "3";
      }
    }

    // si le timestamp est supérieur au temps écoulé depuis le début du jeu, on execute le ou les actions
    while (index.value < game.game_actions.length && frame.timeSinceFirstFrame > game.game_actions[index.value].timestamp) {
      timestamp.value = game.game_actions[index.value].timestamp;
      placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
      switch (game.game_actions[index.value].action_type) {
        case ActionType.end:
          gameOver.value = true;
          runOnJS(setGameOverVisible)(true);
          return;
        case ActionType.fall:
          x.value = x.value + 1;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              CellPiece.current[i][j].y.value = withTiming(CellPiece.current[i][j].y.value + cellSize, {duration: (1000*(0.8**level.value))/5});
            }
          }
          break;
        case ActionType.hardDrop:
          const diff = ghostX.value - x.value;
            if (diff > 0) {
              add2Score(diff*(level.value*10));
            }
          break;
        case ActionType.rotate:
          const newPiece = rotatePiece(piece.value);
          piece.value = newPiece;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (piece.value.shape.length > i && piece.value.shape[i].length > j && piece.value.shape[i][j]) {
                CellPiece.current[i][j].color.value = CELLS_COLOR[newPiece.color as keyof typeof CELLS_COLOR];
                CellPiece.current[i][j].opacity.value = 1;
                CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
                CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
              }
              else {
                CellPiece.current[i][j].opacity.value = 0;
              }
            }
          }
          break;
        case ActionType.left:
          movePieceTo(CellPiece.current, "left", cellSize);
          y.value = y.value - 1;
          break;
        case ActionType.right:
          movePieceTo(CellPiece.current, "right", cellSize);
          y.value = y.value + 1;
          break;
        case ActionType.changePiece:
          if (game.game_actions[index.value-1].action_type === ActionType.hardDrop) {
            placeAndAnimateCellForHardFall(grid.current, piece.value, x.value, y.value, ghostX.value, cellSize, gap, level.value);
          }
          else {
            placePiece(piece.value, grid.current, ghostX.value, y.value, "fill");
          }
          deleteCompleteLines(grid.current, {level: level.value, score: score.value, lines: lines.value, add2Score: add2Score, add2Level: add2Level, add2Lines: add2Lines}, cellSize, gap);
          const changedPiece = getPieceFromType(game.game_actions[index.value].piece);
          piece.value = changedPiece;
          x.value = 0;
          y.value = 4;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (changedPiece.shape.length > i && changedPiece.shape[i].length > j && changedPiece.shape[i][j]) {
                CellPiece.current[i][j].color.value = CELLS_COLOR[changedPiece.color as keyof typeof CELLS_COLOR];
                CellPiece.current[i][j].opacity.value = 1;
                CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
                CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
              }
              else {
                CellPiece.current[i][j].opacity.value = 0;
              }
            }
          }
          break;
          default:
            console.log("action non reconnue");
            break;
      }
      // on replace le fantôme de la pièce active une fois une action executée
      // placé ici pour une meilleur lisibilité du code et moins de redondance
      ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
      index.value = index.value + 1;
    }
    
  });

  const startGameLoop = () => {
    gameLoop.setActive(true);
  };
  const stopGameLoop = () => {
    gameLoop.setActive(false);
  };

  const resetGame = useCallback(() => {
    "worklet";
    score.value = 0;
    level.value = 1;
    lines.value = 0;
    index.value = 0;
    opacity.value = 1;
    x.value = 0;
    y.value = 4;
    for (let i = 0; i < grid.current.length ; i++) {
      for (let j = 0; j < grid.current[i].length; j++) {
        grid.current[i][j].color.value = "gray";
        grid.current[i][j].style.value = "stroke";
        grid.current[i][j].blur.value = 0;
      }
    }
    for (let i = 0; i < CellPiece.current.length; i++) {
      for (let j = 0; j < CellPiece.current[i].length; j++) {
        CellPiece.current[i][j].color.value = "gray";
        CellPiece.current[i][j].opacity.value = 0;
      }
    }
    gameOver.value = false;
  }, []);
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
  
  // stop le jeux lorsque le gameOverVisible est visible
  useEffect(() => {
    if (gameOverVisible) {
      stopGameLoop();
    }
  }, [gameOverVisible]);


  if (!game) {
    return (
        <LoadingPage />
    )
}
  
    return (
        <ImageBackground source={require("@/assets/images/backGround6.png")} style={styles.background} blurRadius={3}>
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
                    <Text x={xTimer} y={yTimer} text={timer} font={timerFont} color="white" opacity={opacity} />
                  </Canvas>
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
                      const router = useRouter();
                      router.back();
                    }}>
                      <RNText style={{color: "white", fontSize: 20, fontFamily: "Quicksand", textAlign: "center"}}>BACK TO MENU</RNText>
                    </Pressable>
                    <Pressable style={modalStyle.buttonPressableRestart} onPress={() => {
                      runOnUI(() => {
                        resetGame();
                        runOnJS(setGameOverVisible)(false);
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
      </ImageBackground>
    )
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
  
  