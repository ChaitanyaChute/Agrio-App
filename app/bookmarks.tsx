import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

export default function Bookmarks() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem("bookmarkedDiseases");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setBookmarks(parsed);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      Toast.show({
        type: "error",
        text1: language === "en" ? "Error" : "त्रुटि",
        text2:
          language === "en"
            ? "Failed to load bookmarks"
            : "बुकमार्क लोड करने में विफल",
        position: "bottom",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (diseaseName: string, cropName: string) => {
    try {
      const filtered = bookmarks.filter(
        (item) =>
          !(item.diseaseName === diseaseName && item.cropName === cropName),
      );
      await AsyncStorage.setItem(
        "bookmarkedDiseases",
        JSON.stringify(filtered),
      );
      setBookmarks(filtered);
      Toast.show({
        type: "success",
        text1: language === "en" ? "Removed" : "हटाया गया",
        text2:
          language === "en"
            ? "Bookmark removed successfully"
            : "बुकमार्क सफलतापूर्वक हटा दिया गया",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      Toast.show({
        type: "error",
        text1: language === "en" ? "Error" : "त्रुटि",
        text2:
          language === "en"
            ? "Failed to remove bookmark"
            : "बुकमार्क हटाने में विफल",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
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
            className="text-2xl"
          >
            {language === "en" ? "Bookmarks" : "बुकमार्क"}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {loading ? (
          <View className="px-6 py-8">
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "medium"),
              }}
              className="text-center text-base"
            >
              {language === "en" ? "Loading..." : "लोड हो रहा है..."}
            </Text>
          </View>
        ) : bookmarks.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View
              style={{ backgroundColor: colors.card }}
              className="rounded-full p-6 mb-4"
            >
              <Ionicons
                name="bookmark-outline"
                size={48}
                color={colors.textSecondary}
              />
            </View>
            <Text
              style={{ color: colors.text, ...getFontStyle(language, "bold") }}
              className="text-xl mb-2 text-center"
            >
              {language === "en"
                ? "No Bookmarks Yet"
                : "अभी तक कोई बुकमार्क नहीं"}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "regular"),
              }}
              className="text-sm text-center"
            >
              {language === "en"
                ? "Save diseases to view them here later"
                : "रोगों को सहेजें और उन्हें बाद में यहां देखें"}
            </Text>
          </View>
        ) : (
          <View className="px-6">
            {bookmarks.map((bookmark, index) => (
              <TouchableOpacity
                key={index}
                style={{ backgroundColor: colors.card }}
                className="rounded-2xl p-5 mb-3 shadow-lg"
                onPress={() => {
                  router.push({
                    pathname: "/disease-detail",
                    params: {
                      diseaseName: bookmark.diseaseName,
                      diseaseNameLang: bookmark.diseaseNameLang,
                      diseaseClass: bookmark.diseaseClass,
                      diseaseClassLang: bookmark.diseaseClassLang,
                      description: bookmark.description,
                      descriptionLang: bookmark.descriptionLang,
                      cropName: bookmark.cropName,
                    },
                  });
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      style={{
                        color: colors.text,
                        ...getFontStyle(language, "semibold"),
                      }}
                      className="text-lg mb-2"
                    >
                      {language === "en"
                        ? bookmark.diseaseName
                        : bookmark.diseaseNameLang}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-lime-500 px-3 py-1 rounded-full mr-2">
                        <Text
                          style={{ ...getFontStyle(language, "medium") }}
                          className="text-white text-xs"
                        >
                          {language === "en"
                            ? bookmark.diseaseClass
                            : bookmark.diseaseClassLang}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          ...getFontStyle(language, "regular"),
                        }}
                        className="text-sm"
                      >
                        {bookmark.cropName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      removeBookmark(bookmark.diseaseName, bookmark.cropName)
                    }
                    style={{ backgroundColor: "#ef4444" }}
                    className="w-10 h-10 rounded-full items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Tips Section */}
            <View className="mt-6">
              <View
                style={{ backgroundColor: colors.card }}
                className="rounded-3xl p-5 shadow-lg"
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="bulb" size={24} color="#84cc16" />
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "bold"),
                    }}
                    className="text-lg ml-2"
                  >
                    {language === "en" ? "Quick Tips" : "त्वरित सुझाव"}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-sm leading-6"
                >
                  {language === "en"
                    ? "Tap on any saved disease to view its details again. Swipe or tap the delete button to remove bookmarks you no longer need."
                    : "किसी भी सहेजी गई बीमारी पर टैप करें और उसका विवरण फिर से देखें। डिलीट बटन को टैप करें और बुकमार्क हटाएं जिनकी अब आवश्यकता नहीं है।"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
