type FontWeight = "regular" | "medium" | "semibold" | "bold";

export const getFontFamily = (
  language: string,
  weight: FontWeight = "regular",
): string => {
  const isHindi = language === "hi";

  const fontMap = {
    regular: isHindi ? "Poppins_400Regular" : "OpenSans_400Regular",
    medium: isHindi ? "Poppins_500Medium" : "OpenSans_500Medium",
    semibold: isHindi ? "Poppins_600SemiBold" : "OpenSans_600SemiBold",
    bold: isHindi ? "Poppins_700Bold" : "OpenSans_700Bold",
  };

  return fontMap[weight];
};

export const getFontStyle = (
  language: string,
  weight: FontWeight = "regular",
) => {
  return {
    fontFamily: getFontFamily(language, weight),
  };
};
