# 💠 BoroBeacon
![BoroBeacon Banner](./Frontend/assets/images/bannerWide.jpg)
<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/ThatOneDev78601/BoroBeacon?style=for-the-badge)](https://github.com/ThatOneDev78601/BoroBeacon/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ThatOneDev78601/BoroBeacon?style=for-the-badge)](https://github.com/ThatOneDev78601/BoroBeacon/network)
[![GitHub issues](https://img.shields.io/github/issues/ThatOneDev78601/BoroBeacon?style=for-the-badge)](https://github.com/ThatOneDev78601/BoroBeacon/issues)
[![GitHub license](https://img.shields.io/github/license/ThatOneDev78601/BoroBeacon?style=for-the-badge)](LICENSE) **A real-time dispatch system connecting people in need with nearby community helpers through a geolocating mobile app.**

</div>

## 📲 Live Demo & Download

Experience BoroBeacon instantly in your browser or download the app to your Android device:

* **🌐 Playable Browser Demo:** [**Run on Appetize.io**](https://appetize.io/app/b_rw4ngvxtd2cfen4a3k2lpbdena)
* **⬇️ Download App File:** [**Get the Raw File (Google Drive)**](https://drive.google.com/file/d/19VcUkSdqfhGuJBUF_vwNaSybwuknw0ph/view?usp=sharing)

## 📖 Overview

BoroBeacon is a compassionate mobile application designed to foster community support by enabling real-time connections between individuals requiring assistance and local volunteers ready to help. Leveraging the power of React Native for a seamless cross-platform experience, Firebase Firestore for a robust and scalable backend, and GeoFire for efficient proximity-based matching, BoroBeacon creates an intuitive and responsive dispatch system. Whether you need a helping hand or are looking to offer one, BoroBeacon brings your community closer in moments of need.

## ✨ Features

-   🎯 **Real-time Help Requests:** Users can instantly post requests for assistance, visible to nearby community helpers.
-   📍 **Proximity-Based Matching:** Utilizes GeoFire to efficiently connect those in need with the closest available helpers based on real-time location data.
-   🤝 **Volunteer Dispatch System:** Helpers can view active requests within a defined radius and accept dispatch roles to provide aid.
-   💬 **Secure Communication:** Facilitates direct and secure communication between requesters and helpers. -   🔐 **User Authentication:** Secure user registration and login for both requesters and helpers. -   📱 **Cross-Platform Mobile App:** Built with React Native for a native feel on both iOS and Android.

## 🖥️ Screenshots

## 🛠️ Tech Stack

**Frontend (Mobile App):**
[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-1B1F2D?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/) **Backend & Database:**
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs/firestore)
[![GeoFire](https://img.shields.io/badge/GeoFire-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://github.com/firebase/geofire-js)

**Tools:**
[![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)

## 🚀 Quick Start

To get BoroBeacon up and running on your local machine, follow these steps:

### Prerequisites

Ensure you have the following installed on your system:

-   **Node.js**: `^18.x` or higher
-   **npm** or **Yarn**:
    ```bash
    npm install -g yarn # If you prefer yarn
    ```
-   **Watchman** (for macOS React Native development):
    ```bash
    brew install watchman
    ```
-   **React Native Development Environment**:
    -   **Android**: Java Development Kit (JDK), Android Studio with Android SDK and emulator setup.
    -   **iOS**: Xcode with Command Line Tools and iOS simulator setup (macOS only).
    -   **Refer to the [React Native Environment Setup Guide](https://reactnative.dev/docs/environment-setup) for detailed instructions.**
-   **Firebase Project**: An active Firebase project with Firestore enabled.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/ThatOneDev78601/BoroBeacon.git](https://github.com/ThatOneDev78601/BoroBeacon.git)
    cd BoroBeacon
    ```

2.  **Firebase Project Setup**
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Create a new project.
    * Enable **Firestore Database** in Native mode.
    * **Authentication**: Set up preferred authentication methods (e.g., Email/Password).
    * **Project Settings**: Add a new web app to your Firebase project to get your configuration details.

3.  **Frontend (Mobile App) Setup**

    * Navigate to the `Frontend` directory:
        ```bash
        cd Frontend
        ```
    * Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    * Configure environment variables:
        Create a `.env` file in the `Frontend` directory based on `.env.example` (if present) or manually add your Firebase configuration:
        ```env
        # Frontend/.env
        EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
        EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
        EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
        EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Optional
        ```
        Replace placeholders with your actual Firebase project configuration.

    * Start the React Native development server:
        ```bash
        npx expo start
        # or
        npm start
        ```
        This will open Metro Bundler in your browser. You can then scan the QR code with the Expo Go app on your phone, or run it on an Android emulator/iOS simulator by pressing `a` or `i` respectively in the terminal.

4.  **Backend (API Service) Setup**

    * Open a new terminal and navigate to the `Backend` directory:
        ```bash
        cd Backend
        ```
    * Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    * Configure environment variables:
        Create a `.env` file in the `Backend` directory based on `.env.example` (if present) or manually add your Firebase configuration. This might include credentials for Admin SDK:
        ```env
        # Backend/.env
        FIREBASE_PRIVATE_KEY_ID=YOUR_FIREBASE_PRIVATE_KEY_ID
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
        FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
        FIREBASE_CLIENT_EMAIL=YOUR_FIREBASE_CLIENT_EMAIL
        # Potentially other backend specific configs like PORT
        PORT=3000
        ```
        For `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL`, you'll need to generate a private key for your Firebase project service account in the Firebase Console (Project settings > Service accounts > Generate new private key).

    * Start the Backend server:
        ```bash
        npm start
        # or
        yarn start
        ```
        The backend service will likely run on `http://localhost:3000` (or the port defined in your `.env`).


## 📁 Project Structure

```
BoroBeacon/
├── Backend/                           # Firebase backend root
│   ├── functions/                   # Firebase Cloud Functions (Node.js)
│   ├── database-debug.log
│   ├── firebase-debug.log
│   ├── firebase.json                # Firebase project configuration
│   ├── firestore-debug.log
│   ├── package-lock.json
│   └── package.json                 # Backend dependencies
│
├── Frontend/                          # React Native (Expo) mobile application
│   ├── app/                         # Expo Router file-based routing
│   │   ├── (auth)/                  # Route group for authentication screens
│   │   ├── (tabs)/                  # Route group for main app tab navigation
│   │   └── _layout.tsx              # Main layout for the app directory
│   ├── assets/
│   ├── components/                  # Reusable UI components
│   ├── constants/
│   ├── hooks/                       # Custom React hooks
│   ├── scripts/
│   ├── app.json                     # Expo app configuration file
│   ├── babel.config.js
│   ├── eslint.config.js
│   ├── expo-env.d.ts
│   ├── firebaseConfig.js            # Firebase client configuration
│   ├── global.css                   # Global styles (likely for NativeWind)
│   ├── main
│   ├── metro.config.js
│   ├── nativewind-env.d.ts
│   ├── package-lock.json
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS (NativeWind) config
│   └── tsconfig.json                # TypeScript configuration
│
└── README.md                          # This README file
```


## 🔧 Development

### Available Scripts

Each sub-project (`Frontend` and `Backend`) has its own set of development scripts defined in their `package.json` files.

#### `Frontend` Scripts:

| Command           | Description                                                 |
| :---------------- | :---------------------------------------------------------- |
| `npm start`       | Starts the Expo development server.                         |
| `npm run android` | Runs the app on a connected Android device or emulator.     |
| `npm run ios`     | Runs the app on a connected iOS device or simulator.        |
| `npm test`        | Runs unit tests (if configured, likely Jest/React Native Testing Library). <!-- TODO: Confirm testing framework and update --> |
| `npm run eject`   | Ejects from Expo (use with caution, if custom native modules are needed). |

#### `Backend` Scripts:

| Command        | Description                                  |
| :------------- | :------------------------------------------- |
| `npm start`    | Compiles and starts the Node.js server.      |
| `npm run dev`  | Starts the Node.js server with hot-reloading (e.g., using `nodemon` or `ts-node-dev`). <!-- Inferred --> |
| `npm run build` | Compiles TypeScript files to JavaScript.     |
| `npm test`     | Runs backend unit/integration tests. <!-- TODO: Confirm testing framework and update --> |

### Development Workflow

1.  Start the `Backend` service in one terminal.
2.  Start the `Frontend` development server in another terminal.
3.  Ensure your chosen emulator/simulator or physical device is running.
4.  Develop features in both `Frontend` and `Backend` as needed. The `Frontend` will typically reload automatically on changes.

## 🧪 Testing

Both `Frontend` and `Backend` components should have their own testing setups.

```bash
# To run frontend tests:
cd Frontend
npm test

# To run backend tests:
cd Backend
npm test
```

<!-- TODO: Specify actual testing frameworks (e.g., Jest, React Native Testing Library for frontend, Jest/Mocha/Chai for backend) and provide example test commands if available. -->

## 🚀 Deployment

### Mobile Application Deployment

The `Frontend` React Native application can be deployed to app stores (Google Play Store, Apple App Store).

-   **Expo Build**: If using Expo, you can build your app for production using `eas build`.
    ```bash
    cd Frontend
    eas build --platform android # or ios
    ```
-   **React Native CLI**: If ejected or using the bare React Native workflow, follow platform-specific guides to build and deploy your app.

### Backend Service Deployment

The `Backend` service, interacting with Firebase, is ideal for serverless deployment or a containerized environment.

-   **Firebase Cloud Functions**: If the `Backend` logic can be structured as serverless functions, Firebase Cloud Functions would be a natural fit, providing seamless integration with Firestore and other Firebase services.
-   **Cloud Run/Other Serverless**: The Node.js service could also be containerized and deployed to services like Google Cloud Run, AWS Fargate, or Azure Container Apps for scalable, serverless execution.
-   **Traditional Hosting**: For a persistent server, deploy to a VM or managed service like Google App Engine, Heroku, etc.

<!-- TODO: Add specific deployment instructions based on detected CI/CD or platform configurations. -->

## 🤝 Contributing

We welcome contributions to BoroBeacon! To get started, please:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and ensure they are well-tested.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request to the `main` branch of this repository.

Please see our [Contributing Guide](CONTRIBUTING.md) for more detailed information. <!-- TODO: Create CONTRIBUTING.md -->

## 📄 License

This project is licensed under the [LICENSE_NAME](LICENSE) - see the LICENSE file for details. <!-- TODO: Add LICENSE file (e.g., MIT, Apache 2.0) -->

## 🙏 Acknowledgments

-   [React Native](https://reactnative.dev/) - For building the cross-platform mobile application.
-   [Firebase](https://firebase.google.com/) - For the powerful backend services including Authentication and Firestore.
-   [GeoFire](https://github.com/firebase/geofire-js) - For enabling real-time, location-based queries with Firestore.
-   [Expo](https://expo.dev/) - For simplifying React Native development (if used).

## 📞 Support & Contact

-   🐛 Issues: [GitHub Issues](https://github.com/ThatOneDev78601/BoroBeacon/issues)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [ThatOneDev78601](https://github.com/ThatOneDev78601)

</div>
