#import <UIKit/UIKit.h>

#import "AppDelegate.h"

int main(int argc, char *argv[])
{
  @autoreleasepool {
    @try {
      return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
    } @catch (NSException *exception) {
      NSLog(@"[CrackWithAI] Uncaught exception in main: %@\n%@", exception.reason, exception.callStackSymbols);
      return 0;
    }
  }
}
