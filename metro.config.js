const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.watchFolders = [];
config.resolver.blockList = [
  /android\/app\/.cxx\/.*/,
  /android\/app\/build\/.*/,
  /android\/\.gradle\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
