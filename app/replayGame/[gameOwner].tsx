import { View, Text as RNText, ImageBackground, Pressable, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Game, Piece, scoreManager } from "@/types/gameTypes";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import LoadingPage from "@/components/loadingPage";
import { Canvas, RoundedRect, Text, BlurMask, useFont } from "@shopify/react-native-skia";
import { useSharedValue, withTiming, useDerivedValue, useAnimatedReaction, useFrameCallback } from "react-native-reanimated";
import { useRef } from "react";
import { runOnUI, runOnJS } from "react-native-reanimated";
import { DIMENSIONS } from "@/Constants/dimensions";
import { GRID_SIZE } from "@/Constants/grid";
import { CELLS_COLOR } from "@/Constants/cellsColor";
import { deleteCompleteLines, getGhostX, getRandomPiece, placePiece, rotatePiece, placeAndAnimateCellForHardFall, movePieceTo } from "@/utils/gameUtils";
import { useBlankGrid, useTransparentPiece } from "@/utils/gameHooks";
import { GridCell, ActivePieceCell } from "@/types/gameTypes";

export default function ReplayGame() {
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
  const router = useRouter();
  useEffect(() => {
      const fetchGame = async () => {
          try {
              const api = await useApi();
              const response = await api.get(`/services/game/${gameOwner}`);
              if (response.status === 200) {
                setGame(response.data);
              }
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
    if (index.value === 0) {
      const action = game.game_actions[index.value];
      piece.value = action.piece!;
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
    while (index.value < game.game_actions.length && frame.timeSinceFirstFrame > game.game_actions[index.value].timestamp) {
      timestamp.value = game.game_actions[index.value].timestamp;
      placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
      switch (game.game_actions[index.value].action_type) {
        case "end":
          gameOver.value = true;
          runOnJS(setGameOverVisible)(true);
          return;
        case "fall":
          x.value = x.value + 1;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              CellPiece.current[i][j].y.value = withTiming(CellPiece.current[i][j].y.value + cellSize, {duration: (1000*(0.8**level.value))/5});
            }
          }
          break;
        case "hardDrop":
          break;
        case "rotate":
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
        case "left":
          movePieceTo(CellPiece.current, "left", cellSize);
          y.value = y.value - 1;
          break;
        case "right":
          movePieceTo(CellPiece.current, "right", cellSize);
          y.value = y.value + 1;
          break;
        case "changePiece":
          if (game.game_actions[index.value-1].action_type === "hardDrop") {
            placeAndAnimateCellForHardFall(grid.current, piece.value, x.value, y.value, ghostX.value, cellSize, gap, level.value);
            const diff = ghostX.value - x.value;
            if (diff > 0) {
              add2Score(diff*(level.value*10));
            }
          }
          else {
            placePiece(piece.value, grid.current, ghostX.value, y.value, "fill");
          }
          deleteCompleteLines(grid.current, {level: level.value, score: score.value, lines: lines.value, add2Score: add2Score, add2Level: add2Level, add2Lines: add2Lines}, cellSize, gap);
          const changedPiece = game.game_actions[index.value].piece!;
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
            break;
      }
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
  
  