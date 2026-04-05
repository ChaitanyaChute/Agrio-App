import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import {
    Crop,
    getCrops,
    isApiConfigurationError,
} from "./services/api.service";
import { getCropImage } from "./utils/cropImages";
import { getFontStyle } from "./utils/fonts";

export default function Crops() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [allCrops, setAllCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setFetchErrorMessage(null);
    getCrops()
      .then(setAllCrops)
      .catch((error) => {
        setFetchError(true);
        if (isApiConfigurationError(error)) {
          setFetchErrorMessage(error.message);
        }
      })
      .finally(() => setLoading(false));
  }, [retryKey]);

  const crops = allCrops.filter((crop) =>
    crop.crop_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
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
            {language === "en" ? "Crops" : "फसलें"}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <View
          style={{ backgroundColor: colors.card }}
          className="flex-row items-center px-4 py-3 rounded-2xl shadow-lg"
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              color: colors.text,
              ...getFontStyle(language, "medium"),
              flex: 1,
              marginLeft: 10,
            }}
            className="text-base"
            placeholder={
              language === "en" ? "Search crops..." : "फसलें खोजें..."
            }
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator size="large" color="#84cc16" />
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "medium"),
              }}
              className="text-sm mt-3"
            >
              {language === "en"
                ? "Loading crops..."
                : "फसलें लोड हो रही हैं..."}
            </Text>
          </View>
        ) : fetchError ? (
          <View className="flex-1 items-center justify-center py-16 px-6">
            <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
            <Text
              style={{
                color: "#ef4444",
                ...getFontStyle(language, "semibold"),
              }}
              className="text-base text-center mt-3 mb-1"
            >
              {language === "en"
                ? "Failed to load crops"
                : "फसलें लोड नहीं हो सकीं"}
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
                style={{ color: "#fff", ...getFontStyle(language, "semibold") }}
                className="text-sm"
              >
                {language === "en" ? "Try Again" : "पुनः प्रयास करें"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-4">
            {crops.map((crop) => (
              <TouchableOpacity
                key={crop.crop_id}
                style={{ backgroundColor: colors.card, width: "47%" }}
                className="rounded-3xl p-4 shadow-xl"
                onPress={() =>
                  router.push(
                    `/crop-details?cropName=${encodeURIComponent(crop.crop_name)}`,
                  )
                }
                activeOpacity={0.7}
              >
                <View className="items-center mb-3">
                  <View className="w-28 h-28 rounded-2xl overflow-hidden bg-white items-center justify-center">
                    <Image
                      source={getCropImage(crop.crop_name)}
                      className="w-24 h-24"
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-lg mb-1 text-center"
                >
                  {crop.crop_name}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-xs text-center"
                >
                  {language === "en" ? "View diseases" : "रोग देखें"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
                ? "Tap on any crop to view common diseases and their prevention methods. Use the search bar above to quickly find specific crops."
                : "किसी भी फसल पर टैप करें और आम बीमारियों तथा उनकी रोकथाम के तरीके देखें। विशिष्ट फसलों को शीघ्रता से खोजने के लिए ऊपर सर्च बार का उपयोग करें।"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
