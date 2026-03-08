import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./locales/LanguageContext";
import { getFontStyle } from "./utils/fonts";

export default function CropDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { cropName } = useLocalSearchParams();

  const cropData: any = {
    Tomato: {
      banner: require("../assets/images/bg/bg_tomato.png"),
      diseases: [
        {
          id: 1,
          name: "Early Blight",
          nameLang: "अर्ली ब्लाइट",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Early blight, as the name implies, appears before the onset of late blight but does not spread throughout the foliage in UK potato crops as it does in warmer climates.",
          descriptionLang:
            "अर्ली ब्लाइट, जैसा कि नाम से पता चलता है, लेट ब्लाइट की शुरुआत से पहले दिखाई देता है लेकिन यूके में आलू की फसलों में पत्तियों में नहीं फैलता है जैसा कि यह गर्म जलवायु में होता है।",
        },
        {
          id: 2,
          name: "Late Blight",
          nameLang: "लेट ब्लाइट",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Late blight is a devastating disease that affects tomato plants, causing dark spots on leaves and stems.",
          descriptionLang:
            "लेट ब्लाइट एक विनाशकारी बीमारी है जो टमाटर के पौधों को प्रभावित करती है।",
        },
        {
          id: 3,
          name: "Leaf Mold",
          nameLang: "पत्ती फफूंदी",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Leaf mold is a fungal disease that primarily affects the leaves of tomato plants.",
          descriptionLang:
            "पत्ती फफूंदी एक कवक रोग है जो मुख्य रूप से टमाटर के पौधों की पत्तियों को प्रभावित करता है।",
        },
        {
          id: 4,
          name: "Septoria Leaf Spot",
          nameLang: "सेप्टोरिया पत्ती धब्बा",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Septoria leaf spot causes small circular spots with gray centers on tomato leaves.",
          descriptionLang:
            "सेप्टोरिया पत्ती धब्बा टमाटर की पत्तियों पर धूसर केंद्रों के साथ छोटे गोलाकार धब्बे पैदा करता है।",
        },
        {
          id: 5,
          name: "Spider Mites",
          nameLang: "मकड़ी के कण",
          class: "Pest",
          classLang: "कीट",
          description:
            "Spider mites are tiny pests that suck sap from tomato plants, causing yellowing leaves.",
          descriptionLang:
            "मकड़ी के कण छोटे कीट हैं जो टमाटर के पौधों से रस चूसते हैं।",
        },
        {
          id: 6,
          name: "Target Spot",
          nameLang: "लक्ष्य धब्बा",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Target spot appears as circular lesions with concentric rings on leaves.",
          descriptionLang:
            "लक्ष्य धब्बा पत्तियों पर संकेंद्रित छल्लों के साथ गोलाकार घावों के रूप में दिखाई देता है।",
        },
        {
          id: 7,
          name: "Yellow Leaf Curl Virus",
          nameLang: "पीली पत्ती कर्ल वायरस",
          class: "Virus",
          classLang: "वायरस",
          description:
            "Yellow leaf curl virus causes upward curling and yellowing of tomato leaves.",
          descriptionLang:
            "पीली पत्ती कर्ल वायरस टमाटर की पत्तियों को ऊपर की ओर मोड़ने और पीला करने का कारण बनता है।",
        },
        {
          id: 8,
          name: "Mosaic Virus",
          nameLang: "मोज़ेक वायरस",
          class: "Virus",
          classLang: "वायरस",
          description:
            "Mosaic virus creates a mottled pattern of light and dark green on leaves.",
          descriptionLang:
            "मोज़ेक वायरस पत्तियों पर हल्के और गहरे हरे रंग का एक धब्बेदार पैटर्न बनाता है।",
        },
        {
          id: 9,
          name: "Bacterial Spot",
          nameLang: "बैक्टीरियल धब्बा",
          class: "Bacteria",
          classLang: "जीवाणु",
          description:
            "Bacterial spot causes small dark spots on leaves, stems, and fruits of tomato plants.",
          descriptionLang:
            "बैक्टीरियल धब्बा टमाटर के पौधों की पत्तियों, तनों और फलों पर छोटे काले धब्बे पैदा करता है।",
        },
        {
          id: 10,
          name: "Healthy",
          nameLang: "स्वस्थ",
          class: "Healthy",
          classLang: "स्वस्थ",
          description:
            "The plant shows no signs of disease and is growing normally.",
          descriptionLang:
            "पौधा रोग के कोई लक्षण नहीं दिखाता है और सामान्य रूप से बढ़ रहा है।",
        },
      ],
    },
    Potato: {
      banner: require("../assets/images/bg/bg_potato.png"),
      diseases: [
        { id: 1, name: "Early Blight", nameLang: "अर्ली ब्लाइट" },
        { id: 2, name: "Late Blight", nameLang: "लेट ब्लाइट" },
        { id: 3, name: "Healthy", nameLang: "स्वस्थ" },
      ],
    },
    Corn: {
      banner: require("../assets/images/bg/bg_corn.png"),
      diseases: [
        {
          id: 1,
          name: "Common Rust",
          nameLang: "सामान्य जंग",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Common rust is a fungal disease that produces small, circular to elongate brown pustules on both leaf surfaces. The disease can reduce photosynthesis and lead to premature leaf death if severe.",
          descriptionLang:
            "सामान्य जंग एक कवक रोग है जो पत्ती की दोनों सतहों पर छोटे, गोलाकार से लम्बे भूरे रंग के फफोले पैदा करता है। यदि गंभीर हो तो यह रोग प्रकाश संश्लेषण को कम कर सकता है और पत्तियों की समय से पहले मृत्यु का कारण बन सकता है।",
        },
        {
          id: 2,
          name: "Gray Leaf Spot",
          nameLang: "ग्रे पत्ती धब्बा",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Gray leaf spot causes rectangular lesions on corn leaves that are gray to tan in color with distinct parallel edges. Severe infections can result in significant yield loss.",
          descriptionLang:
            "ग्रे पत्ती धब्बा मकई की पत्तियों पर आयताकार घाव पैदा करता है जो भूरे से तन रंग के होते हैं और जिनके किनारे समानांतर होते हैं। गंभीर संक्रमण से उपज में काफी नुकसान हो सकता है।",
        },
        {
          id: 3,
          name: "Northern Leaf Blight",
          nameLang: "उत्तरी पत्ती धुंधलापन",
          class: "Fungi",
          classLang: "कवक",
          description:
            "Northern leaf blight produces large, elliptical, gray-green lesions on corn leaves. The disease thrives in moderate temperatures and high humidity, and can cause significant yield reduction.",
          descriptionLang:
            "उत्तरी पत्ती धुंधलापन मकई की पत्तियों पर बड़े, अंडाकार, भूरे-हरे रंग के घाव पैदा करता है। यह रोग मध्यम तापमान और उच्च आर्द्रता में पनपता है और उपज में काफी कमी का कारण बन सकता है।",
        },
        {
          id: 4,
          name: "Healthy",
          nameLang: "स्वस्थ",
          class: "Healthy",
          classLang: "स्वस्थ",
          description:
            "The plant shows no signs of disease and is growing normally with good vigor and color.",
          descriptionLang:
            "पौधा रोग के कोई लक्षण नहीं दिखाता है और अच्छी शक्ति और रंग के साथ सामान्य रूप से बढ़ रहा है।",
        },
      ],
    },
    Chilli: {
      banner: require("../assets/images/bg/bg_chilli.png"),
      diseases: [
        { id: 1, name: "Leaf Curl", nameLang: "पत्ती कर्ल" },
        { id: 2, name: "Leaf Spot", nameLang: "पत्ती धब्बा" },
        { id: 3, name: "Whitefly", nameLang: "सफेद मक्खी" },
        { id: 4, name: "Healthy", nameLang: "स्वस्थ" },
      ],
    },
    Soyabean: {
      banner: require("../assets/images/bg/bg_soyabean.png"),
      diseases: [
        { id: 1, name: "Bacterial Blight", nameLang: "बैक्टीरियल ब्लाइट" },
        { id: 2, name: "Caterpillar", nameLang: "कैटरपिलर" },
        { id: 3, name: "Diabrotica Speciosa", nameLang: "डायब्रोटिका" },
        { id: 4, name: "Downy Mildew", nameLang: "डाउनी मिल्ड्यू" },
        { id: 5, name: "Healthy", nameLang: "स्वस्थ" },
      ],
    },
    Cotton: {
      banner: require("../assets/images/bg/bg_cotton.png"),
      diseases: [
        {
          id: 1,
          name: "Diseased Cotton Leaf",
          nameLang: "रोगग्रस्त कपास पत्ती",
        },
        { id: 2, name: "Healthy", nameLang: "स्वस्थ" },
      ],
    },
  };

  const crop = cropData[cropName as string] || cropData["Tomato"];
  const diseases = crop.diseases;

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
              source={crop.banner}
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

          {diseases.map((disease: any) => (
            <TouchableOpacity
              key={disease.id}
              style={{ backgroundColor: colors.card }}
              className="flex-row items-center justify-between p-4 rounded-2xl mb-3 shadow-lg"
              onPress={() => {
                router.push({
                  pathname: "/disease-detail",
                  params: {
                    diseaseName: disease.name,
                    diseaseNameLang: disease.nameLang,
                    diseaseClass: disease.class || "Unknown",
                    diseaseClassLang: disease.classLang || "अज्ञात",
                    description:
                      disease.description || "Description not available.",
                    descriptionLang:
                      disease.descriptionLang || "विवरण उपलब्ध नहीं है।",
                    cropName: cropName as string,
                  },
                });
              }}
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
                  {language === "en" ? disease.name : disease.nameLang}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    ...getFontStyle(language, "regular"),
                  }}
                  className="text-sm"
                >
                  {language === "en"
                    ? disease.class || "Disease"
                    : disease.classLang || "रोग"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
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
