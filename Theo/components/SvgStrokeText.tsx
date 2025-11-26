import React from "react";
import { StyleProp, TextStyle } from 'react-native';
import Svg, { Text as SvgText } from "react-native-svg";

interface Props {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  style?: StyleProp<TextStyle>;
  width?: number | string; // allow full width
  height?: number;
}

export default function SvgStrokeText({
  text,
  fontSize = 18,
  fontFamily,
  stroke = "black",
  strokeWidth = 1.2,
  fill = "white",
  style,
  width,
  height,
}: Props) {
  // rough width estimation — enough for headers/month names
  
  const flattenedStyle = style
    ? Array.isArray(style)
      ? Object.assign({}, ...style)
      : style
    : {};

    const estimatedWidth =
      width || text.length * (flattenedStyle.fontSize || fontSize * 0.6);
    const estimatedHeight =
      height || (flattenedStyle.fontSize || fontSize) * 1.6;

    return (
      <Svg height={estimatedHeight} width={estimatedWidth}>
        <SvgText
          x="50%"
          y="50%"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={flattenedStyle.fontSize || fontSize}
          fontFamily={flattenedStyle.fontFamily || fontFamily}
          fill={flattenedStyle.color || fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        >
          {text}
        </SvgText>
      </Svg>
    );
}