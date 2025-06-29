import { Rect, Skia, RoundedRect } from "@shopify/react-native-skia";
import { DIMENSIONS } from "@/Constants/dimensions";
import { SharedValue, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { Cell } from "@/types/piece";
import { useEffect } from "react";

export default function CellSkiaFull(props: { x: number, y: number, color: SharedValue<string> }) {

  const cellSize = DIMENSIONS.WIDTH *0.8*0.98 / 10;
  const cellX = cellSize * props.x;
  const cellY = cellSize * props.y;
  const widthGap : number = 1.5;
  const heightGap : number = widthGap/2;
  const color = useDerivedValue(() => {
    "worklet";
    return Skia.Color(props.color.value);
  });

  return (
    <RoundedRect x={cellX + widthGap/2} y={cellY + heightGap/2} width={cellSize - widthGap} height={cellSize - heightGap} color={color} style={"fill"} r={widthGap*5}/>
  );
}