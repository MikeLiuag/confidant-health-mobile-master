# Confidant Health Mobile Application

This project is a mobile application built with React Native.

## Project Setup!
You will need Node, the React Native command line interface, Python2, a JDK 1.8 or newer, and Android Studio.
### React Native CLI
Run the following command in a Command Prompt or shell:

`npm install -g react-native-cli`

### Android development environment
1. **Install Android Studio**

    [Download and install Android Studio.](https://developer.android.com/studio/ "Download Android Studio") Choose a "Custom" setup when prompted to select an installation type. Make sure the boxes next to all of the following are checked:

    - Android SDK
    - Android SDK Platform
    - Performance (Intel ® HAXM)
    - Android Virtual Device
    
    Then, click "Next" to install all of these components.
2. **Install the Android SDK**

    Android Studio installs the latest Android SDK by default. Building a React Native app with native code, however, requires the Android 8.1 (Oreo) SDK in particular. Additional Android SDKs can be installed through the SDK Manager in Android Studio. 
    The SDK Manager can be accessed from the "Welcome to Android Studio" screen. Click on "Configure", then select "SDK Manager".
 
    Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the `Android 8.1 (Oreo)` entry, then make sure the following items are checked:
    
    - `Android SDK Platform 27`
    - `Intel x86 Atom_64 System Image` or `Google APIs Intel x86 Atom System Image`
    
    Next, select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the "Android SDK Build-Tools" entry, then make sure that `27.0.3` is selected.
    
    Finally, click "Apply" to download and install the Android SDK and related build tools.

3. **Configure the ANDROID_HOME environment variable**
    Open the System pane under **System and Security** in the Windows Control Panel, then click on **Change settings....** Open the **Advanced** tab and click on **Environment Variables**.... Click on **New**... to create a new `ANDROID_HOME` user variable that points to the path to your Android SDK:
    
    The SDK is installed, by default, at the following location:
    
    > c:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
    
    You can find the actual location of the SDK in the Android Studio "Preferences" dialog, under **Appearance & Behavior** → **System Settings** → **Android SDK**.
    
### Preparing the Android Device
You will need an Android device to run your React Native Android app. This can be either a physical Android device, or more commonly, you can use an Android Virtual Device which allows you to emulate an Android device on your computer.

Either way, you will need to prepare the device to run Android apps for development.

#### Using a physical device
If you have a physical Android device, you can use it for development in place of an AVD by plugging it in to your computer using a USB cable and following the instructions [here](https://facebook.github.io/react-native/docs/running-on-device).

#### Using a virtual device
Use Android Studio to create or manage Android Virtual Devices (AVDs) by opening the "AVD Manager" from within Android Studio.

If you have just installed Android Studio, you will likely need to [create a new AVD](https://developer.android.com/studio/run/managing-avds.html). Select "Create Virtual Device...", then pick any Phone from the list and click "Next", then select the **Oreo** API Level 27 image.

Click "Next" then "Finish" to create your AVD. At this point you should be able to click on the green triangle button next to your AVD to launch it.    

### Running the Project

Clone the repository into a location of your choice. then open command prompt and run the following commands. 

    cd confidant-health-mobile
Install the node dependencies.

    npm install    
After installing all the dependancies successfully, make sure that your android device is running. Then run

    npm run android
or alternatively use
    
    react-native run-android
    
If everything is set up correctly, you should see the application running in your Android emulator or your physical device shortly .

### Modifying the app

After editing code inside the project while the application is running, Press the `R` key twice to reload and see your changes live.

