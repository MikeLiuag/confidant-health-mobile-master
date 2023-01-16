/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <RNCPushNotificationIOS.h>
//#import <Firebase.h>
//#import "RNFirebaseNotifications.h"
//#import "RNFirebaseMessaging.h"
#import "RNSplashScreen.h"
#import <OneSignal/OneSignal.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <RNBranch/RNBranch.h>
#import <TrustKit/TrustKit.h>
#import <TrustKit/TSKPinningValidator.h>
#import <TrustKit/TSKPinningValidatorCallback.h>
@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
   [RNBranch useTestInstance];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  OneSignal.inFocusDisplayType = OSNotificationDisplayTypeNone;

  NSURL *jsCodeLocation;
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  UIViewController *rootViewController = [UIViewController new];
  [RCTAnimatedSplash show:(AppDelegate *)self postCtrl:(UIViewController*)rootViewController];
  #ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif

  self.rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation moduleName:@"confidant-health-mobile" initialProperties:nil launchOptions:launchOptions];
  self.rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  rootViewController.view = self.rootView;

  if (@available(iOS 13, *)) {
        self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
    }

    if (@available(iOS 14, *)) {
      UIDatePicker *picker = [UIDatePicker appearance];
      picker.preferredDatePickerStyle = UIDatePickerStyleWheels;
    }

  [self initTrustKit];

  return YES;

}

- (void)initTrustKit {
 NSDictionary *trustKitConfig =
 @{
   // Swizzling because we can't access the NSURLSession instance used in React Native's fetch method
   kTSKSwizzleNetworkDelegates: @YES,
   kTSKPinnedDomains: @{
   @"app.confidanthealth.com" : @{
                     kTSKIncludeSubdomains: @YES, // Pin all subdomains
                     kTSKEnforcePinning: @YES, // Block connections if pinning validation failed
                     kTSKDisableDefaultReportUri: @YES,
                     kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
                     kTSKPublicKeyHashes : @[
                        @"/8wAPhbcUi4m3jNUdcNTliKSU+r8Hrvbq81Fe8whkXg=",
//                         @"/8Rw90Ej3Ttt8RRkrg+WYDS9n7IS03bk5bjP/UXPtaY8=",
//                         @"/Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA=",
//                         @"/VjLZe/p3W/PJnd6lL8JVNBCGQBZynFLdZSTIqcO0SJ8="
                           @"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="// FAKE KEY
                     ]
                 },
       @"qa.confidantdemos.com" : @{
           kTSKIncludeSubdomains: @YES, // Pin all subdomains
           kTSKEnforcePinning: @YES, // Block connections if pinning validation failed
           kTSKDisableDefaultReportUri: @YES,
           kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
           kTSKPublicKeyHashes : @[
              @"AV3JtTXopW86Wtx4zo8xxfead+Dg3iMiHi5Uccnk6wQ=",
              @"C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
              @"jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0="
           ]
       },
       @"staging.confidantdemos.com" : @{
                  kTSKIncludeSubdomains: @YES, // Pin all subdomains
                  kTSKEnforcePinning: @YES, // Block connections if pinning validation failed
                  kTSKDisableDefaultReportUri: @YES,
                  kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
                  kTSKPublicKeyHashes : @[
                     @"+SqhPGxSxP6Xq8pmHr6TfwNH0MfvNzOu+DUWPgMgFYA=",
                     @"C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
                     @"jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0="
                  ]
              },
       @"dev.confidantdemos.com" : @{
                         kTSKIncludeSubdomains: @YES, // Pin all subdomains
                         kTSKEnforcePinning: @YES, // Block connections if pinning validation failed
                         kTSKDisableDefaultReportUri: @YES,
                         kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
                         kTSKPublicKeyHashes : @[
                            @"ydVS5Q/BGgB1M9biFKSzdyQ5PAD7KXdCIBonQPCuxhM=",
                            @"C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
                            @"jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0="
                         ]
                     }
   }};
 [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
 [TrustKit sharedInstance].pinningValidatorCallback = ^(TSKPinningValidatorResult *result, NSString *notedHostname, TKSDomainPinningPolicy *policy) {
     if (result.finalTrustDecision == TSKTrustEvaluationFailedNoMatchingPin) {
       NSLog(@"TrustKit certificate matching failed");
       // Add more logging here. i.e. Sentry, BugSnag etc
     }
   };
 }

//
//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
//
//{
//  return [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
//}
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    if ([RNBranch application:app openURL:url options:options])  {
        // do other deep link routing for the Facebook SDK, Pinterest SDK, etc
    }
    return YES;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *restorableObjects))restorationHandler {
    return [RNBranch continueUserActivity:userActivity];
}


// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"Got Notification");
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
   {
     NSLog( @"Handle push from background or closed" );
     // if you set a member variable in didReceiveRemoteNotification, you  will know if this is from closed or background
     NSLog(@"%@", response.notification.request.content);
     [RNCPushNotificationIOS didReceiveRemoteNotification:response.notification.request.content.userInfo
                                   fetchCompletionHandler:completionHandler];
    }


// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

@end

@implementation RCTAnimatedSplash
static AppDelegate*(mainDelegate);
static UIViewController*(postController);
RCT_EXPORT_MODULE(AnimatedSplash);

RCT_EXPORT_METHOD(hide) {
  dispatch_async(dispatch_get_main_queue(), ^{
     // do work here
    mainDelegate.window.rootViewController = postController;
    [mainDelegate.window makeKeyAndVisible];
  });

}

+(void)show:(AppDelegate*)delegate postCtrl:(UIViewController*)postCtrl
{
  mainDelegate = delegate;
  postController=postCtrl;
  UIStoryboard *launchStoryboard = [UIStoryboard storyboardWithName:@"LaunchBoard" bundle:nil];
  UIViewController *launchController = [launchStoryboard instantiateViewControllerWithIdentifier:@"LauchViewController"];

  delegate.window.rootViewController = launchController;
  [delegate.window makeKeyAndVisible];
}

@end
