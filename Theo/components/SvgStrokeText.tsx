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
}

export default function SvgStrokeText({
  text,
  fontSize = 18,
  fontFamily,
  stroke = "black",
  strokeWidth = 1.2,
  fill = "white",
  style,
}: Props) {
  // rough width estimation — enough for headers/month names
  const estimatedWidth = text.length * (fontSize * 0.6);
  const flattenedStyle = style
    ? Array.isArray(style)
      ? Object.assign({}, ...style)
      : style
    : {};

  return (
    <Svg height={fontSize * 1.6} width={estimatedWidth}>
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