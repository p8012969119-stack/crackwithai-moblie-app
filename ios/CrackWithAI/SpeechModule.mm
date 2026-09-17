#import "SpeechModule.h"
#import <UIKit/UIKit.h>
#import <Speech/Speech.h>

@implementation SpeechModule {
  AVSpeechSynthesizer *_synthesizer;
  AVAudioEngine *_audioEngine;
  SFSpeechRecognizer *_recognizer;
  SFSpeechAudioBufferRecognitionRequest *_recognitionRequest;
  SFSpeechRecognitionTask *_recognitionTask;
  NSString *_transcript;
  BOOL _tapInstalled;
  BOOL _hasListeners;
  BOOL _recognizing;
  BOOL _ownsRecordingSession;
  NSUInteger _recognitionGeneration;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _synthesizer = [[AVSpeechSynthesizer alloc] init];
    _synthesizer.delegate = self;
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(interruptRecognition) name:AVAudioSessionInterruptionNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(interruptRecognition) name:UIApplicationWillResignActiveNotification object:nil];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_METHOD(speak:(NSString *)text rate:(float)rate pitch:(float)pitch) {
  dispatch_async(dispatch_get_main_queue(), ^{
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback error:nil];
    [session setActive:YES error:nil];

    if ([self->_synthesizer isSpeaking]) {
      [self->_synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
    
    AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:text];
    utterance.rate = rate > 0 ? rate : AVSpeechUtteranceDefaultSpeechRate;
    utterance.pitchMultiplier = pitch > 0 ? pitch : 1.0;
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
    
    [self->_synthesizer speakUtterance:utterance];
  });
}

RCT_EXPORT_METHOD(stop) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([self->_synthesizer isSpeaking]) {
      [self->_synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
  });
}

RCT_EXPORT_METHOD(pause) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([self->_synthesizer isSpeaking]) {
      [self->_synthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
  });
}

RCT_EXPORT_METHOD(resume) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([self->_synthesizer isPaused]) {
      [self->_synthesizer continueSpeaking];
    }
  });
}


RCT_EXPORT_METHOD(sharePdf:(NSString *)base64 filename:(NSString *)filename
                  resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64 options:0];
  if (!data || data.length < 5) { reject(@"invalid_pdf", @"No certificate PDF received", nil); return; }
  NSString *safeName = filename.lastPathComponent;
  NSURL *url = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:safeName]];
  NSError *writeError = nil;
  if (![data writeToURL:url options:NSDataWritingAtomic error:&writeError]) { reject(@"export_failed", @"Could not prepare certificate", writeError); return; }
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindow *window = nil;
    for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
      if (scene.activationState == UISceneActivationStateForegroundActive && [scene isKindOfClass:UIWindowScene.class]) {
        for (UIWindow *candidate in ((UIWindowScene *)scene).windows) if (candidate.isKeyWindow) window = candidate;
      }
    }
    UIViewController *presenter = window.rootViewController;
    while (presenter.presentedViewController) presenter = presenter.presentedViewController;
    if (!presenter) { reject(@"no_window", @"No active window to share certificate", nil); return; }
    UIActivityViewController *sheet = [[UIActivityViewController alloc] initWithActivityItems:@[url] applicationActivities:nil];
    sheet.popoverPresentationController.sourceView = presenter.view;
    sheet.popoverPresentationController.sourceRect = CGRectMake(CGRectGetMidX(presenter.view.bounds), CGRectGetMidY(presenter.view.bounds), 1, 1);
    sheet.completionWithItemsHandler = ^(UIActivityType type, BOOL completed, NSArray *items, NSError *error) {
      [[NSFileManager defaultManager] removeItemAtURL:url error:nil];
    };
    [presenter presentViewController:sheet animated:YES completion:^{ resolve(@YES); }];
  });
}

- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }
- (NSArray<NSString *> *)supportedEvents { return @[@"SpeechRecognition"]; }
- (void)startObserving { _hasListeners = YES; }
- (void)stopObserving { _hasListeners = NO; [self cleanRecognition]; }
- (void)cleanRecognition {
  _recognitionGeneration++;
  _recognizing = NO;
  if (_audioEngine.isRunning) [_audioEngine stop];
  if (_tapInstalled) {[_audioEngine.inputNode removeTapOnBus:0]; _tapInstalled = NO;}
  [_recognitionRequest endAudio];
  [_recognitionTask cancel];
  _recognitionTask = nil; _recognitionRequest = nil; _audioEngine = nil; _recognizer = nil;
  if (_ownsRecordingSession) {
    [[AVAudioSession sharedInstance] setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:nil];
    _ownsRecordingSession = NO;
  }
}
- (void)recognitionEvent:(NSDictionary *)body { if (_hasListeners) [self sendEventWithName:@"SpeechRecognition" body:body]; }
- (void)interruptRecognition {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (!self->_recognizing) return;
    [self cleanRecognition];
    [self recognitionEvent:@{@"error": @"Voice input was interrupted. Please try again.", @"code": @"interrupted", @"final": @YES}];
  });
}
RCT_EXPORT_METHOD(startRecognition:(NSString *)locale resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [self cleanRecognition];
  NSUInteger generation = _recognitionGeneration;
  [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus status) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (generation != self->_recognitionGeneration) {reject(@"cancelled", @"Voice input cancelled.", nil); return;}
      if (status != SFSpeechRecognizerAuthorizationStatusAuthorized) {reject(@"speech_permission", @"Allow Speech Recognition in Settings to use voice input.", nil); return;}
      [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL granted) {
        dispatch_async(dispatch_get_main_queue(), ^{
          if (generation != self->_recognitionGeneration) {reject(@"cancelled", @"Voice input cancelled.", nil); return;}
          if (!granted) {reject(@"microphone_permission", @"Allow Microphone access in Settings to use voice input.", nil); return;}
          self->_recognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:locale.length ? locale : @"en-US"]];
          if (!self->_recognizer.isAvailable) {reject(@"unavailable", @"Speech recognition is unavailable. You can type your message instead.", nil); [self cleanRecognition]; return;}
          [self->_synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
          NSError *error = nil;
          AVAudioSession *audio = [AVAudioSession sharedInstance];
          if (![audio setCategory:AVAudioSessionCategoryRecord mode:AVAudioSessionModeMeasurement options:AVAudioSessionCategoryOptionDuckOthers error:&error] || ![audio setActive:YES error:&error]) {reject(@"audio_unavailable", @"The microphone is unavailable. Please try again.", error); [self cleanRecognition]; return;}
          self->_ownsRecordingSession = YES;
          self->_audioEngine = [[AVAudioEngine alloc] init];
          self->_recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
          self->_recognitionRequest.shouldReportPartialResults = YES;
          if (self->_recognizer.supportsOnDeviceRecognition) self->_recognitionRequest.requiresOnDeviceRecognition = YES;
          self->_transcript = @"";
          AVAudioInputNode *input = self->_audioEngine.inputNode;
          AVAudioFormat *format = [input outputFormatForBus:0];
          if (format.sampleRate <= 0 || format.channelCount == 0) {reject(@"audio_unavailable", @"No microphone input is available on this device.", nil); [self cleanRecognition]; return;}
          @try {
            SFSpeechAudioBufferRecognitionRequest *request = self->_recognitionRequest;
            [input installTapOnBus:0 bufferSize:1024 format:format block:^(AVAudioPCMBuffer *buffer, AVAudioTime *when) {[request appendAudioPCMBuffer:buffer];}];
            self->_tapInstalled = YES;
            [self->_audioEngine prepare];
            if (![self->_audioEngine startAndReturnError:&error]) {reject(@"audio_unavailable", @"Could not start the microphone.", error); [self cleanRecognition]; return;}
          } @catch (NSException *exception) {reject(@"audio_unavailable", @"Could not start microphone input on this device.", nil); [self cleanRecognition]; return;}
          self->_recognizing = YES;
          __weak SpeechModule *weakSelf = self;
          self->_recognitionTask = [self->_recognizer recognitionTaskWithRequest:self->_recognitionRequest resultHandler:^(SFSpeechRecognitionResult *result, NSError *recognitionError) {
            dispatch_async(dispatch_get_main_queue(), ^{
              SpeechModule *strongSelf = weakSelf;
              if (!strongSelf || generation != strongSelf->_recognitionGeneration) return;
              if (result) strongSelf->_transcript = result.bestTranscription.formattedString;
              if (result.isFinal || recognitionError) {
#if DEBUG
                if (recognitionError) NSLog(@"[WorkshopSpeech] domain=%@ code=%ld", recognitionError.domain, (long)recognitionError.code);
#endif
                NSString *text = strongSelf->_transcript ?: @"";
                [strongSelf cleanRecognition];
                if (text.length) [strongSelf recognitionEvent:@{@"text":text, @"final":@YES}];
                else [strongSelf recognitionEvent:@{@"error":recognitionError ? @"Speech could not be recognized. Check your connection and try again." : @"No speech detected. Please try again.", @"code":@"no_speech", @"final":@YES}];
              } else if (result) [strongSelf recognitionEvent:@{@"text":strongSelf->_transcript, @"final":@NO}];
            });
          }];
          resolve(@YES);
          dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 60 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
            if (generation == self->_recognitionGeneration) [self stopRecognition];
          });
        });
      }];
    });
  }];
}
RCT_EXPORT_METHOD(stopRecognition) {
  NSString *text = _transcript ?: @"";
  BOOL wasRecognizing = _recognizing;
  [self cleanRecognition];
  if (!wasRecognizing) return;
  if (text.length) [self recognitionEvent:@{@"text":text, @"final":@YES}];
  else [self recognitionEvent:@{@"error":@"No speech detected. Please try again.", @"code":@"no_speech", @"final":@YES}];
}
RCT_EXPORT_METHOD(cancelRecognition) { [self cleanRecognition]; }
- (void)invalidate { [self cleanRecognition]; [[NSNotificationCenter defaultCenter] removeObserver:self]; [super invalidate]; }
@end
