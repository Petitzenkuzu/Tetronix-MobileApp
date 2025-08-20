import { DIMENSIONS } from "@/Constants/dimensions";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { useFont } from "@shopify/react-native-skia";
import { useEffect } from "react";

export const useTimer = () => {
    const timerFont = useFont(require("@/assets/fonts/Neoneon.otf"), 64);
    const timer = useSharedValue<string>("3");
    let width = DIMENSIONS.WIDTH * 0.8 * 0.98;
    let height = width*2;

    const xTimer = useSharedValue(0);
    const yTimer = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (timerFont) {
            xTimer.value = width/2 - timerFont.measureText("Timer").width/2;
            yTimer.value = height/2 - timerFont.measureText("Timer").height/2.5;
        }
    }, [timerFont]);

    useAnimatedReaction(
        () => {
          return {
            timerText: timer.value.toString(),
            fontReady: timerFont !== null
          };
        },
        (current) => {
          if (current.fontReady && timerFont) {
            xTimer.value = (width - timerFont.measureText(current.timerText).width)/2;
            yTimer.value = (height - timerFont.measureText(current.timerText).height)/2.5;
          }
        }
      );

    return { timer, xTimer, yTimer, opacity, timerFont};
};