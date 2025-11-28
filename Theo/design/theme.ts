// design/theme.ts
export const theme = {
  colors: {
    background: "#FDF6EE",
    ghost: "#f2f2f2ff",
    text: "#4A3728", // warm brown
    mutedText: "#8B7C6A",
    border: "#C8B39A",

    accent: "#CF9841", // gold-brown
    accentDark: "#8A5E3C",
    accentLight: "#E7C894",

    danger: "#7C3030",
    dangerDark: "#541c1cff",

    success: "#6BA269",

    // Gradients used in buttons/modals
    gradients: {
      gold: ["#D7B47A", "#B88A4A"] as const,
      goldLight: ["#F3DDB4", "#E4B971"] as const,
      brown: ["#B8875C", "#8A5E3C"] as const,
      danger: ["#7C3030", "#8A2D28"] as const,
    },

    overlay: "rgba(0,0,0,0.35)", // for blur + dim backgrounds
  },

  solidColors: {
    text: "#3C3C3C",
    textPrimary: "#000",
    textSecondary: "#666",
    accentDark: "#8A5E3C",
    accent: "#D7B47A",
    accentLight: "#F3DDB4",
    danger: "#7C3030",
    white: "#fff",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radii: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 22,
    pill: 999,
  },

  shadow: {
    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    medium: {
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  },

  typography: {
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
  },

  input: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderRadius: 14,
    borderColor: "#C8B39A",
    placeholder: "#B8A895",
  },

  checkbox: {
    size: 22,
    borderColor: "#8B674A",
    checkColor: "#8B674A",
    bg: "transparent",
  },

  modal: {
    cardBg: "#FFFFFF",
    radius: 18,
    borderColor: "#BFA98D",
    borderWidth: 3,
  },
};
