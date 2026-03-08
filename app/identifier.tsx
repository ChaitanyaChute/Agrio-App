import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

export default function Identifier() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const [selectedCrop, setSelectedCrop] = useState("corn");
  const [isProcessing, setIsProcessing] = useState(false);

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

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        Toast.show({
          type: "info",
          text1: "Image Captured",
          text2:
            "ML model integration coming soon. Disease detection will be available after model is connected.",
          position: "bottom",
          visibilityTime: 4000,
        });
      }, 1500);
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        Toast.show({
          type: "info",
          text1: "Image Selected",
          text2:
            "ML model integration coming soon. Disease detection will be available after model is connected.",
          position: "bottom",
          visibilityTime: 4000,
        });
      }, 1500);
    }
  };

  const cropData: Record<
    string,
    { title: string; bgColor: string; emoji: string }
  > = {
    corn: { title: t("cornLeaf"), bgColor: "bg-amber-400", emoji: "🌽" },
    sugarcane: { title: "Sugarcane Leaf", bgColor: "bg-lime-600", emoji: "🎋" },
  };

  const currentCrop = cropData[selectedCrop];

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

      <View className="px-6 flex-1">
        {/* Crop Card */}
        <View className="rounded-3xl overflow-hidden mb-4">
          <Image
            source={require("../assets/images/ImagePage_Banner.png")}
            className="w-full h-52"
            resizeMode="cover"
          />
        </View>

        {/* Logo and Tagline Section */}
        <View className="items-center mb-6 px-6">
          <Image
            source={require("../assets/images/agrio-logo-bg.png")}
            className="w-60 h-40"
            resizeMode="contain"
          />
          <Text
            style={{ color: colors.text, ...getFontStyle(language, "medium") }}
            className="text-center text-lg leading-6 -mt-8"
          >
            <Text style={{ ...getFontStyle(language, "bold") }}>
              Supporting Farmers in{"\n"}
            </Text>
            Safeguarding their Crop Health
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 mb-4">
          {/* Take Picture Card */}
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

          {/* Import from Gallery Card */}
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
              {language === "en" ? "Processing..." : "प्रसंस्करण..."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
