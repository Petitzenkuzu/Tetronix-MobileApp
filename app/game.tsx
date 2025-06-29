import { View, Text as RNText, ImageBackground, StyleSheet, Modal, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React ,{ useState, useRef, useCallback, useEffect } from "react";
import { useSharedValue, useDerivedValue, useAnimatedReaction, runOnJS, useFrameCallback, SharedValue } from 'react-native-reanimated';
import { GRID_SIZE } from "../Constants/grid";
import { deleteCompleteLines, getGhostX, getRandomPiece, isPiecePlaceable, placePiece, rotatePiece } from "../utils/gameUtils";
import { DIMENSIONS } from "../Constants/dimensions";
import { Canvas, RoundedRect, Text, useFont} from "@shopify/react-native-skia";
import { Cell, Piece, CellSkia } from '@/types/piece';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { router } from 'expo-router';

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

export default function Game() {
  const getBlankGrid = useCallback(() => {
    return Array(GRID_SIZE.HEIGHT).fill(null).map(() => 
      Array(GRID_SIZE.WIDTH).fill(null).map(() => ({
        color: useSharedValue("gray"), 
        style: useSharedValue("stroke")
      }))
    );
  },[]);
  const getSetOfRandomPieces = useCallback(() : Piece[] => {
    "worklet";
    return Array(10).fill(null).map(() => getRandomPiece());
  },[]);
  const initPiece = useCallback((piece: Piece, x: SharedValue<number>, y: SharedValue<number>) => {
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
          newGrid[i][j].color.value = piece.color;
          newGrid[i][j].opacity.value = 1;
          newGrid[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          newGrid[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
        }
        else {
          newGrid[i][j].color.value = piece.color;
          newGrid[i][j].opacity.value = 0;
          newGrid[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          newGrid[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
        }
      }
    }
    return newGrid;
  },[]);
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

  const cellSize = DIMENSIONS.WIDTH * 0.8 * 0.98 / 10;
  const gap = 3;
  const grid = useRef<Cell[][]>(getBlankGrid());


  const piece = useSharedValue<Piece>(getRandomPiece());
  const x = useSharedValue(0);
  const y = useSharedValue(4);
  const ghostX = useSharedValue(getGhostX(piece.value, grid.current, x.value, y.value));
  const CellPiece = useRef<CellSkia[][]>(initPiece(piece.value, x, y));
  const timestamp = useSharedValue(0);
  const setOfRandomPieces = useSharedValue<Piece[]>(getSetOfRandomPieces());
  const swipeDistance = useSharedValue(0);
  const previousX = useSharedValue(0);
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

  // Calcul des positions des textes pour les centrer dans le canvas
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

  // Recalculer les positions des valeurs dynamiques quand elles changent
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

  const handleChangingActivePiece = useCallback(() => {
    "worklet";
    x.value = 0;
    y.value = 4;
    deleteCompleteLines(grid.current, {score: score.value, level: level.value, lines: lines.value, add2Score: add2Score, add2Level: add2Level, add2Lines: add2Lines});
    if (setOfRandomPieces.value.length <= 2) {
      runOnJS(addPieceToSetOfRandomPieces)(20);
    }
    piece.value = setOfRandomPieces.value.pop()!;
    if (isPiecePlaceable(piece.value, grid.current, x.value, y.value)) {
      for (let i = 0; i < CellPiece.current.length; i++) {
        for (let j = 0; j < CellPiece.current[i].length; j++) {
          CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
          CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
          if (i < piece.value.shape.length && j < piece.value.shape[i].length && piece.value.shape[i][j]) {
            CellPiece.current[i][j].color.value = piece.value.color;
            CellPiece.current[i][j].opacity.value = 1;
          } else {
            CellPiece.current[i][j].opacity.value = 0;
          }
        }
      }
    ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
    placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
    return;
    } else {
      gameOver.value = true;
      runOnJS(setGameOverVisible)(true);
      return;
    }
  },[]);

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      "worklet";
      if (gameOver.value) {
        return;
      }
      const newPiece = rotatePiece(piece.value);
      if (isPiecePlaceable(newPiece, grid.current, x.value, y.value)) {
        placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
        piece.value = newPiece;
        for (let i = 0; i < newPiece.shape.length; i++) {
          for (let j = 0; j < newPiece.shape[i].length; j++) {
            CellPiece.current[i][j].opacity.value = 0;
            if (newPiece.shape[i][j]) {
              CellPiece.current[i][j].color.value = newPiece.color;
              CellPiece.current[i][j].opacity.value = 1;
            }
          }
        }
      ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
      }
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
        if (event.velocityY < 1500) {
        if (swipeDistance.value > cellSize) {
          swipeDistance.value = 0;
          if (isPiecePlaceable(piece.value, grid.current, x.value, y.value+1)) {
            for (let i = 0; i < CellPiece.current.length; i++) {
              for (let j = 0; j < CellPiece.current[i].length; j++) {
                CellPiece.current[i][j].x.value = CellPiece.current[i][j].x.value + cellSize;
              }
            }
            placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
            y.value = y.value + 1;
            ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
            placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
          }
        }
        if (swipeDistance.value < -cellSize) {
          swipeDistance.value = 0;
          if (isPiecePlaceable(piece.value, grid.current, x.value, y.value-1)) {
            for (let i = 0; i < CellPiece.current.length; i++) {
              for (let j = 0; j < CellPiece.current[i].length; j++) {
                CellPiece.current[i][j].x.value = CellPiece.current[i][j].x.value - cellSize;
              }
            }
            placePiece({...piece.value, color: "gray"}, grid.current, ghostX.value, y.value, "stroke");
            y.value = y.value - 1;
            ghostX.value = getGhostX(piece.value, grid.current, x.value, y.value);
            placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
          }
        }
      }
      }).onEnd((event) => {
        "worklet";
        if (gameOver.value) {
          return;
        }
        swipeDistance.value = 0;
        if (event.velocityY > 2500) {
          placePiece(piece.value, grid.current, ghostX.value, y.value, "fill");
          handleChangingActivePiece();
        }
      });

  useFrameCallback((frame) => {
    if (gameOver.value) {
      return;
    }
    // initialisation du jeu
    if (timestamp.value === 0) {
      timestamp.value = frame.timestamp;
      placePiece({...piece.value, color: "white"}, grid.current, ghostX.value, y.value, "stroke");
    }
    // logique pour faire descendre la pièce  
    if (frame.timestamp > timestamp.value + 1000*(0.8**level.value)) {
      timestamp.value = frame.timestamp;
      // Fall de la pièce
    if (isPiecePlaceable(piece.value, grid.current, x.value+1, y.value)) {
      for (let i = 0; i < CellPiece.current.length; i++) {
        for (let j = 0; j < CellPiece.current[i].length; j++) {
          CellPiece.current[i][j].y.value = CellPiece.current[i][j].y.value + cellSize;
        }
      }
      x.value = x.value + 1;
    }
    else {
      // On remplace la pièce
    for (let i = 0; i < CellPiece.current.length; i++) {
      for (let j = 0; j < CellPiece.current[i].length; j++) {
        if (CellPiece.current[i][j].opacity.value === 1) {
          grid.current[x.value + i][y.value + j].color.value = piece.value.color;
          grid.current[x.value + i][y.value + j].style.value = "fill";
        }
      }
    }
    handleChangingActivePiece();
  }
  }
});

  return (
      <ImageBackground source={require("@/assets/images/backGround6.png")} style={styles.background} blurRadius={3}>
        <GestureHandlerRootView style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
          <SafeAreaView style={styles.container}>
            <View style={styles.statsContainer}>
                { !gameOverVisible && <View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
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
              }
            </View>
            <View style={styles.gameContainer}>
              <View style={styles.gameCanvas}>
                <GestureDetector gesture={Gesture.Exclusive(swipe,singleTap)}>
                  <Canvas style={{ width: "100%", height: "100%" }}>
                    {grid.current.map((row: Cell[], y: number) => row.map((cell: Cell, x: number) =>
                    <RoundedRect 
                      key={`${x}-${y}`}
                      x={x*cellSize+gap/2} 
                      y={y*cellSize+gap/2} 
                      width={cellSize-gap} 
                      height={cellSize-gap} 
                      r={(cellSize-gap)/5} 
                      color={cell.color} 
                      style={cell.style as any}    
                    />
                  ))}
                    {CellPiece.current.map((row: CellSkia[], y: number) => row.map((cell: CellSkia, x: number) => 
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
                <View style={modalStyle.content}>
                  <View style={modalStyle.gameOverView}>
                    <RNText style={{color: "red", fontSize: 40, fontFamily: "Neoneon", width: "100%",height: 44, textAlign: "center", justifyContent: "center", alignItems: "center"}}>Game Over</RNText>
                  </View>
                  <View style={modalStyle.statsView}>
                    <RNText style={{color: "white", fontSize: 36, fontFamily: "Quicksand"}}>Score: {score.value}</RNText>
                    <RNText style={{color: "white", fontSize: 36, fontFamily: "Quicksand"}}>Level: {level.value}</RNText>
                    <RNText style={{color: "white", fontSize: 36, fontFamily: "Quicksand"}}>Lines: {lines.value}</RNText>
                  </View>
                  <View style={modalStyle.buttonsView}>
                    <Pressable style={{width: "70%", height: 36, justifyContent: "center", alignItems: "center", marginRight: "5%", backgroundColor: "red", borderRadius: 12}} onPress={() => { 
                      router.push("/");
                    }}>
                      <RNText style={{color: "white", fontSize: 20, fontFamily: "Quicksand", textAlign: "center"}}>BACK TO MENU</RNText>
                    </Pressable>
                    <Pressable style={{width : 36 ,height: 36, justifyContent: "center", alignItems: "center", backgroundColor: "#57B9FF", borderRadius: 12}} onPress={() => { 
                      router.push("/game");
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "60%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000B58",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#57B9FF",
  },
  gameOverView: {
    width: "100%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  statsView: {
    width: "100%",
    height: "55%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsView: {
    width: "100%",
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  }
});

