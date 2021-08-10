import * as React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

const ColoredRect = () => {
  const [color, setColor] = React.useState('green');

  const handleClick = () => {
    setColor(Konva.Util.getRandomColor())
  };

  return (
    <Rect
      x={20}
      y={20}
      width={50}
      height={50}
      fill={color}
      shadowBlur={5}
      onClick={handleClick}
    />
  );
};

const VizKonva = () => {
  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <>
      <h1>Konva</h1>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text text="Click the rectangle" />
          <ColoredRect />
        </Layer>
      </Stage>
    </>
  );
}

export { VizKonva };
