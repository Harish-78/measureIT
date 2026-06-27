# MeasureIt 📐🌾

**MeasureIt** is a universal land area conversion and summation utility built using React Native and Expo. It provides real-time conversions and calculations for common land area measurements, complete with a modern, responsive layout that seamlessly adapts to different screen sizes and device themes.

---

## 🌟 Key Features

* **Land Area Converter (Home)**
  * Convert land values instantly across multiple units: **Acre, Cent, Hectare, and Square Feet**.
  * Dynamic, bi-directional updates as you type.
  * Easy-to-use clipboard integration to quickly copy converted values.

* **Plot Summation & Calculator (Explore)**
  * Add multiple land parcels or divisions of varying units (e.g., Plot 1 in Acres, Plot 2 in Cents).
  * Automatically calculates and displays live grand totals in all supported formats (Acres, Cents, Hectares, Sq. Ft.).
  * **Export Report Generator**: Generate, copy, or share a clean, formatted text summation report detailing individual parcels and the grand totals.

* **Sleek, Responsive UI**
  * Built using React Native components with clean layout rules and styling.
  * Custom layout optimization with safe area insets for notched and bezelless devices.
  * Built-in dynamic theme toggler (Light mode, Dark mode, and System settings sync) with a matching dynamic status bar.
  * Adaptive design that runs beautifully on iOS, Android, and Web.

---

## 🚀 Getting Started

### 1. Install Dependencies
Make sure you have Node.js and NPM installed, then run:
```bash
npm install
```

### 2. Start the Development Server
Launch Metro Bundler to start your app:
```bash
npx expo start
```

Use the interactive CLI command triggers to open the app on your preferred platform:
* Press `i` to run on the **iOS Simulator**.
* Press `a` to run on the **Android Emulator**.
* Press `w` to run in a web browser.

---

## 📦 Native Android Builds (Local APK)

You can build a native Android Debug APK directly on your machine without relying on cloud services.

### Prerequisite Checklist
* OpenJDK installed (Java 17 or higher recommended).
* Android SDK (including `platform-tools` and ADB) installed and configured under the `$ANDROID_HOME` environment variable.

### 1. Generate Native Project Code
Prebuild the Android directory from the Expo config:
```bash
npx expo prebuild --platform android --no-install
```

### 2. Compile Debug APK
Navigate into the generated `android` folder and build the APK using the Gradle Wrapper:
```bash
cd android
./gradlew assembleDebug
```
The compiled, runnable APK will be output at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📂 Project Structure

* **`src/app/`**: Application routing and screen structure.
  * [`_layout.tsx`](file:///Users/achit247/Projects/measureIt/src/app/_layout.tsx): Root layout setup including global ThemeProvider and StatusBar configuration.
  * [`index.tsx`](file:///Users/achit247/Projects/measureIt/src/app/index.tsx): Land Area Converter screen (Home).
  * [`explore.tsx`](file:///Users/achit247/Projects/measureIt/src/app/explore.tsx): Plot Summation screen (Explore).
* **`src/components/`**: Shared reusable UI components (e.g., themed views, texts, overlays).
* **`src/hooks/`**: Context and custom hooks (e.g., `use-theme.ts` for app-wide styling states).
* **`src/constants/`**: App design systems, themes, and land area conversion multipliers.
