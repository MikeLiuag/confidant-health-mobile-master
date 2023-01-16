#!/usr/bin/env bash
echo "Creating Bundle for iOS"
npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios
