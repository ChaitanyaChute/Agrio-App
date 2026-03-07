# Crop Disease Detection

A smart mobile application for identifying crop diseases using AI/ML. Farmers can capture or upload leaf images to get instant disease identification, treatment recommendations, and preventive measures.

## Features

- **Disease Identification**: Capture or upload leaf images for instant disease detection
- **Crop Management**: Browse and manage multiple crop types (Corn, Tomato, Potato, Grape)
- **Disease Library**: Comprehensive disease information with symptoms and treatments
- **Weather Integration**: Real-time weather data to support disease prediction
- **Bookmarks**: Save favorite diseases for quick reference
- **Theme Support**: Light and dark mode for better user experience
- **Multi-Language**: English and Hindi language support
- **Customizable Settings**: Adjust app appearance and notifications
- **Cross-Platform**: Native Android support with iOS ready

## Tech Stack

| Layer                | Technology             |
| -------------------- | ---------------------- |
| **Framework**        | React Native with Expo |
| **Language**         | TypeScript             |
| **Styling**          | NativeWind             |
| **State Management** | React Context API      |
| **Storage**          | AsyncStorage           |
| **HTTP Client**      | Axios                  |

## Project Structure

```
crop-disease-detection/
├── app/                                 # Application source code
│   ├── _layout.tsx                     # Root layout with navigation
│   ├── index.tsx                       # Home screen with weather
│   ├── crops.tsx                       # Crop listing screen
│   ├── crop-details.tsx                # Crop details screen
│   ├── disease.tsx                     # Disease listing screen
│   ├── disease-detail.tsx              # Disease details screen
│   ├── identifier.tsx                  # Disease identifier (camera/gallery)
│   ├── bookmarks.tsx                   # Bookmarked diseases
│   ├── settings.tsx                    # App settings
│   │
│   ├── config/
│   │   └── api.config.ts               # API configuration
│   │
│   ├── context/
│   │   └── ThemeContext.tsx            # Theme provider (light/dark)
│   │
│   ├── locales/
│   │   ├── LanguageContext.tsx         # Language provider
│   │   └── translations.ts             # EN/HI translations
│   │
│   ├── services/
│   │   └── api.service.ts              # API communication
│   │
│   └── utils/
│       ├── fonts.ts                    # Font style helpers
│       └── toastConfig.tsx             # Toast notifications
│
├── assets/                              # Images and media
│   └── images/
│       ├── bg/                         # Background images
│       │   ├── bg_corn.png
│       │   ├── bg_potato.png
│       │   ├── bg_tomato.png
│       │   └── bg_grape.png
│       └── crops/                      # Crop icons
│
├── android/                             # Android native configuration
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/
│   │   │   │   └── com/anonymous/cropdiseasedetection/
│   │   │   │       ├── MainActivity.kt
│   │   │   │       └── MainApplication.kt
│   │   │   └── res/                    # Android resources
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── build.gradle
│   ├── gradle.properties
│   ├── settings.gradle
│   └── gradlew                          # Gradle wrapper
│
├── package.json                         # Project dependencies
├── tsconfig.json                        # TypeScript configuration
├── babel.config.js                      # Babel configuration
├── metro.config.js                      # Metro bundler config
├── eslint.config.js                     # ESLint configuration
├── tailwind.config.js                   # Tailwind CSS config
├── app.json                             # Expo configuration
├── eas.json                             # EAS Build configuration
├── global.css                           # Global styles
├── .gitignore                           # Git ignore rules
├── .env.example                         # Environment variables template
└── README.md                            # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/crop-disease-detection.git
   cd crop-disease-detection
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Running the App

- **On Android Emulator**: Press `a` in the terminal
- **On Physical Android Device**: Scan the QR code with Expo Go app
- **Development Build**: `npx expo run:android`

## 📋 Available Scripts

```bash
# Start development server
npm start
# or
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Build for Android
eas build --platform android

# Preview build
eas build --platform android --profile preview

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=https://api.example.com
OPENWEATHER_API_KEY=your_api_key_here
```

### Supported Languages

- English (en)
- Hindi (hi)

### Theme Support

- Light mode (default)
- Dark mode

## Screens Overview

| Screen             | Description                                               |
| ------------------ | --------------------------------------------------------- |
| **Home**           | Welcome screen with crop selection and weather widget     |
| **Crops**          | Browse all available crops                                |
| **Crop Details**   | View crop information and associated diseases             |
| **Identifier**     | Capture or upload leaf images for disease detection       |
| **Disease**        | Browse disease database                                   |
| **Disease Detail** | View full disease information, treatments, and prevention |
| **Bookmarks**      | View saved/bookmarked diseases                            |
| **Settings**       | Manage theme, language, and app preferences               |

## API Integration

The app communicates with backend APIs for:

- Crop and disease data
- Disease identification (ML model integration pending)
- Weather information (OpenWeatherMap)

### API Endpoints

```
GET  /api/crops                 # Get all crops
GET  /api/crops/:id            # Get crop details
GET  /api/diseases             # Get all diseases
GET  /api/diseases/:id         # Get disease details
POST /api/identify             # Identify disease from image
```
