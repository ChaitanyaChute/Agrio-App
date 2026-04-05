import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    isApiConfigurationError,
    predictDisease,
    PredictResult,
} from "./services/api.service";
import { getFontStyle } from "./utils/fonts";

type FastApi422Detail =
  | string
  | {
      error?: string;
      message?: string;
    };

export default function Identifier() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  const runPrediction = async (imageUri: string) => {
    setPickedImageUri(imageUri);
    setResult(null);
    setIsProcessing(true);
    try {
      const data = await predictDisease(imageUri);
      setResult(data);
    } catch (error: unknown) {
      if (isApiConfigurationError(error)) {
        Alert.alert(
          language === "en" ? "Setup Required" : "सेटअप आवश्यक",
          language === "en"
            ? error.message
            : "रिलीज़ ऐप में सर्वर URL सेट नहीं है। कृपया EXPO_PUBLIC_DATA_API_BASE और EXPO_PUBLIC_ML_API_BASE सही URL पर सेट करके APK दोबारा बनाएं।",
        );
        return;
      }

      const axiosError = error as {
        response?: { status: number; data?: { detail?: FastApi422Detail } };
      };
      if (axiosError.response?.status === 422) {
        const detail = axiosError.response.data?.detail;
        const notLeaf =
          typeof detail === "object" && detail?.error === "not_a_leaf";
        const messageFromServer =
          typeof detail === "string"
            ? detail
            : typeof detail === "object"
              ? detail?.message
              : undefined;

        Alert.alert(
          language === "en" ? "Not a Leaf" : "पत्ती नहीं है",
          language === "en"
            ? notLeaf
              ? "The image does not appear to be a crop leaf. Please try again with a clear leaf photo."
              : (messageFromServer ??
                "The image does not appear to be a crop leaf. Please try again with a clear leaf photo.")
            : "यह छवि फसल की पत्ती नहीं लगती। कृपया स्पष्ट पत्ती की फोटो से पुनः प्रयास करें।",
        );
      } else {
        Alert.alert(
          language === "en" ? "Error" : "त्रुटि",
          language === "en"
            ? "Something went wrong. Please try again."
            : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "error",
        text1: t("permissionRequired"),
        text2: t("cameraPermission"),
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
    });

    if (!picked.canceled && picked.assets[0]) {
      await runPrediction(picked.assets[0].uri);
    }
  };

  const handleImportImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "error",
        text1: t("permissionRequired"),
        text2: t("galleryPermission"),
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!picked.canceled && picked.assets[0]) {
      await runPrediction(picked.assets[0].uri);
    }
  };

  const severityColor = (pct: number) => {
    if (pct < 30) return "#22c55e"; // green
    if (pct < 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const renderTreatmentList = (items: string[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <Text
          style={{
            color: colors.text,
            ...getFontStyle(language, "regular"),
          }}
          className="text-sm leading-5"
        >
          {emptyMessage}
        </Text>
      );
    }

    return (
      <View className="mt-1">
        {items.map((item, index) => (
          <View
            key={`${index}-${item}`}
            className="flex-row items-start mb-1.5"
          >
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "medium"),
              }}
              className="text-sm mr-2"
            >
              {index + 1}.
            </Text>
            <Text
              style={{
                color: colors.text,
                ...getFontStyle(language, "regular"),
              }}
              className="text-sm leading-5 flex-1"
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-6">
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
            {language === "en" ? "Scan Disease" : "रोग स्कैन करें"}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView
        className="px-6 flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Banner / picked image */}
        <View className="rounded-3xl overflow-hidden mb-4">
          {pickedImageUri ? (
            <Image
              source={{ uri: pickedImageUri }}
              className="w-full h-52"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../assets/images/ImagePage_Banner.png")}
              className="w-full h-52"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Logo and Tagline — shown only before first scan */}
        {!result && !isProcessing && (
          <View className="items-center mb-6 px-6">
            <Image
              source={require("../assets/images/agrio-logo-bg.png")}
              className="w-60 h-40"
              resizeMode="contain"
            />
            <Text
              style={{
                color: colors.text,
                ...getFontStyle(language, "medium"),
              }}
              className="text-center text-lg leading-6 -mt-8"
            >
              <Text style={{ ...getFontStyle(language, "bold") }}>
                Supporting Farmers in{"\n"}
              </Text>
              Safeguarding their Crop Health
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-4 mb-4">
          {/* Take Picture */}
          <TouchableOpacity
            style={{ backgroundColor: "#84cc16" }}
            className="rounded-3xl p-6 shadow-lg"
            onPress={handleTakePicture}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                className="rounded-2xl p-4 mr-4"
              >
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
              <View>
                <Text
                  style={{ ...getFontStyle(language, "bold") }}
                  className="text-xl text-white mb-1"
                >
                  {language === "en" ? "Take Picture" : "फोटो लें"}
                </Text>
                <Text
                  style={{ ...getFontStyle(language, "regular") }}
                  className="text-sm text-white/80"
                >
                  {language === "en"
                    ? "Capture with camera"
                    : "कैमरे से कैप्चर करें"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Import from Gallery */}
          <TouchableOpacity
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl p-6 shadow-lg"
            onPress={handleImportImage}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: "#84cc16" }}
                className="rounded-2xl p-4 mr-4"
              >
                <Ionicons name="images" size={32} color="#fff" />
              </View>
              <View>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-xl mb-1"
                >
                  {language === "en"
                    ? "Import from Gallery"
                    : "गैलरी से आयात करें"}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-sm"
                >
                  {language === "en" ? "Choose from photos" : "फोटो से चुनें"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View className="mt-6 items-center">
            <ActivityIndicator size="large" color="#84cc16" />
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "medium"),
              }}
              className="text-sm mt-3"
            >
              {language === "en" ? "Analyzing image..." : "छवि विश्लेषण..."}
            </Text>
          </View>
        )}

        {/* Result Card */}
        {result && !isProcessing && (
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl p-6 mt-2"
          >
            <Text
              style={{ color: colors.text, ...getFontStyle(language, "bold") }}
              className="text-xl mb-4"
            >
              {language === "en" ? "Detection Result" : "पहचान परिणाम"}
            </Text>

            {/* Crop & Disease */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-xs uppercase mb-1"
                >
                  {language === "en" ? "Crop" : "फसल"}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-base capitalize"
                >
                  {result.crop}
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-xs uppercase mb-1"
                >
                  {language === "en" ? "Disease" : "रोग"}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-base capitalize"
                >
                  {result.disease}
                </Text>
              </View>
            </View>

            {/* Confidence & Severity */}
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-xs uppercase mb-1"
                >
                  {language === "en" ? "Confidence" : "विश्वास"}
                </Text>
                <Text
                  style={{
                    color: "#84cc16",
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-base"
                >
                  {(result.confidence * 100).toFixed(1)}%
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-xs uppercase mb-1"
                >
                  {language === "en" ? "Severity" : "गंभीरता"}
                </Text>
                <Text
                  style={{
                    color: severityColor(result.severity.percentage),
                    ...getFontStyle(language, "bold"),
                  }}
                  className="text-base"
                >
                  {result.severity.percentage}% · {result.severity.label}
                </Text>
              </View>
            </View>

            {/* Severity bar */}
            <View
              style={{ backgroundColor: colors.border ?? "#e5e7eb" }}
              className="rounded-full h-2 mb-4"
            >
              <View
                style={{
                  width: `${Math.min(result.severity.percentage, 100)}%`,
                  backgroundColor: severityColor(result.severity.percentage),
                  borderRadius: 9999,
                  height: 8,
                }}
              />
            </View>

            {/* Treatment */}
            <View>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                }}
                className="text-xs uppercase mb-1"
              >
                {language === "en" ? "Recommended Treatment" : "अनुशंसित उपचार"}
              </Text>

              {/* Chemical */}
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "medium"),
                }}
                className="text-xs mt-2 mb-0.5"
              >
                {language === "en" ? "Chemical" : "रासायनिक"}
              </Text>
              {renderTreatmentList(
                result.treatment.chemical,
                language === "en"
                  ? "No chemical recommendation available"
                  : "कोई रासायनिक अनुशंसा उपलब्ध नहीं",
              )}

              {/* Organic */}
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "medium"),
                }}
                className="text-xs mt-2 mb-0.5"
              >
                {language === "en" ? "Organic" : "जैविक"}
              </Text>
              {renderTreatmentList(
                result.treatment.organic,
                language === "en"
                  ? "No organic recommendation available"
                  : "कोई जैविक अनुशंसा उपलब्ध नहीं",
              )}

              {/* Dosage & Interval */}
              <View className="flex-row mt-2">
                <View className="flex-1 mr-2">
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "medium"),
                    }}
                    className="text-xs mb-0.5"
                  >
                    {language === "en" ? "Dosage" : "खुराक"}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "regular"),
                    }}
                    className="text-sm"
                  >
                    {result.treatment.dosage}
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "medium"),
                    }}
                    className="text-xs mb-0.5"
                  >
                    {language === "en" ? "Interval" : "अंतराल"}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "regular"),
                    }}
                    className="text-sm"
                  >
                    {result.treatment.interval}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
