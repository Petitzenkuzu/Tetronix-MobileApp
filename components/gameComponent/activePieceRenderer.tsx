import { Piece } from "@/types/piece";
import { Canvas, Skia, RoundedRect, Group } from "@shopify/react-native-skia";
import { DIMENSIONS } from "@/Constants/dimensions";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

export default function ActivePieceRenderer(props: { 
  piece: SharedValue<Piece>, 
  x: SharedValue<number>, 
  y: SharedValue<number>, 
  ghostX: SharedValue<number> 
}) {
  
  const cellSize = DIMENSIONS.WIDTH * 0.8 * 0.98 / 10;
  const widthGap = 1.5;
  const heightGap = widthGap / 2;

  const piece = useDerivedValue(() => {
    const currentPiece = props.piece.value;
    const currentX = props.x.value;
    const currentY = props.y.value;
    
    console.log("🔄 useDerivedValue déclenché!");
    console.log("📍 Position:", currentX, currentY);
    console.log("🎯 Pièce:", currentPiece.color, currentPiece.shape);
    
    const cells = [];
    for (let i = 0; i < currentPiece.shape.length; i++) {
      for (let j = 0; j < currentPiece.shape[i].length; j++) {
        if (currentPiece.shape[i][j]) {
          cells.push({
            x: (currentY + j) * cellSize + widthGap / 2, 
            y: (currentX + i) * cellSize + heightGap / 2, 
            color: currentPiece.color, 
            key: `${i}-${j}`
          });
        }
      }
    }
    
    console.log("📦 Cellules générées:", cells.length);
    return cells;
  }, [props.piece, props.x, props.y]);

  return (
    <Group>
      {piece.value.map((cell) => (
        <RoundedRect 
          key={cell.key}
          r={widthGap * 5} 
          x={cell.x} 
          y={cell.y} 
          width={cellSize - widthGap/2} 
          height={cellSize - heightGap/2} 
          color={Skia.Color(cell.color)} 
          style="fill" 
        />
      ))}
    </Group>
  );
}