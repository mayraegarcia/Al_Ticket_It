
import React, { createContext, useContext, useState } from "react";

const themes = {
  light: {
    bg: "#F6F1E7",
    surface: "#FFFFFF",
    surface2: "#DDE5D6",
    text: "#252A38",
    muted: "#727583",
    primary: "#E97862",
    primaryText: "#FFFFFF",
    accent: "#E8B96D",
    border: "#E7E0D5",
    nav: "#FFFFFF"
  },
  dark: {
    bg: "#171925",
    surface: "#232738",
    surface2: "#303B43",
    text: "#F5F1EA",
    muted: "#B3B6C3",
    primary: "#F08770",
    primaryText: "#241F2A",
    accent: "#E8B96D",
    border: "#383D4C",
    nav: "#232738"
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        dark,
        setDark,
        C: themes[dark ? "dark" : "light"]
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
