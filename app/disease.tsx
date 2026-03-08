import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "./locales/LanguageContext";

export default function Disease() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedCrop] = useState("sugarcane");

  const diseaseData: Record<
    string,
    {
      name: string;
      class: string;
      description: string;
      bgColor: string;
      emoji: string;
      cropName: string;
    }
  > = {
    sugarcane: {
      name: t("earlyBlight"),
      class: t("fungi"),
      description: t("earlyBlightDesc"),
      bgColor: "bg-lime-600",
      emoji: "🎋",
      cropName: "Sugarcane Leaf",
    },
  };

  const disease = diseaseData[selectedCrop];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
          <Text className="text-lg font-medium ml-1">{t("back")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* Crop Card */}
        <View
          className={`${disease.bgColor} rounded-3xl h-44 items-center justify-center mb-6 relative overflow-hidden`}
        >
          <Text className="text-8xl absolute">{disease.emoji}</Text>
          <View className="absolute top-8 left-8">
            <Text className="text-2xl font-bold text-white">
              {disease.cropName}
            </Text>
            <Text className="text-base text-white opacity-90">
              {t("identifier")}
            </Text>
          </View>
        </View>

        {/* Disease Info Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm relative">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-5 right-5 w-10 h-10 bg-gray-100 rounded-full items-center justify-center z-10"
            onPress={() => router.push("/")}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Disease Name */}
          <Text className="text-3xl font-bold text-gray-900 mb-3 pr-12">
            {disease.name}
          </Text>

          {/* Disease Class */}
          <Text className="text-lg text-gray-800 mb-6">
            <Text className="font-semibold">{t("class")}: </Text>
            {disease.class}
          </Text>

          {/* Description */}
          <Text className="text-lg text-gray-800 leading-7">
            {disease.description}
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
