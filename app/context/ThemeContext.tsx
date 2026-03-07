import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    card: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme_mode");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem("theme_mode", newMode ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = isDarkMode
    ? {
        background: "#121212",
        surface: "#1E1E1E",
        text: "#FFFFFF",
        textSecondary: "#B0B0B0",
        primary: "#84cc16",
        border: "#333333",
        card: "#2A2A2A",
      }
    : {
        background: "#FFFFFF",
        surface: "#F9FAFB",
        text: "#1F2937",
        textSecondary: "#6B7280",
        primary: "#84cc16",
        border: "#E5E7EB",
        card: "#FFFFFF",
      };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
