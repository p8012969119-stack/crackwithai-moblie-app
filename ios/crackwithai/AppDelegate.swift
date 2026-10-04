import UIKit
import React
import React_RCTAppDelegate

@main
class AppDelegate: RCTAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.moduleName = "crackwithai"
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    #if targetEnvironment(simulator)
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    if let bundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
      return bundle
    }
    RCTBundleURLProvider.sharedSettings().jsLocation = "172.168.13.45"
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #endif
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
