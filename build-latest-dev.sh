#!/usr/bin/env bash
if ./setup-configs.sh dev; then
  echo "Environment Configurations ready to use."
else
  echo "Failed to setup environment configurations. Please retry"
  exit 1
fi
if  [[ $1 = "-android" ]]; then
    echo "Cleaning Android project"
    cd android
    ./gradlew clean
    cd ..
fi
echo "Pulling Latest Codebase"
git pull
echo "Updating Shared Module"
./update-shared-module.sh
echo "Creating Bundle"
if  [[ $1 = "-android" ]]; then
    echo "Android Platform Selected"
    if  [[ $2 = "-release" ]]; then
      cd android
	    echo "Removing Duplicate Resources"
	    rm -rf app/src/main/res/drawable*/node*
	    rm -rf app/src/main/res/drawable*/src_*
	    rm -rf app/src/main/res/raw/node*
	    rm -rf app/src/main/res/raw/src_*
	    rm -rf app/src/main/res/raw/app.json
	    echo "Creating Release Bundle"
	    ./gradlew bundleRelease
    else
      npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
      cd android
            ./gradlew assembleDebug
            echo "Removing Duplicate Resources"
      	    rm -rf app/src/main/res/drawable*/node*
      	    rm -rf app/src/main/res/drawable*/src_*
      	    rm -rf app/src/main/res/raw/node*
      	    rm -rf app/src/main/res/raw/src_*
      	    rm -rf app/src/main/res/raw/app.json
	  fi
	echo "Bundle created. Create a fresh build from Android Studio"
else
    echo "Ios Platform Selected"
	npx react-native bundle --entry-file index.js --platform ios --dev true --bundle-output ios/main.jsbundle --assets-dest ios
	echo "Bundle created. Create a fresh build from X-Code"
fi
