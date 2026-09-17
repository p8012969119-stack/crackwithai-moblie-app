#import <React/RCTEventEmitter.h>
#import <AVFoundation/AVFoundation.h>

@interface SpeechModule : RCTEventEmitter <RCTBridgeModule, AVSpeechSynthesizerDelegate>
@end
