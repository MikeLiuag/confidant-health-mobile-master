package live.safeopioidusecoalition.confidant;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.modules.network.OkHttpClientProvider;

import io.branch.rnbranch.RNBranchModule;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        super.onCreate(savedInstanceState);
        // Provide a client factory to React Native's OkHttpClientProvider and it will
        // use it instead of the default one.
       OkHttpClientProvider.setOkHttpClientFactory(new SSLPinnerFactory());
    }
/**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
    @Override
  protected String getMainComponentName() {
    return "confidant-health-mobile";
  }

 @Override
 protected ReactActivityDelegate createReactActivityDelegate() {
   return new ReactActivityDelegate(this, getMainComponentName()) {
     @Override
     protected ReactRootView createRootView() {
      return new RNGestureHandlerEnabledRootView(MainActivity.this);
     }
   };
 }

    @Override
    protected void onStart() {
        super.onStart();
        RNBranchModule.initSession(getIntent().getData(), this);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        RNBranchModule.onNewIntent(intent);
    }
}
