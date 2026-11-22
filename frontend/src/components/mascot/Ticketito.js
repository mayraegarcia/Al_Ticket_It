
import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export default function Ticketito({
  size = 80,
  color = "#E97862",
  faceColor = "#252A38",
  detailColor = "#F6F1E7",
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessible={false}
    >
      {/* Cuerpo del ticket */}
      <Path
        d="
          M18 20
          Q18 12 27 12
          H73
          Q82 12 82 20
          V35
          Q70 38 70 50
          Q70 62 82 65
          V80
          Q82 88 73 88
          H27
          Q18 88 18 80
          V65
          Q30 62 30 50
          Q30 38 18 35
          Z
        "
        fill={color}
      />

      {/* Línea punteada del ticket */}
      <Path
        d="
          M50 19 V31
          M50 38 V45
          M50 55 V62
          M50 69 V78
        "
        stroke={detailColor}
        strokeWidth={3}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />

      {/* Ojos */}
      <Circle
        cx={39}
        cy={44}
        r={4}
        fill={faceColor}
      />

      <Circle
        cx={60}
        cy={44}
        r={4}
        fill={faceColor}
      />

      {/* Sonrisa */}
      <Path
        d="M39 57 Q50 67 61 57"
        stroke={faceColor}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
