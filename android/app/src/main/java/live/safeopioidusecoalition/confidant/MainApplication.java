package live.safeopioidusecoalition.confidant;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.devsupport.WebsocketJavaScriptExecutor;

import io.branch.rnbranch.RNBranchPackage;
import com.vonovak.AddCalendarEventPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.opentokreactnative.OTPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.instabug.reactlibrary.RNInstabugReactnativePackage;


import io.branch.rnbranch.RNBranchModule;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
          new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
              return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
              @SuppressWarnings("UnnecessaryLocalVariable")
              List<ReactPackage> packages = new PackageList(this).getPackages();
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // packages.add(new MyReactNativePackage());
//                packages.add(new ReactNativePushNotificationPackage());
              return packages;
            }

            @Override
            protected String getJSMainModuleName() {
              return "index";
            }
          };

      @Override
      public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
      }

      @Override
      public void onCreate() {
      new RNInstabugReactnativePackage
                   .Builder(BuildConfig.INSTABUG_TOKEN, MainApplication.this)
                   .setInvocationEvent("shake")
                   .setPrimaryColor("#1D82DC")
                   .setFloatingEdge("left")
                   .setFloatingButtonOffsetFromTop(250)
                   .build();
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        initializeFlipper(this); // Remove this line if you don't want Flipper enabled
          RNBranchModule.getAutoInstance(this);
      }

      /**
       * Loads Flipper in React Native templates.
       *
       * @param context
       */
      private static void initializeFlipper(Context context) {
        if (BuildConfig.DEBUG) {
          try {
            /*
             We use reflection here to pick up the class that initializes Flipper,
            since Flipper library is not available in release mode
            */
            Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
            aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
          } catch (ClassNotFoundException e) {
            e.printStackTrace();
          } catch (NoSuchMethodException e) {
            e.printStackTrace();
          } catch (IllegalAccessException e) {
            e.printStackTrace();
          } catch (InvocationTargetException e) {
            e.printStackTrace();
          }
        }
      }
}
