import {
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    useFonts as useOpenSansFonts,
} from "@expo-google-fonts/open-sans";
import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts as usePoppinsFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, LogBox, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./locales/LanguageContext";
import { toastConfig } from "./utils/toastConfig";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "Unable to activate keep awake",
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  const [openSansLoaded] = useOpenSansFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  const [poppinsLoaded] = usePoppinsFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const fontsLoaded = openSansLoaded && poppinsLoaded;

  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particle4Y = useRef(new Animated.Value(0)).current;
  const particle5Y = useRef(new Animated.Value(0)).current;
  const particle6Y = useRef(new Animated.Value(0)).current;

  const particleOpacity = useRef(new Animated.Value(0)).current;

  const ringScale1 = useRef(new Animated.Value(0.8)).current;
  const ringScale2 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        if (!fontsLoaded) return;

        await SplashScreen.hideAsync();

        await new Promise((resolve) => setTimeout(resolve, 50));

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmer, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(shimmer, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ).start();

        Animated.parallel([
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(ringScale1, {
            toValue: 1,
            tension: 35,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(ringScale2, {
            toValue: 1.15,
            tension: 30,
            friction: 8,
            delay: 150,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            delay: 300,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 45,
            friction: 7,
            delay: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          Animated.loop(
            Animated.parallel([
              Animated.sequence([
                Animated.timing(particle1Y, {
                  toValue: -100,
                  duration: 3000,
                  useNativeDriver: true,
                }),
                Animated.timing(particle1Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle2Y, {
                  toValue: -120,
                  duration: 3500,
                  useNativeDriver: true,
                }),
                Animated.timing(particle2Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle3Y, {
                  toValue: -90,
                  duration: 2800,
                  useNativeDriver: true,
                }),
                Animated.timing(particle3Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle4Y, {
                  toValue: -110,
                  duration: 3200,
                  useNativeDriver: true,
                }),
                Animated.timing(particle4Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle5Y, {
                  toValue: -95,
                  duration: 2900,
                  useNativeDriver: true,
                }),
                Animated.timing(particle5Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle6Y, {
                  toValue: -105,
                  duration: 3100,
                  useNativeDriver: true,
                }),
                Animated.timing(particle6Y, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ).start();

          Animated.loop(
            Animated.sequence([
              Animated.timing(particleOpacity, {
                toValue: 0.6,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(particleOpacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
          ).start();
        }, 500);

        Animated.parallel([
          Animated.timing(textFade, {
            toValue: 1,
            duration: 800,
            delay: 800,
            useNativeDriver: true,
          }),
          Animated.spring(textSlide, {
            toValue: 0,
            tension: 40,
            friction: 8,
            delay: 800,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 800,
          delay: 1200,
          useNativeDriver: true,
        }).start();

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(textFade, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleFade, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => resolve(undefined));
        });

        setAppReady(true);
      } catch (e) {
        console.warn(e);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const particle1Opacity = particle1Y.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [0, 0.6, 0],
  });

  const particle2Opacity = particle2Y.interpolate({
    inputRange: [-120, -60, 0],
    outputRange: [0, 0.5, 0],
  });

  const particle3Opacity = particle3Y.interpolate({
    inputRange: [-90, -45, 0],
    outputRange: [0, 0.7, 0],
  });

  const particle4Opacity = particle4Y.interpolate({
    inputRange: [-110, -55, 0],
    outputRange: [0, 0.6, 0],
  });

  const particle5Opacity = particle5Y.interpolate({
    inputRange: [-95, -48, 0],
    outputRange: [0, 0.5, 0],
  });

  const particle6Opacity = particle6Y.interpolate({
    inputRange: [-105, -52, 0],
    outputRange: [0, 0.6, 0],
  });

  if (!appReady) {
    return (
      <View className="flex-1 bg-white items-center justify-center overflow-hidden">
        {/* Gradient background overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fafafa",
          }}
        />

        {/* Animated gradient circles */}
        <Animated.View
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: 300,
            backgroundColor: "#f0fdf4",
            opacity: ringOpacity,
            transform: [{ scale: ringScale2 }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            width: 450,
            height: 450,
            borderRadius: 225,
            backgroundColor: "#dcfce7",
            opacity: ringOpacity,
            transform: [{ scale: ringScale1 }],
          }}
        />

        {/* Shimmer light effect */}
        <Animated.View
          style={{
            position: "absolute",
            width: 150,
            height: 800,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            transform: [{ translateX: shimmerTranslate }, { rotate: "25deg" }],
          }}
        />

        {/* Floating particles */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: "50%",
            left: "20%",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#84cc16",
            opacity: particle1Opacity,
            transform: [{ translateY: particle1Y }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: "45%",
            left: "75%",
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#65a30d",
            opacity: particle2Opacity,
            transform: [{ translateY: particle2Y }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: "52%",
            left: "35%",
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#a3e635",
            opacity: particle3Opacity,
            transform: [{ translateY: particle3Y }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: "48%",
            left: "65%",
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: "#84cc16",
            opacity: particle4Opacity,
            transform: [{ translateY: particle4Y }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: "55%",
            left: "50%",
            width: 9,
            height: 9,
            borderRadius: 4.5,
            backgroundColor: "#4d7c0f",
            opacity: particle5Opacity,
            transform: [{ translateY: particle5Y }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: "46%",
            left: "85%",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#65a30d",
            opacity: particle6Opacity,
            transform: [{ translateY: particle6Y }],
          }}
        />

        {/* Logo with professional shadow */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: logoScale }],
            shadowColor: "#84cc16",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 25,
            elevation: 15,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/agrio-logo-bg.png")}
            style={{ width: 260, height: 260 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: subtitleFade,
            marginTop: -90,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
            }}
          >
            <View
              style={{ width: 30, height: 1.5, backgroundColor: "#84cc16" }}
            />
            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              Smart Disease Prediction
            </Text>
            <View
              style={{ width: 30, height: 1.5, backgroundColor: "#84cc16" }}
            />
          </View>
        </Animated.View>

        {/* Version indicator */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 50,
            opacity: subtitleFade,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: "#9ca3af",
              letterSpacing: 1,
            }}
          ></Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="identifier" />
            <Stack.Screen name="crops" />
            <Stack.Screen name="crop-details" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="disease" />
          </Stack>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
