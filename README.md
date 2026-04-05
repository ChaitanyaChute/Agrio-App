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
EXPO_PUBLIC_DATA_API_BASE=http://127.0.0.1:5000
EXPO_PUBLIC_ML_API_BASE=http://127.0.0.1:8000
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

Start from `.env.example` so all required variables are present.
The repository is configured to ignore `.env` and `.env.*` (while keeping `.env.example` tracked).

For local model/backend integration:

- `EXPO_PUBLIC_DATA_API_BASE` is used for crop/disease data endpoints on Node.js (`/api/...`)
- `EXPO_PUBLIC_ML_API_BASE` is used for image upload to FastAPI (`POST /predict`)
- `EXPO_PUBLIC_OPENWEATHER_API_KEY` is used for current weather data (OpenWeatherMap)

For Android emulator, use:

```env
EXPO_PUBLIC_DATA_API_BASE=http://10.0.2.2:5000
EXPO_PUBLIC_ML_API_BASE=http://10.0.2.2:8000
```

For release APK on a real device, do not use localhost or 10.0.2.2. Use a reachable LAN/public backend URL:

```env
EXPO_PUBLIC_DATA_API_BASE=https://your-data-backend.example.com
EXPO_PUBLIC_ML_API_BASE=https://your-ml-backend.example.com
```

### EAS Build Environment (Required for APK)

Because `.env` is gitignored, EAS cloud builds will not automatically include your local values.

Set these variables before building:

```bash
eas env:create --name EXPO_PUBLIC_DATA_API_BASE --value "https://your-data-backend.example.com" --environment preview
eas env:create --name EXPO_PUBLIC_ML_API_BASE --value "https://your-ml-backend.example.com" --environment preview
eas env:create --name EXPO_PUBLIC_OPENWEATHER_API_KEY --value "your_api_key_here" --environment preview

eas env:create --name EXPO_PUBLIC_DATA_API_BASE --value "https://your-data-backend.example.com" --environment production
eas env:create --name EXPO_PUBLIC_ML_API_BASE --value "https://your-ml-backend.example.com" --environment production
eas env:create --name EXPO_PUBLIC_OPENWEATHER_API_KEY --value "your_api_key_here" --environment production
```

Then rebuild:

```bash
npx eas build --platform android --profile preview
```

### GitHub Push Readiness Checklist

1. Keep real values only in `.env` (never in source files).
2. Keep placeholders only in `.env.example`.
3. Verify env files are not tracked:

```bash
git ls-files | grep -E "^\\.env($|\\.)"
```

Expected result: only `.env.example`.

4. If any real env file is tracked, untrack it before pushing:

```bash
git rm --cached --ignore-unmatch .env .env.development .env.production .env.staging
```

5. Run sanity checks before push:

```bash
npm run lint
npx tsc --noEmit
```

### APK Troubleshooting

- If release app shows setup/configuration error, backend URL variables are missing or pointing to localhost.
- If weather fails in release, verify `EXPO_PUBLIC_OPENWEATHER_API_KEY` is set in EAS env for the selected profile.
- Verify backend is reachable from phone browser (same network if using LAN IP).
- Confirm `POST /predict` works on your ML backend and data endpoints are available on your data backend.

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
