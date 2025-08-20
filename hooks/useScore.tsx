import { useAnimatedReaction, useDerivedValue, useSharedValue } from "react-native-reanimated";
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