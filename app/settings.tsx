import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleClearCache = () => {
    Toast.show({
      type: "success",
      text1: t("success") || "Success",
      text2: t("cacheCleared") || "Cache cleared successfully",
      position: "bottom",
      visibilityTime: 2000,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="px-6 pt-14 pb-4 border-b"
      >
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
          <Text
            style={{ color: colors.text, ...getFontStyle(language, "medium") }}
            className="text-lg ml-1"
          >
            {t("back")}
          </Text>
        </TouchableOpacity>
        <Text
          style={{ color: colors.text, ...getFontStyle(language, "bold") }}
          className="text-3xl mt-4"
        >
          {t("settings") || "Settings"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Language Section */}
        <View className="px-6 py-6">
          <Text
            style={{
              color: colors.textSecondary,
              ...getFontStyle(language, "semibold"),
            }}
            className="text-sm uppercase mb-4"
          >
            {language === "en" ? "Language" : "भाषा"}
          </Text>

          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-2xl overflow-hidden"
          >
            <TouchableOpacity
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-5 border-b"
              onPress={() => setLanguage("en")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-3xl mr-3">🇬🇧</Text>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle("en", "medium"),
                  }}
                  className="text-lg"
                >
                  English
                </Text>
              </View>
              {language === "en" && (
                <Ionicons name="checkmark-circle" size={24} color="#84cc16" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between px-5 py-5"
              onPress={() => setLanguage("hi")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-3xl mr-3">🇮🇳</Text>
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle("hi", "medium"),
                  }}
                  className="text-lg"
                >
                  हिन्दी (Hindi)
                </Text>
              </View>
              {language === "hi" && (
                <Ionicons name="checkmark-circle" size={24} color="#84cc16" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View className="px-6 py-4">
          <Text
            style={{
              color: colors.textSecondary,
              ...getFontStyle(language, "semibold"),
            }}
            className="text-sm uppercase mb-4"
          >
            {t("notifications") || "Notifications"}
          </Text>

          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-2xl overflow-hidden"
          >
            <View className="flex-row items-center justify-between px-5 py-5">
              <View className="flex-row items-center flex-1">
                <Ionicons name="notifications" size={28} color={colors.text} />
                <View className="ml-4 flex-1">
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "medium"),
                    }}
                    className="text-lg"
                  >
                    {language === "en" ? "Notifications" : "सूचनाएं"}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language),
                    }}
                    className="text-sm mt-1"
                  >
                    {language === "en"
                      ? "Get alerts for disease updates"
                      : "रोग अपडेट के लिए सूचना पाएं"}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#767577", true: "#84cc16" }}
                thumbColor={notifications ? "#65a30d" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className="px-6 py-6 mt-4">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-2xl p-6 items-center"
          >
            <Ionicons name="leaf" size={48} color="#84cc16" />
            <Text
              style={{ color: colors.text, ...getFontStyle(language, "bold") }}
              className="text-xl mt-3"
            >
              Crop Disease Detector
            </Text>
            <Text
              style={{ color: colors.textSecondary, ...getFontStyle(language) }}
              className="text-base mt-2"
            >
              {language === "en" ? "Version 1.0.0" : "संस्करण 1.0.0"}
            </Text>
            <Text
              style={{ color: colors.textSecondary, ...getFontStyle(language) }}
              className="text-sm mt-4 text-center"
            >
              {language === "en"
                ? "Helping farmers protect their crops"
                : "किसानों को उनकी फसलों की रक्षा में मदद"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
