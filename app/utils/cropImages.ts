const cropImageMap: Record<string, any> = {
  apple: require("../../assets/images/crops/Apple.jpg"),
  banana: require("../../assets/images/crops/Banana.jpg"),
  bean: require("../../assets/images/crops/bean.jpg"),
  grapes: require("../../assets/images/crops/Grapes.jpg"),
  pepper: require("../../assets/images/crops/pepper.png"),
  rice: require("../../assets/images/crops/Rice.jpg"),
  tomato: require("../../assets/images/crops/tomato.png"),
  potato: require("../../assets/images/crops/potato.png"),
  corn: require("../../assets/images/crops/corn.png"),
  chilli: require("../../assets/images/crops/chilli.png"),
  soyabean: require("../../assets/images/crops/soyabean.png"),
  cotton: require("../../assets/images/crops/cotton.png"),
  wheat: require("../../assets/images/crops/Wheat.jpg"),
};

const cropBannerMap: Record<string, any> = {
  apple: require("../../assets/images/bg/bg_apple.png"),
  tomato: require("../../assets/images/bg/bg_tomato.png"),
  potato: require("../../assets/images/bg/bg_potato.png"),
  corn: require("../../assets/images/bg/bg_corn.png"),
  chilli: require("../../assets/images/bg/bg_chilli.png"),
  cotton: require("../../assets/images/bg/bg_cotton.png"),
  soyabean: require("../../assets/images/bg/bg_soyabean.png"),
};

const CROP_IMAGE_FALLBACK = require("../../assets/images/crops/tomato.png");
const HOMEPAGE_BANNER_FALLBACK = require("../../assets/images/Homepage-Banner.png");

function normalizeCropKey(cropName: string) {
  return cropName
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z_]/g, "");
}

function resolveCropKey(cropName: string) {
  const key = normalizeCropKey(cropName);

  const exactAliases: Record<string, string> = {
    chili: "chilli",
    chilli_pepper: "pepper",
    bell_pepper: "pepper",
    pepper_bell: "pepper",
    bananas: "banana",
    beans: "bean",
    grape: "grapes",
    soybean: "soyabean",
    corn_maize: "corn",
    maize: "corn",
  };

  if (exactAliases[key]) return exactAliases[key];
  if (cropImageMap[key]) return key;

  const keywordAliases: Array<[string, string]> = [
    ["apple", "apple"],
    ["banana", "banana"],
    ["bean", "bean"],
    ["grape", "grapes"],
    ["pepper", "pepper"],
    ["chili", "chilli"],
    ["chilli", "chilli"],
    ["rice", "rice"],
    ["tomato", "tomato"],
    ["potato", "potato"],
    ["corn", "corn"],
    ["maize", "corn"],
    ["soybean", "soyabean"],
    ["soyabean", "soyabean"],
    ["cotton", "cotton"],
    ["wheat", "wheat"],
  ];

  for (const [needle, mappedKey] of keywordAliases) {
    if (key.includes(needle)) return mappedKey;
  }

  return key;
}

export function getCropImage(cropName: string) {
  const key = resolveCropKey(cropName);
  return cropImageMap[key] ?? CROP_IMAGE_FALLBACK;
}

export function getCropBanner(cropName: string) {
  const key = resolveCropKey(cropName);
  return cropBannerMap[key] ?? HOMEPAGE_BANNER_FALLBACK;
}
