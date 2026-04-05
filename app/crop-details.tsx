import { Ionicons } from "@expo/vector-icons";
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
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getDiseases, isApiConfigurationError } from "./services/api.service";
import { getCropBanner } from "./utils/cropImages";
import { getFontStyle } from "./utils/fonts";

/** snake_case → Title Case */
function formatDiseaseName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CropDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { cropName } = useLocalSearchParams();

  const [diseases, setDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (cropName) {
      setLoading(true);
      setFetchError(false);
      setFetchErrorMessage(null);
      getDiseases(cropName as string)
        .then((res) => setDiseases(res.diseases))
        .catch((error) => {
          setFetchError(true);
          if (isApiConfigurationError(error)) {
            setFetchErrorMessage(error.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [cropName, retryKey]);

  const banner = getCropBanner((cropName as string) ?? "");

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
            {cropName}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Banner */}
        <View className="px-6 pt-2 pb-4">
          <View
            style={{ backgroundColor: "#84cc16" }}
            className="rounded-3xl overflow-hidden shadow-xl"
          >
            <Image
              source={banner}
              style={{ width: "100%", height: 180 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Diseases List */}
        <View className="px-6">
          <Text
            style={{ color: colors.text, ...getFontStyle(language, "bold") }}
            className="text-xl mb-4"
          >
            {language === "en" ? "Common Diseases" : "सामान्य रोग"}
          </Text>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#84cc16" />
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "medium"),
                }}
                className="text-sm mt-3"
              >
                {language === "en"
                  ? "Loading diseases..."
                  : "रोग लोड हो रहे हैं..."}
              </Text>
            </View>
          ) : fetchError ? (
            <View className="items-center py-10 px-4">
              <Ionicons
                name="cloud-offline-outline"
                size={44}
                color="#ef4444"
              />
              <Text
                style={{
                  color: "#ef4444",
                  ...getFontStyle(language, "semibold"),
                }}
                className="text-base text-center mt-3 mb-1"
              >
                {language === "en"
                  ? "Failed to load diseases"
                  : "रोग लोड नहीं हो सके"}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                }}
                className="text-sm text-center mb-4"
              >
                {fetchErrorMessage ??
                  (language === "en"
                    ? "Check your connection and try again."
                    : "कनेक्शन जांचें और पुनः प्रयास करें।")}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#84cc16" }}
                className="px-8 py-3 rounded-full"
                onPress={() => setRetryKey((k) => k + 1)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: "#fff",
                    ...getFontStyle(language, "semibold"),
                  }}
                  className="text-sm"
                >
                  {language === "en" ? "Try Again" : "पुनः प्रयास करें"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            diseases.map((diseaseName) => (
              <TouchableOpacity
                key={diseaseName}
                style={{ backgroundColor: colors.card }}
                className="flex-row items-center justify-between p-4 rounded-2xl mb-3 shadow-lg"
                onPress={() =>
                  router.push({
                    pathname: "/disease-detail",
                    params: {
                      cropName: cropName as string,
                      diseaseName,
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "semibold"),
                    }}
                    className="text-base mb-1"
                  >
                    {formatDiseaseName(diseaseName)}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "regular"),
                    }}
                    className="text-sm"
                  >
                    {language === "en"
                      ? "Tap to view details"
                      : "विवरण देखने के लिए टैप करें"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Camera Button Fixed at Bottom */}
      <View
        style={{
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + 20,
        }}
        className="px-6 pt-4"
      >
        <TouchableOpacity
          style={{ backgroundColor: "#84cc16" }}
          className="rounded-2xl py-4 px-8 shadow-xl flex-row items-center justify-center"
          onPress={() => router.push("/identifier")}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text
            style={{ ...getFontStyle(language, "bold") }}
            className="text-lg text-white ml-3"
          >
            {language === "en" ? "Scan Now" : "तस्वीर लें"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
