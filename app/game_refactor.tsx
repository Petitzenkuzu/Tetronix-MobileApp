import { View, Text as RNText, ImageBackground, StyleSheet, Modal, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React ,{ useState, useRef, useCallback, useEffect } from "react";
import { useSharedValue, useDerivedValue, useAnimatedReaction, runOnJS, useFrameCallback, SharedValue, runOnUI } from 'react-native-reanimated';
import { GRID_SIZE } from "../Constants/grid";
import { CELLS_COLOR } from "@/Constants/cellsColor";
import { deleteCompleteLines, getGhostX, isPiecePlaceable, placePiece, rotatePiece, getVoidPiece, placeAndAnimateCellForHardFall, movePieceTo, getColorFromPieceType, isDifferentShape } from "../utils/gameUtils";
import { useBlankGrid, usePiece, useScore } from "@/utils/gameHooks";
import { DIMENSIONS } from "../Constants/dimensions";
import { Canvas, RoundedRect, Text, useFont, BlurMask} from "@shopify/react-native-skia";
import { GridCell, Piece, ActivePieceCell, Action, Game, ActionType, PieceType, State, ClientAction, ClientActionType} from '@/types/gameTypes';
import { User } from '@/types/auth';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { withTiming } from "react-native-reanimated";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useTimer } from '@/hooks/useTimer';
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

  const {fontSize, font, score, level, lines, xLevel, xScore, xLines, xValueLevel, xValueScore, xValueLines, levelText, scoreText, linesText, add2Score, add2Level, add2Lines} = useScore();

  const {timer, xTimer, yTimer, opacity, timerFont} = useTimer();

  // Valeurs de la longueur d'une cellule
  const cellSize = DIMENSIONS.WIDTH * 0.8 * 0.98 / 10;
  // gap entre deux cellules
  const gap = 3;
  // delai pour modifiable pour pouvoir gérer facilement des délais ( celui de départ, celui de changement de pièce )
  const delay = useSharedValue(3000);
  // Queue d'actions à effectuer
  const actionQueue = useSharedValue<ClientActionType[]>([]);
  // Grille de jeu avec des sharedValues pour gérer les couleurs si c'est une cellule fill ou stroke
  const grid = useRef<GridCell[][]>(useBlankGrid(GRID_SIZE, cellSize, gap));
  // Valeurs de la pièce active
  const piece = useSharedValue<Piece>(getVoidPiece());
  // x de la pièce active 
  const x = useSharedValue(0);
  // y de la pièce active
  const y = useSharedValue(4);
  // x de la pièce fantôme
  const ghostX = useSharedValue(0);
  // Grille de la pièce active
  const CellPiece = useRef<ActivePieceCell[][]>(usePiece());
  // Timestamp pour le décompte du temps
  const timestamp = useSharedValue(0);
  // Timestamp pour empêcher de spammer les hard drop
  const hardDropTimestamp = useSharedValue(-400);
  // Distance de swipe (pour gérer les long swpie lent)
  const swipeDistance = useSharedValue(0);
  // Position initial du x au début d'un swipe
  const previousX = useSharedValue(0);
  // Game over
  const gameOver = useSharedValue(false);
  // Game over visible pour gérer le modal
  const [gameOverVisible, setGameOverVisible] = useState(false);
  // WebSocket pour le streaming serveur
  const webSocket = useRef<WebSocket | null>(null);
  // Id pour l'envoie des actions
  const ActionId = useSharedValue(0);
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

  /**
   * Gestion du websocket
   */
  useEffect(() => {
    if (webSocket.current) {
      //startGameLoop();
      return;
    }
    //stopGameLoop();
    let url = `${process.env.EXPO_PUBLIC_BACKEND_URL_WEBSOCKET}/game/start`;
    const ws = new WebSocket(url);
    ws.onopen = () => {
        console.log("WebSocket opened");
    }
    ws.onmessage = (event) => {
      let state = JSON.parse(event.data);
      timestamp.value = state.timestamp;

      runOnUI(() => {
        x.value = state.x;
        y.value = state.y;
        piece.value = state.current_piece;
        replacePiece(state.current_piece);
        replaceGrid(state.grid.grid);
      })();
    }
    ws.onclose = (event) => {
      /* laisser en commentaire car le free tier render ferme le ws à cause de la latence
      switch (event.code) {
        case 1000:
          break;
        case 1011: 
          router.replace("/");
          break;
        case 1007:
          router.replace("/");
          break;
        case 1008:
          router.replace("/login");
          break;
        default:
          break;
      }*/
    }
      
    ws.onerror = (error) => {
      router.replace("/");
    }
    webSocket.current = ws;
  },[]);

  /**
   * Gestion du game over
   */
  useEffect(() => {
    if (gameOverVisible == true) {
      //stopGameLoop();
    }
  },[gameOverVisible]);

  const processState = (state: State) => {
    "worklet";
    timestamp.value = state.timestamp;
    if (x.value !== state.x || y.value !== state.y || isDifferentShape(piece.value.shape, state.current_piece.shape)) {
      x.value = state.x;
      y.value = state.y;
      piece.value = state.current_piece;
      replaceGrid(state.grid.grid);
      replacePiece(state.current_piece);
    }
  }

  const replaceGrid = (grid_state: PieceType[][]) => {
    "worklet";
    for (let i = 0; i < grid_state.length; i++) {
      for (let j = 0; j < grid_state[i].length; j++) {
        if (grid_state[i][j] === PieceType.Empty) {
          grid.current[i][j].style.value = "stroke";
          grid.current[i][j].color.value = "gray";
        }
        else {
          grid.current[i][j].color.value = CELLS_COLOR[getColorFromPieceType(grid_state[i][j]) as keyof typeof CELLS_COLOR];
          grid.current[i][j].style.value = "fill";
        }
      }
    }
  }

  const replacePiece = (piece_state: Piece) => {
  "worklet";
    for (let i = 0; i < piece_state.shape.length; i++) {
      for (let j = 0; j < piece_state.shape[i].length; j++) {
        CellPiece.current[i][j].x.value = y.value*cellSize+gap/2 + j*cellSize;
        CellPiece.current[i][j].y.value = x.value*cellSize+gap/2 + i*cellSize;
        if (piece_state.shape[i][j]) {
          CellPiece.current[i][j].opacity.value = 1;
        }
        else {
          CellPiece.current[i][j].opacity.value = 0;
        }
        CellPiece.current[i][j].color.value = CELLS_COLOR[getColorFromPieceType(piece_state.piece_type) as keyof typeof CELLS_COLOR];
      }
    }
  }

  const processActions = (action: ClientActionType) => {
    "worklet";
    console.log("action: ", action);
      switch (action) {
        case ClientActionType.rotate:
          const newPiece = rotatePiece(piece.value);
          if (isPiecePlaceable(newPiece, grid.current, x.value, y.value)) {
            piece.value = newPiece;
            replacePiece(newPiece);
            runOnJS(sendActionOnWebSocket)({action_type: ClientActionType.rotate, id: ActionId.value});
            ActionId.value = ActionId.value + 1;
          }
          break;
        case ClientActionType.right:
          if (isPiecePlaceable(piece.value, grid.current, x.value, y.value+1)) {
            movePieceTo(CellPiece.current, "right", cellSize);
            y.value = y.value + 1;
            runOnJS(sendActionOnWebSocket)({action_type: ClientActionType.right, id: ActionId.value});
            ActionId.value = ActionId.value + 1;
          }
          break;
        case ClientActionType.left:
          if (isPiecePlaceable(piece.value, grid.current, x.value, y.value-1)) {
            movePieceTo(CellPiece.current, "left", cellSize);
            y.value = y.value - 1;
            runOnJS(sendActionOnWebSocket)({action_type: ClientActionType.left, id: ActionId.value});
            ActionId.value = ActionId.value + 1;
          }
          break;
        case ClientActionType.hardDrop:
          //sendActionOnWebSocket({action_type: ClientActionType.hardDrop, id: ActionId.value});
          break;
      }
  }
  /**
  * Envoie une action sur le websocket, si l'action est un end, on ferme le websocket et on empêche l'envoie du changePiece en trop
  * @param action l'action à envoyer
  */        
  function sendActionOnWebSocket(action: ClientAction) {
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      let buffer = new ArrayBuffer(5);
      let view = new DataView(buffer);
      view.setUint8(0, action.action_type);
      view.setUint32(1, action.id, false);
      webSocket.current.send(buffer);
    }
  };

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      "worklet";
      if (gameOver.value) {
        return;
      }
      actionQueue.value.push(ClientActionType.rotate);
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
          actionQueue.value.push(ClientActionType.right);
          return;
        }
        // déplacement vers la gauche
        if (swipeDistance.value < -cellSize) {
          swipeDistance.value = 0;
          actionQueue.value.push(ClientActionType.left);
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
          actionQueue.value.push(ClientActionType.hardDrop);
        }
      });


  const gameLoop = useFrameCallback((frame) => {
    "worklet";
    if (gameOver.value) {
      return;
    }
    if (actionQueue.value.length > 0) {
      const actions = actionQueue.value.splice(0);
      for (let i = 0; i < actions.length; i++) {
        processActions(actions[i]);
      }
    }
  });

const startGameLoop =() => {
  gameLoop.setActive(true);
};
const stopGameLoop = () => {
  gameLoop.setActive(false);
};

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
                        <Text x={xTimer} y={yTimer} text={timer} font={timerFont} color="white" opacity={opacity} />
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
                    <Pressable style={modalStyle.buttonPressableRestart} onPress={() => {}}>
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
