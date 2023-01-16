/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <React/RCTRootView.h>
#import <React/RCTBridgeModule.h>
@interface AppDelegate : UIResponder <UIApplicationDelegate, UNUserNotificationCenterDelegate>
@property (nonatomic, strong) NSDictionary *launchOptions;

@property (nonatomic, strong) UIWindow *window;

@property (nonatomic) RCTRootView *rootView;

@end

@interface RCTAnimatedSplash : NSObject <RCTBridgeModule>
+(void) show:(AppDelegate*)delegate postCtrl:(UIViewController*)postCtrl;
@end
