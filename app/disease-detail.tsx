import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

export default function DiseaseDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const {
    diseaseName,
    diseaseNameLang,
    diseaseClass,
    diseaseClassLang,
    description,
    descriptionLang,
    cropName,
  } = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, []);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarkedDiseases");
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks);
        const exists = parsed.some(
          (item: any) =>
            item.diseaseName === diseaseName && item.cropName === cropName,
        );
        setIsBookmarked(exists);
      }
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarkedDiseases");
      let parsed = bookmarks ? JSON.parse(bookmarks) : [];

      if (isBookmarked) {
        parsed = parsed.filter(
          (item: any) =>
            !(item.diseaseName === diseaseName && item.cropName === cropName),
        );
        Toast.show({
          type: "success",
          text1: language === "en" ? "Removed" : "हटाया गया",
          text2:
            language === "en"
              ? "Removed from bookmarks"
              : "बुकमार्क से हटाया गया",
          position: "bottom",
          visibilityTime: 2000,
        });
      } else {
        parsed.push({
          diseaseName,
          diseaseNameLang,
          diseaseClass,
          diseaseClassLang,
          description,
          descriptionLang,
          cropName,
          timestamp: new Date().toISOString(),
        });
        Toast.show({
          type: "success",
          text1: language === "en" ? "Saved" : "सहेजा गया",
          text2:
            language === "en" ? "Added to bookmarks" : "बुकमार्क में जोड़ा गया",
          position: "bottom",
          visibilityTime: 2000,
        });
      }

      await AsyncStorage.setItem("bookmarkedDiseases", JSON.stringify(parsed));
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Toast.show({
        type: "error",
        text1: language === "en" ? "Error" : "त्रुटि",
        text2:
          language === "en"
            ? "Failed to save bookmark"
            : "बुकमार्क सहेजने में विफल",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  const getCropBanner = () => {
    const cropNameLower = String(cropName).toLowerCase();
    if (cropNameLower.includes("corn") || cropNameLower.includes("मक्का")) {
      return require("../assets/images/bg/bg_corn.png");
    } else if (
      cropNameLower.includes("tomato") ||
      cropNameLower.includes("टमाटर")
    ) {
      return require("../assets/images/bg/bg_tomato.png");
    } else if (
      cropNameLower.includes("potato") ||
      cropNameLower.includes("आलू")
    ) {
      return require("../assets/images/bg/bg_potato.png");
    } else if (
      cropNameLower.includes("chilli") ||
      cropNameLower.includes("मिर्च")
    ) {
      return require("../assets/images/bg/bg_chilli.png");
    } else if (
      cropNameLower.includes("cotton") ||
      cropNameLower.includes("कपास")
    ) {
      return require("../assets/images/bg/bg_cotton.png");
    } else if (
      cropNameLower.includes("soyabean") ||
      cropNameLower.includes("सोयाबीन")
    ) {
      return require("../assets/images/bg/bg_soyabean.png");
    }
    return require("../assets/images/Homepage-Banner.png");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            style={{ backgroundColor: colors.card }}
            className="w-12 h-12 rounded-2xl items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text, ...getFontStyle(language, "bold") }}
            className="text-lg text-center flex-1 mx-4"
            numberOfLines={1}
          >
            {language === "en" ? diseaseName : diseaseNameLang}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.card }}
            className="w-12 h-12 rounded-2xl items-center justify-center"
            onPress={toggleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? "#84cc16" : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Disease Image */}
        <View className="px-6 pt-2 pb-4">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl overflow-hidden shadow-xl"
          >
            <Image
              source={getCropBanner()}
              style={{ width: "100%", height: 220 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Disease Info Card */}
        <View className="px-6">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl p-6 shadow-lg"
          >
            {/* Title and Class Badge */}
            <View className="mb-4">
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-2xl mb-2"
              >
                {language === "en" ? diseaseName : diseaseNameLang}
              </Text>
              <View className="bg-lime-500 self-start px-4 py-2 rounded-full">
                <Text
                  style={{ ...getFontStyle(language, "semibold") }}
                  className="text-white text-sm"
                >
                  {language === "en" ? diseaseClass : diseaseClassLang}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "semibold"),
                }}
                className="text-base mb-2"
              >
                {language === "en" ? "Description" : "विवरण"}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                  lineHeight: 22,
                }}
                className="text-sm"
              >
                {language === "en" ? description : descriptionLang}
              </Text>
            </View>

            {/* Affected Crop */}
            <View className="mb-4">
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "semibold"),
                }}
                className="text-base mb-2"
              >
                {language === "en" ? "Affected Crop" : "प्रभावित फसल"}
              </Text>
              <View className="bg-lime-500 px-4 py-2 rounded-full self-start">
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "medium"),
                  }}
                  className="text-sm text-white"
                >
                  {cropName}
                </Text>
              </View>
            </View>

            {/* Prevention */}
            <View>
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "semibold"),
                }}
                className="text-base mb-2"
              >
                {language === "en" ? "Prevention" : "रोकथाम"}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                  lineHeight: 22,
                }}
                className="text-sm "
              >
                {language === "en"
                  ? "Use disease-resistant varieties and maintain proper plant spacing for good air circulation."
                  : "रोग प्रतिरोधी किस्मों का उपयोग करें और अच्छे वायु संचलन के लिए उचित पौधे की दूरी बनाए रखें।"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
