export const fontMap = {
  "AnticDidone-Regular": require("../assets/fonts/AnticDidone-Regular.ttf"),
  "CormorantGaramond-Regular": require("../assets/fonts/CormorantGaramond-Regular.ttf"),
  "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
  "Raleway-Medium": require("../assets/fonts/Raleway-Medium.ttf"),
  "Raleway-Bold": require("../assets/fonts/Raleway-Bold.ttf"),
  "Raleway-MediumItalic": require("../assets/fonts/Raleway-MediumItalic.ttf"),
  "Playfair-Display": require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
} as const;

export type AppFont = keyof typeof fontMap;
