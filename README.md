# 💕 Couples Card Game

Couples Card Game is a fun and interactive card game for couples built with React Native and Expo. Swipe through cards with truths and dares to deepen your connection and have a great time together!

> Transform your mobile device into an engaging couples activity. Couples Card Game combines beautiful swipe animations with meaningful truths and fun dares to help couples connect, laugh, and create lasting memories together.

Whether you're looking for a fun date night activity, want to spark deeper conversations, or simply enjoy playing games together, Couples Card Game provides an entertaining way to strengthen your relationship. Our app features smooth card swiping, player statistics tracking, and a beautiful interface designed for two players.

## Demo

![Couples Card Game Demo](https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Couples+Card+Game "Couples Card Game Demo")

## Features

- 💕 **Truth & Dare Cards** - Each card contains a meaningful truth and an exciting dare
- 👥 **Two-Player Mode** - Track stats for both players with a beautiful VS interface
- 📊 **Player Statistics** - Keep track of truths answered, dares completed, and cards skipped
- 🎯 **Smooth Swiping** - Beautiful card swipe animations powered by react-tinder-card
- 🎨 **Modern UI** - Dark theme with elegant design and smooth transitions
- 🃏 **Card Deck Management** - Automatic progression through a deck of 10+ cards
- 📱 **Cross-Platform** - Works seamlessly on both Android and iOS

## ⚙️ Installation

After downloading the project, you have some prerequisites to install. Then you can run it on your localhost or build for production.

### 🔧 Install prerequisites (once for a machine)

- **Node.js:** [Install Node.js](https://nodejs.org/en/download/) [Recommended LTS version]
- **Expo CLI:** `npm install -g expo-cli` (optional, but recommended)
- **Android Studio:** [Install Android Studio](https://developer.android.com/studio) (for Android development)
- **Xcode:** [Install Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

### 🖥️ Local setup

After successfully installing those dependencies, open this project with any IDE [[VS Code](https://code.visualstudio.com/) recommended], and then open the internal terminal of IDE [vs code shortcut <code>ctrl/cmd+\`</code>]

- Install dependencies

```sh
# Using npm
npm install

# OR using Yarn
yarn install
```

- Start Metro bundler

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

- Run on Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

- Run on iOS (macOS only)

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

- Run on Web

```sh
# Using npm
npm run web

# OR using Yarn
yarn web
```

After that, it will open up the app in your Android Emulator, iOS Simulator, web browser, or connected device, watch for changes to source files, and live-reload when changes are saved.

## 🏗️ Production Build

After finishing all the customization, you can create a production build by running these commands.

### Android

```sh
# Using Expo
eas build --platform android

# OR build locally (requires Android Studio setup)
cd android
./gradlew assembleRelease
```

### iOS

```sh
# Using Expo
eas build --platform ios

# OR build locally (requires macOS and Xcode)
# Build through Xcode or use:
cd ios
xcodebuild -workspace CouplesCardGame.xcworkspace -scheme CouplesCardGame -configuration Release
```

## 🎮 How to Play

1. **Start the Game**: Launch the app to begin with the first card
2. **Read the Card**: Each card displays a truth and a dare
3. **Make Your Choice**:
   - **Swipe Left** (←) or tap the left button: Answer the truth
   - **Swipe Right** (→) or tap the right button: Accept the dare
   - **Skip** (✗) or tap the skip button: Skip the card
4. **Track Progress**: Watch your stats update in real-time in the header
5. **Continue**: Keep swiping through cards until the deck is complete

## 🎯 Game Rules

- Players take turns (alternates after each swipe)
- Truths are tracked separately from dares
- Skipped cards are counted but don't affect gameplay
- The game ends when all cards are completed
- Stats are displayed in real-time for both players

## 🔧 Development

### Adding New Cards

Edit `src/data/cards.ts` to add more cards to the deck:

```typescript
{
  id: "11",
  truth: "Your truth here?",
  dare: "Your dare here.",
}
```

### Modifying Game Logic

- Game state management: `src/hooks/useGameState.ts`
- Card deck logic: `src/hooks/useCardDeck.ts`
- Main game screen: `src/screens/GameScreen.tsx`

## 🛠️ Tech Stack

- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (^54.0.27) - Development platform and tooling
- **TypeScript** (^5.9.2) - Type-safe JavaScript
- **react-tinder-card** (^1.6.4) - Card swipe component
- **@expo/vector-icons** - Icon library

## Troubleshooting

If you're having issues getting the above steps to work, see the [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/clear-cache/) page or [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

Common issues:

- **Metro bundler cache**: Try clearing the cache with `expo start -c` or `npm start -- --reset-cache`
- **Node modules**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **Expo CLI**: Make sure you have the latest version: `npm install -g expo-cli@latest`

## License

This project is provided for viewing purposes only. All rights are reserved. No part of this project may be copied, modified, or redistributed without explicit written permission from the author.

---

Made with ❤️ for couples to connect and have fun together!
