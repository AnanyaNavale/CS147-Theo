import React from "react";
import { View, StyleProp, TextStyle, ViewStyle } from "react-native";
import Svg, { Text as SvgText, TSpan } from "react-native-svg";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

export type SvgStrokeTextProps = {
  text: string;
  stroke?: string;
  strokeWidth?: number;
  
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textAnchor?: "start" | "middle" | "end"
};

export default function SvgStrokeText({
  text,
  stroke = colors.light.header1,
  strokeWidth = 0.3,
  textStyle,
  containerStyle,
  textAnchor = "middle",
}: SvgStrokeTextProps) {
  // Flatten textStyle so we can extract font props
  const flattened = Array.isArray(textStyle)
    ? Object.assign({}, ...textStyle)
    : textStyle || {};

  const fontSize = flattened.fontSize || fonts.sizes.header;
  const fontFamily = flattened.fontFamily || fonts.typeface.header;
  const fill = flattened.color || colors.light.header1;

  const lines = text.split(/\r?\n/);

  // Size SVG based on some simple estimate
  const lineHeight = fontSize * 1.3; // more breathing room
  const height = lines.length * lineHeight; // padding to prevent clipping
  const width = Math.max(...lines.map((l) => l.length)) * (fontSize * 0.6); // padding

  return (
    <View style={containerStyle}>
    {/* <View style={[containerStyle, { alignSelf: 'center' }]}> */}
      <Svg width={width} height={height}>
        <SvgText
          x={textAnchor === "start" ? 0 : textAnchor === "end" ? width : "50%"}
          y={fontSize}
          textAnchor={textAnchor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        >
          {lines.map((line, index) => (
            <TSpan
              key={index}
              x={textAnchor === "start" ? 0 : textAnchor === "end" ? width : "50%"}
              dy={index === 0 ? 0 : lineHeight}
            >
              {line}
            </TSpan>
          ))}
        </SvgText>
      </Svg>
    </View>
  );
}
