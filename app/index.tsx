import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { colors } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "weather" | "popular" | "recent"
  >("all");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, []),
  );

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
        fetchWeatherData();
      } else {
        Toast.show({
          type: "info",
          text1: language === "en" ? "Permission Denied" : "अनुमति अस्वीकृत",
          text2:
            language === "en"
              ? "Location permission is required to fetch weather data."
              : "मौसम डेटा प्राप्त करने के लिए स्थान अनुमति आवश्यक है।",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

      const response = await axios.get(url);
      const data = response.data;

      setWeatherData({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        icon: data.weather[0].icon,
        location: data.name,
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      Toast.show({
        type: "error",
        text1: language === "en" ? "Error" : "त्रुटि",
        text2:
          language === "en"
            ? "Failed to fetch weather data. Please try again."
            : "मौसम डेटा प्राप्त करने में विफल। कृपया पुन: प्रयास करें।",
        position: "bottom",
        visibilityTime: 3000,
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: any } = {
      Clear: "sunny",
      Clouds: "cloudy",
      Rain: "rainy",
      Drizzle: "rainy",
      Thunderstorm: "thunderstorm",
      Snow: "snow",
      Mist: "partly-sunny",
      Smoke: "partly-sunny",
      Haze: "partly-sunny",
      Dust: "partly-sunny",
      Fog: "partly-sunny",
      Sand: "partly-sunny",
      Ash: "partly-sunny",
      Squall: "partly-sunny",
      Tornado: "thunderstorm",
    };
    return iconMap[condition] || "partly-sunny";
  };

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
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text
              style={{ color: colors.text, ...getFontStyle(language, "bold") }}
              className="text-2xl"
            >
              {language === "en" ? "Hey, Farmer!" : "नमस्ते, किसान!"}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                ...getFontStyle(language, "regular"),
              }}
              className="text-sm mt-1"
            >
              {new Date().toLocaleDateString(
                language === "en" ? "en-US" : "hi-IN",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              )}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              style={{ backgroundColor: colors.card }}
              className="px-4 h-12 rounded-2xl items-center justify-center flex-row"
              onPress={() => setShowLanguageModal(true)}
            >
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-base"
              >
                {language === "en" ? "EN" : "हि"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.text}
                className="ml-1"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.card }}
              className="w-12 h-12 rounded-2xl items-center justify-center"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: t("howToUse") || "How to Use",
                  text2: "Tutorial coming soon",
                  position: "bottom",
                  visibilityTime: 2000,
                });
              }}
            >
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Banner */}
        <View className="px-6 mb-4">
          <View className="rounded-3xl overflow-hidden shadow-xl">
            <Image
              source={require("../assets/images/Homepage-Banner.png")}
              style={{ width: "100%", height: 200 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Category Pills */}
        <View className="px-6 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            <TouchableOpacity
              style={{
                backgroundColor: activeTab === "all" ? "#84cc16" : colors.card,
              }}
              className="px-5 py-2 rounded-full"
              onPress={() => setActiveTab("all")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: activeTab === "all" ? "#fff" : colors.textSecondary,
                  ...getFontStyle(
                    language,
                    activeTab === "all" ? "semibold" : "medium",
                  ),
                }}
                className="text-sm"
              >
                {language === "en" ? "All Crops" : "सभी फसलें"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor:
                  activeTab === "weather" ? "#84cc16" : colors.card,
              }}
              className="px-5 py-2 rounded-full"
              onPress={() => {
                setActiveTab("weather");
                if (locationPermission && !weatherData) {
                  fetchWeatherData();
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color:
                    activeTab === "weather" ? "#fff" : colors.textSecondary,
                  ...getFontStyle(
                    language,
                    activeTab === "weather" ? "semibold" : "medium",
                  ),
                }}
                className="text-sm"
              >
                {language === "en" ? "Weather" : "मौसम"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor:
                  activeTab === "popular" ? "#84cc16" : colors.card,
              }}
              className="px-5 py-2 rounded-full"
              onPress={() => setActiveTab("popular")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color:
                    activeTab === "popular" ? "#fff" : colors.textSecondary,
                  ...getFontStyle(
                    language,
                    activeTab === "popular" ? "semibold" : "medium",
                  ),
                }}
                className="text-sm"
              >
                {language === "en" ? "Popular" : "लोकप्रिय"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor:
                  activeTab === "recent" ? "#84cc16" : colors.card,
              }}
              className="px-5 py-2 rounded-full"
              onPress={() => setActiveTab("recent")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: activeTab === "recent" ? "#fff" : colors.textSecondary,
                  ...getFontStyle(
                    language,
                    activeTab === "recent" ? "semibold" : "medium",
                  ),
                }}
                className="text-sm"
              >
                {language === "en" ? "Recent Activity" : "हाल की गतिविधि"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Feature Cards Grid */}
        <View className="px-6">
          <View className="flex-row flex-wrap gap-4">
            {/* Scan Disease Card - Large Active */}
            <TouchableOpacity
              style={{ backgroundColor: "#84cc16", width: "100%" }}
              className="rounded-3xl p-6 shadow-xl"
              onPress={() => router.push("/identifier")}
              activeOpacity={0.8}
            >
              <View className="mb-4">
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
              <Text
                style={{ ...getFontStyle(language, "bold") }}
                className="text-2xl text-white mb-1"
              >
                {language === "en" ? "Scan Disease" : "रोग स्कैन करें"}
              </Text>
              <Text
                style={{ ...getFontStyle(language, "regular") }}
                className="text-sm text-white/80"
              >
                {language === "en" ? "AI Detection" : "एआई पहचान"}
              </Text>
            </TouchableOpacity>

            {/* Browse Crops Card */}
            <TouchableOpacity
              style={{ backgroundColor: colors.card, width: "47%" }}
              className="rounded-3xl p-5 shadow-lg"
              onPress={() => router.push("/crops")}
              activeOpacity={0.7}
            >
              <View className="mb-3">
                <Ionicons name="leaf" size={32} color={colors.text} />
              </View>
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-lg mb-1"
              >
                {language === "en" ? "Browse Crops" : "फसलें"}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                }}
                className="text-xs"
              >
                {language === "en" ? "6 Crops" : "6 फसलें"}
              </Text>
            </TouchableOpacity>

            {/* Bookmarks Card */}
            <TouchableOpacity
              style={{ backgroundColor: colors.card, width: "47%" }}
              className="rounded-3xl p-5 shadow-lg"
              onPress={() => router.push("/bookmarks")}
              activeOpacity={0.7}
            >
              <View className="mb-3">
                <Ionicons name="bookmark" size={32} color={colors.text} />
              </View>
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-lg mb-1"
              >
                {language === "en" ? "Bookmarks" : "बुकमार्क"}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  ...getFontStyle(language, "regular"),
                }}
                className="text-xs"
              >
                {language === "en" ? "Saved" : "सहेजे गए"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Content Card */}
        <View className="px-6 mt-2 mb-4">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl shadow-xl p-5"
          >
            {activeTab === "all" && (
              <View>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="bulb" size={20} color="#84cc16" />
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "bold"),
                    }}
                    className="text-base ml-2"
                  >
                    {language === "en" ? "Quick Tips" : "त्वरित सुझाव"}
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <View
                    style={{ backgroundColor: "#84cc16" }}
                    className="w-2 h-2 rounded-full mt-2 mr-2"
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "regular"),
                    }}
                    className="text-sm flex-1"
                  >
                    {language === "en"
                      ? "Scan leaves early in the morning for best results"
                      : "सर्वोत्तम परिणामों के लिए सुबह पत्तियों को स्कैन करें"}
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View
                    style={{ backgroundColor: "#84cc16" }}
                    className="w-2 h-2 rounded-full mt-2 mr-2"
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "regular"),
                    }}
                    className="text-sm flex-1"
                  >
                    {language === "en"
                      ? "Regular monitoring helps prevent disease spread"
                      : "नियमित निगरानी रोग फैलाव को रोकती है"}
                  </Text>
                </View>
              </View>
            )}

            {activeTab === "weather" && (
              <View>
                {weatherLoading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#84cc16" />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        ...getFontStyle(language, "medium"),
                      }}
                      className="text-sm mt-3"
                    >
                      {language === "en"
                        ? "Fetching weather data..."
                        : "मौसम डेटा प्राप्त कर रहे हैं..."}
                    </Text>
                  </View>
                ) : !locationPermission ? (
                  <View className="items-center py-6">
                    <Ionicons
                      name="location-outline"
                      size={40}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{
                        color: colors.text,
                        ...getFontStyle(language, "semibold"),
                      }}
                      className="text-base mt-3 mb-2 text-center"
                    >
                      {language === "en"
                        ? "Location Permission Required"
                        : "स्थान अनुमति आवश्यक है"}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        ...getFontStyle(language, "regular"),
                      }}
                      className="text-sm mb-4 text-center"
                    >
                      {language === "en"
                        ? "Allow location access to get weather data for your area"
                        : "अपने क्षेत्र के लिए मौसम डेटा प्राप्त करने के लिए स्थान अनुमति दें"}
                    </Text>
                    <TouchableOpacity
                      style={{ backgroundColor: "#84cc16" }}
                      className="px-6 py-3 rounded-full"
                      onPress={requestLocationPermission}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {language === "en"
                          ? "Enable Location"
                          : "स्थान सक्षम करें"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : weatherData ? (
                  <View>
                    <View className="flex-row items-center mb-4">
                      <Ionicons
                        name={getWeatherIcon(weatherData.condition)}
                        size={24}
                        color="#84cc16"
                      />
                      <Text
                        style={{
                          color: colors.text,
                          ...getFontStyle(language, "bold"),
                        }}
                        className="text-lg ml-2"
                      >
                        {language === "en" ? "Current Weather" : "वर्तमान मौसम"}
                      </Text>
                    </View>
                    <View className="flex-row items-start justify-between mb-3">
                      <View>
                        <Text
                          style={{
                            color: colors.text,
                            ...getFontStyle(language, "bold"),
                          }}
                          className="text-4xl"
                        >
                          {weatherData.temp}°C
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                          }}
                          className="text-sm mt-1"
                        >
                          {language === "en"
                            ? `Feels like ${weatherData.feelsLike}°C`
                            : `${weatherData.feelsLike}°C जैसा महसूस होता है`}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text
                          style={{
                            color: colors.text,
                            ...getFontStyle(language, "semibold"),
                          }}
                          className="text-base capitalize"
                        >
                          {weatherData.condition}
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                          }}
                          className="text-xs mt-1 capitalize"
                        >
                          {weatherData.description}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={16} color="#84cc16" />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          ...getFontStyle(language, "regular"),
                        }}
                        className="text-sm ml-1"
                      >
                        {weatherData.location}
                      </Text>
                    </View>
                    <View
                      className="flex-row gap-6 mt-3 pt-3 border-t"
                      style={{ borderTopColor: colors.border }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="water" size={20} color="#84cc16" />
                        <View className="ml-2">
                          <Text
                            style={{
                              color: colors.textSecondary,
                              ...getFontStyle(language, "regular"),
                            }}
                            className="text-xs"
                          >
                            {language === "en" ? "Humidity" : "नमी"}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              ...getFontStyle(language, "semibold"),
                            }}
                            className="text-sm"
                          >
                            {weatherData.humidity}%
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="speedometer"
                          size={20}
                          color="#84cc16"
                        />
                        <View className="ml-2">
                          <Text
                            style={{
                              color: colors.textSecondary,
                              ...getFontStyle(language, "regular"),
                            }}
                            className="text-xs"
                          >
                            {language === "en" ? "Wind" : "हवा"}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              ...getFontStyle(language, "semibold"),
                            }}
                            className="text-sm"
                          >
                            {weatherData.windSpeed} km/h
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="mt-4 items-center"
                      onPress={fetchWeatherData}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="refresh" size={16} color="#84cc16" />
                        <Text
                          style={{
                            color: "#84cc16",
                            ...getFontStyle(language, "semibold"),
                          }}
                          className="text-xs ml-1"
                        >
                          {language === "en" ? "Refresh" : "ताज़ा करें"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center py-6">
                    <Ionicons
                      name="cloud-offline-outline"
                      size={40}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        ...getFontStyle(language, "medium"),
                      }}
                      className="text-sm mt-3 text-center"
                    >
                      {language === "en"
                        ? "Unable to fetch weather data\nPlease try again"
                        : "मौसम डेटा प्राप्त करने में असमर्थ\nकृपया पुन: प्रयास करें"}
                    </Text>
                    <TouchableOpacity
                      style={{ backgroundColor: "#84cc16" }}
                      className="px-6 py-2 rounded-full mt-3"
                      onPress={fetchWeatherData}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          ...getFontStyle(language, "semibold"),
                        }}
                        className="text-sm"
                      >
                        {language === "en" ? "Retry" : "पुन: प्रयास करें"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeTab === "popular" && (
              <View>
                <View className="flex-row items-center mb-4">
                  <Ionicons name="trending-up" size={24} color="#84cc16" />
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "bold"),
                    }}
                    className="text-lg ml-2"
                  >
                    {language === "en" ? "Popular Diseases" : "लोकप्रिय रोग"}
                  </Text>
                </View>
                <View>
                  <TouchableOpacity
                    className="mb-3 pb-3 border-b"
                    style={{ borderBottomColor: colors.border }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          style={{
                            color: colors.text,
                            ...getFontStyle(language, "semibold"),
                          }}
                          className="text-base mb-1"
                        >
                          {language === "en"
                            ? "Tomato Late Blight"
                            : "टमाटर का अगेती अंगमारी"}
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                          }}
                          className="text-xs"
                        >
                          {language === "en"
                            ? "Most searched this month"
                            : "इस महीने सबसे अधिक खोजा गया"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="mb-3 pb-3 border-b"
                    style={{ borderBottomColor: colors.border }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          style={{
                            color: colors.text,
                            ...getFontStyle(language, "semibold"),
                          }}
                          className="text-base mb-1"
                        >
                          {language === "en"
                            ? "Corn Common Rust"
                            : "मक्का सामान्य रस्ट"}
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            ...getFontStyle(language, "regular"),
                          }}
                          className="text-xs"
                        >
                          {language === "en"
                            ? "Trending in your area"
                            : "आपके क्षेत्र में ट्रेंडिंग"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === "recent" && (
              <View>
                <View className="flex-row items-center mb-4">
                  <Ionicons name="time" size={24} color="#84cc16" />
                  <Text
                    style={{
                      color: colors.text,
                      ...getFontStyle(language, "bold"),
                    }}
                    className="text-lg ml-2"
                  >
                    {language === "en" ? "Recent Activity" : "हाल की गतिविधि"}
                  </Text>
                </View>
                <View className="items-center py-6">
                  <Ionicons
                    name="leaf-outline"
                    size={40}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      ...getFontStyle(language, "medium"),
                    }}
                    className="text-sm mt-3 text-center"
                  >
                    {language === "en"
                      ? "No recent activity yet\nStart scanning to see your history"
                      : "अभी तक कोई हालिया गतिविधि नहीं\nअपना इतिहास देखने के लिए स्कैनिंग शुरू करें"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl p-6 mx-6 w-80"
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-2xl"
              >
                {t("language")}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: language === "en" ? "#a3e635" : colors.surface,
              }}
              className="py-4 px-6 rounded-2xl mb-3"
              onPress={() => {
                setLanguage("en");
                setShowLanguageModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: language === "en" ? "#fff" : colors.text,
                  ...getFontStyle("en", "semibold"),
                }}
                className="text-center text-lg"
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: language === "hi" ? "#a3e635" : colors.surface,
              }}
              className="py-4 px-6 rounded-2xl"
              onPress={() => {
                setLanguage("hi");
                setShowLanguageModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: language === "hi" ? "#fff" : colors.text,
                  ...getFontStyle("hi", "semibold"),
                }}
                className="text-center text-lg"
              >
                हिन्दी (Hindi)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center backdrop-blur-sm">
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-3xl p-6 mx-6 w-80 max-h-[80%]"
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text
                style={{
                  color: colors.text,
                  ...getFontStyle(language, "bold"),
                }}
                className="text-2xl"
              >
                {t("menu") || "Menu"}
              </Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center py-5 border-b"
                onPress={() => {
                  setShowMenuModal(false);
                  router.push("/bookmarks");
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={28}
                  color={colors.text}
                />
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "medium"),
                  }}
                  className="text-lg ml-4"
                >
                  {language === "en" ? "Bookmarks" : "बुकमार्क"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center py-5 border-b"
                onPress={() => {
                  setShowMenuModal(false);
                  Toast.show({
                    type: "info",
                    text1: t("howToUse") || "How to Use",
                    text2: "Tutorial coming soon",
                    position: "bottom",
                    visibilityTime: 2000,
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={28}
                  color={colors.text}
                />
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "medium"),
                  }}
                  className="text-lg ml-4"
                >
                  {t("howToUse") || "How to Use"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center py-5 border-b"
                onPress={() => {
                  setShowMenuModal(false);
                  Toast.show({
                    type: "info",
                    text1: t("diseaseLibrary") || "Disease Library",
                    text2: "Library coming soon",
                    position: "bottom",
                    visibilityTime: 2000,
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="library-outline"
                  size={28}
                  color={colors.text}
                />
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "medium"),
                  }}
                  className="text-lg ml-4"
                >
                  {t("diseaseLibrary") || "Disease Library"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-5"
                onPress={() => {
                  setShowMenuModal(false);
                  setShowLanguageModal(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="language-outline"
                  size={28}
                  color={colors.text}
                />
                <Text
                  style={{
                    color: colors.text,
                    ...getFontStyle(language, "medium"),
                  }}
                  className="text-lg ml-4"
                >
                  {t("language") || "Language"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
