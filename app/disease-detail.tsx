import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import {
    CureResponse,
    DescriptionResponse,
    getDescription,
    getNature,
    getTreatment,
    isApiConfigurationError,
    NatureResponse,
} from "./services/api.service";
import { getFontStyle } from "./utils/fonts";

function formatDiseaseName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function natureColor(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return "#ef4444";
  if (l === "moderate") return "#f59e0b";
  return "#22c55e";
}

const bannerMap: Record<string, any> = {
  tomato: require("../assets/images/bg/bg_tomato.png"),
  potato: require("../assets/images/bg/bg_potato.png"),
  corn: require("../assets/images/bg/bg_corn.png"),
  chilli: require("../assets/images/bg/bg_chilli.png"),
  cotton: require("../assets/images/bg/bg_cotton.png"),
  soyabean: require("../assets/images/bg/bg_soyabean.png"),
};

function getCropBanner(name: string) {
  return (
    bannerMap[name.toLowerCase()] ??
    require("../assets/images/Homepage-Banner.png")
  );
}

export default function DiseaseDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { cropName, diseaseName } = useLocalSearchParams<{
    cropName: string;
    diseaseName: string;
  }>();

  const [descData, setDescData] = useState<DescriptionResponse | null>(null);
  const [cureData, setCureData] = useState<CureResponse | null>(null);
  const [natureData, setNatureData] = useState<NatureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Reset all state before each new fetch so stale data never bleeds across
    setLoading(true);
    setFetchError(false);
    setFetchErrorMessage(null);
    setDescData(null);
    setCureData(null);
    setNatureData(null);
    checkBookmarkStatus();
    Promise.allSettled([
      getDescription(cropName, diseaseName),
      getTreatment(cropName, diseaseName),
      getNature(cropName, diseaseName),
    ])
      .then(([descResult, cureResult, natureResult]) => {
        if (descResult.status === "fulfilled") setDescData(descResult.value);
        if (cureResult.status === "fulfilled") setCureData(cureResult.value);
        if (natureResult.status === "fulfilled")
          setNatureData(natureResult.value);
        if (
          descResult.status === "rejected" &&
          cureResult.status === "rejected" &&
          natureResult.status === "rejected"
        ) {
          setFetchError(true);

          const rejectedReasons = [descResult, cureResult, natureResult]
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === "rejected",
            )
            .map((result) => result.reason);

          const configError = rejectedReasons.find((reason) =>
            isApiConfigurationError(reason),
          );

          if (isApiConfigurationError(configError)) {
            setFetchErrorMessage(configError.message);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [cropName, diseaseName, retryKey]);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarkedDiseases");
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks);
        setIsBookmarked(
          parsed.some(
            (item: any) =>
              item.diseaseName === diseaseName && item.cropName === cropName,
          ),
        );
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
          cropName,
          diseaseName,
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
    }
  };

  const displayName = formatDiseaseName(diseaseName ?? "");

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
            {displayName}
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
        {/* Banner */}
        <View className="px-6 pt-2 pb-4">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl overflow-hidden shadow-xl"
          >
            <Image
              source={getCropBanner(cropName ?? "")}
              style={{ width: "100%", height: 220 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#84cc16" />
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "medium"),
              }}
              className="text-sm mt-3"
            >
              {language === "en"
                ? "Loading details..."
                : "विवरण लोड हो रहा है..."}
            </Text>
          </View>
        ) : fetchError ? (
          <View className="items-center py-16 px-6">
            <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
            <Text
              style={{
                color: "#ef4444",
                ...getFontStyle(language, "semibold"),
              }}
              className="text-base text-center mt-3 mb-1"
            >
              {language === "en" ? "Failed to load" : "लोड नहीं हो सका"}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "regular"),
              }}
              className="text-sm text-center mb-5"
            >
              {fetchErrorMessage ??
                (language === "en"
                  ? "Could not reach the server. Check your connection and try again."
                  : "सर्वर से संपर्क नहीं हो सका। कनेक्शन जांचें।")}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: "#84cc16" }}
              className="px-8 py-3 rounded-full"
              onPress={() => setRetryKey((k) => k + 1)}
              activeOpacity={0.7}
            >
              <Text
                style={{ color: "#fff", ...getFontStyle(language, "semibold") }}
                className="text-sm"
              >
                {language === "en" ? "Try Again" : "पुनः प्रयास करें"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6" style={{ gap: 16 }}>
            {/* ── Info card ── */}
            <View
              style={{ backgroundColor: colors.card }}
              className="rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Card header accent bar */}
              <View style={{ backgroundColor: "#84cc16", height: 4 }} />
              <View className="p-6">
                {/* Title */}
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-2xl mb-3"
                >
                  {displayName}
                </Text>

                {/* Badges row */}
                <View className="flex-row flex-wrap gap-2 mb-5">
                  <View
                    style={{
                      backgroundColor: "#84cc1620",
                      borderColor: "#84cc16",
                      borderWidth: 1,
                    }}
                    className="px-3 py-1 rounded-full flex-row items-center gap-1"
                  >
                    <Ionicons name="leaf" size={12} color="#84cc16" />
                    <Text
                      style={{
                        color: "#84cc16",
                        ...getFontStyle(language, "semibold"),
                      }}
                      className="text-xs"
                    >
                      {cropName}
                    </Text>
                  </View>
                  {natureData && (
                    <View
                      style={{
                        backgroundColor:
                          natureColor(natureData.nature_of_disease) + "20",
                        borderColor: natureColor(natureData.nature_of_disease),
                        borderWidth: 1,
                      }}
                      className="px-3 py-1 rounded-full flex-row items-center gap-1"
                    >
                      <Ionicons
                        name="warning"
                        size={12}
                        color={natureColor(natureData.nature_of_disease)}
                      />
                      <Text
                        style={{
                          color: natureColor(natureData.nature_of_disease),
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-xs"
                      >
                        {natureData.nature_of_disease}
                      </Text>
                    </View>
                  )}
                </View>

                {descData && (
                  <>
                    {/* About */}
                    <View className="flex-row items-center gap-2 mb-2">
                      <View
                        style={{ backgroundColor: "#84cc1620" }}
                        className="w-7 h-7 rounded-xl items-center justify-center"
                      >
                        <Ionicons
                          name="information-circle"
                          size={16}
                          color="#84cc16"
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-base"
                      >
                        {language === "en"
                          ? "About Disease"
                          : "रोग के बारे में"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        ...getFontStyle(language, "regular"),
                        lineHeight: 22,
                      }}
                      className="text-sm mb-5"
                    >
                      {descData.about_disease}
                    </Text>

                    {/* Divider */}
                    <View
                      style={{ height: 1, backgroundColor: colors.border }}
                      className="mb-4"
                    />

                    {/* Symptoms */}
                    <View className="flex-row items-center gap-2 mb-3">
                      <View
                        style={{ backgroundColor: "#f59e0b20" }}
                        className="w-7 h-7 rounded-xl items-center justify-center"
                      >
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color="#f59e0b"
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-base"
                      >
                        {language === "en" ? "Symptoms" : "लक्षण"}
                      </Text>
                    </View>
                    {descData.symptoms.map((symptom, i) => (
                      <View key={i} className="flex-row items-start mb-2">
                        <View
                          style={{ backgroundColor: "#f59e0b" }}
                          className="w-5 h-5 rounded-full items-center justify-center mt-0.5 mr-2 shrink-0"
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: "700",
                            }}
                          >
                            {i + 1}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                            flex: 1,
                            lineHeight: 20,
                          }}
                          className="text-sm"
                        >
                          {symptom}
                        </Text>
                      </View>
                    ))}

                    {/* Divider */}
                    <View
                      style={{ height: 1, backgroundColor: colors.border }}
                      className="mt-2 mb-4"
                    />

                    {/* Cause */}
                    <View className="flex-row items-center gap-2 mb-2">
                      <View
                        style={{ backgroundColor: "#ef444420" }}
                        className="w-7 h-7 rounded-xl items-center justify-center"
                      >
                        <Ionicons name="bug" size={16} color="#ef4444" />
                      </View>
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-base"
                      >
                        {language === "en" ? "Cause" : "कारण"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        ...getFontStyle(language, "regular"),
                        lineHeight: 22,
                      }}
                      className="text-sm"
                    >
                      {descData.cause}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* ── Treatment card ── */}
            {cureData && (
              <View
                style={{ backgroundColor: colors.card }}
                className="rounded-3xl overflow-hidden shadow-lg"
              >
                <View style={{ backgroundColor: "#f59e0b", height: 4 }} />
                <View className="p-6">
                  {/* Header */}
                  <View className="flex-row items-center gap-2 mb-5">
                    <View
                      style={{ backgroundColor: "#f59e0b20" }}
                      className="w-8 h-8 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="flask" size={18} color="#f59e0b" />
                    </View>
                    <Text
                      style={{
                        color: colors.text,
                        ...getFontStyle(language, "bold"),
                      }}
                      className="text-xl"
                    >
                      {language === "en" ? "Treatment" : "उपचार"}
                    </Text>
                  </View>

                  {/* Chemical section */}
                  <View
                    style={{
                      backgroundColor: "#f59e0b15",
                      borderLeftWidth: 3,
                      borderLeftColor: "#f59e0b",
                    }}
                    className="rounded-r-2xl px-4 py-3 mb-4"
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons name="flask" size={14} color="#f59e0b" />
                      <Text
                        style={{
                          color: "#f59e0b",
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {language === "en"
                          ? "Chemical Control"
                          : "रासायनिक नियंत्रण"}
                      </Text>
                    </View>
                    {cureData.chemical.map((item, i) => (
                      <View key={i} className="flex-row items-start mb-1.5">
                        <View
                          style={{ backgroundColor: "#f59e0b" }}
                          className="w-1.5 h-1.5 rounded-full mt-2 mr-2 shrink-0"
                        />
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                            flex: 1,
                            lineHeight: 20,
                          }}
                          className="text-sm"
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Organic section */}
                  <View
                    style={{
                      backgroundColor: "#84cc1615",
                      borderLeftWidth: 3,
                      borderLeftColor: "#84cc16",
                    }}
                    className="rounded-r-2xl px-4 py-3 mb-5"
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons name="leaf" size={14} color="#84cc16" />
                      <Text
                        style={{
                          color: "#84cc16",
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {language === "en"
                          ? "Organic Control"
                          : "जैविक नियंत्रण"}
                      </Text>
                    </View>
                    {cureData.organic.map((item, i) => (
                      <View key={i} className="flex-row items-start mb-1.5">
                        <View
                          style={{ backgroundColor: "#84cc16" }}
                          className="w-1.5 h-1.5 rounded-full mt-2 mr-2 shrink-0"
                        />
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                            flex: 1,
                            lineHeight: 20,
                          }}
                          className="text-sm"
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Dosage + Interval chips */}
                  <View className="flex-row gap-3">
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="flex-1 rounded-2xl p-3"
                    >
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <Ionicons
                          name="beaker"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "medium"),
                          }}
                          className="text-xs uppercase"
                        >
                          {language === "en" ? "Dosage" : "खुराक"}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {cureData.dosage}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="flex-1 rounded-2xl p-3"
                    >
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <Ionicons
                          name="time"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "medium"),
                          }}
                          className="text-xs uppercase"
                        >
                          {language === "en" ? "Interval" : "अंतराल"}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {cureData.interval}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
