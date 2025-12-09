// design/theme.ts
import { colors as palettes } from "@/design/colors";

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  pill: 999,
};

const getShadow = (primary: string) => ({
  soft: {
    shadowColor: primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  medium: {
    shadowColor: primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

const typography = {
  families: {
    handwritten: "AnticDidone-Regular",
    regular: "Raleway-Regular",
    medium: "Raleway-Medium",
    bold: "Raleway-Bold",
    serif: "PlayfairDisplay-Regular",
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 22,
    xl: 28,
    xxl: 34,
  },
  weights: {
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
  },
};

const lightColors = { ...palettes.light };
const darkColors = { ...palettes.dark };

const baseInput = {
  height: 48,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderRadius: 14,
};

const baseCheckbox = {
  size: 24,
  borderColor: "#8A5E3C",
  checkColor: "#000",
  bg: "transparent",
};

const baseModal = {
  radius: 18,
  borderWidth: 1,
};

export const themes = {
  light: {
    mode: "light" as const,
    colors: lightColors,
    spacing,
    radii,
    shadow: getShadow(lightColors.primary),
    typography,
    input: {
      ...baseInput,
      borderColor: "#8A5E3C",
      placeholder: "#B8A895",
    },
    checkbox: {
      ...baseCheckbox,
      borderColor: lightColors.primary,
      checkColor: lightColors.body,
    },
    modal: {
      ...baseModal,
      cardBg: lightColors.background,
      borderColor: lightColors.border,
    },
  },
  dark: {
    mode: "dark" as const,
    colors: darkColors,
    spacing,
    radii,
    shadow: getShadow(darkColors.primary),
    typography,
    input: {
      ...baseInput,
      borderColor: darkColors.border,
      placeholder: "#C9C9C9",
    },
    checkbox: {
      ...baseCheckbox,
      borderColor: darkColors.border,
      checkColor: darkColors.body,
      bg: "#2A221D",
    },
    modal: {
      ...baseModal,
      cardBg: darkColors.background,
      borderColor: darkColors.border,
    },
  },
};

export type Theme = (typeof themes)[keyof typeof themes];
export const theme = themes.light;
