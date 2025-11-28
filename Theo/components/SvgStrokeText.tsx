import React from "react";
import { View, StyleProp, TextStyle, ViewStyle } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

export type SvgStrokeTextProps = {
  text: string;
  stroke?: string;
  strokeWidth?: number;

  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function SvgStrokeText({
  text,
  stroke = colors.light.header1,
  strokeWidth = 0.3,
  textStyle,
  containerStyle,
}: SvgStrokeTextProps) {
  // Flatten textStyle so we can extract font props
  const flattened = Array.isArray(textStyle)
    ? Object.assign({}, ...textStyle)
    : textStyle || {};

  const fontSize = flattened.fontSize || fonts.sizes.header;
  const fontFamily = flattened.fontFamily || fonts.typeface.header;
  const fill = flattened.color || colors.light.header1;

  // Size SVG based on some simple estimate
  const width = text.length * (fontSize * 0.6);
  const height = fontSize * 1.2;

  return (
    <View style={containerStyle}>
      <Svg width={width} height={height}>
        <SvgText
          x="50%"
          y="50%"
          alignmentBaseline="middle"
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
}