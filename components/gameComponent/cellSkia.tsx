/*import { RoundedRect, Skia } from "@shopify/react-native-skia";
import { DIMENSIONS } from "@/Constants/dimensions";
import { Cell } from "@/types/piece";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

export default function CellSkia(props: { x: number, y: number, cell: Cell }) {
  const cellSize = DIMENSIONS.WIDTH *0.8*0.98 / 10;
  const cellX = cellSize * props.x;
  const cellY = cellSize * props.y;
  const widthGap : number = 1.5;
  const heightGap : number = widthGap/2;
  const style = useDerivedValue(() => props.cell.style.value);
  return (
    <RoundedRect 
      x={cellX + widthGap/2} 
      y={cellY + heightGap/2} 
      width={cellSize - widthGap} 
      height={cellSize - heightGap} 
      color={props.cell.color} 
      style={style as any} 
      r={widthGap*5}
    />
  );
}*/