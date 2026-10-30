package com.crackwithai.mobile

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class SpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    override fun getName(): String = "SpeechModule"

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        }
    }

    @ReactMethod
    fun isRecognitionAvailable(promise: Promise) {
        val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
        promise.resolve(available)
    }

    @ReactMethod
    fun startRecognition(locale: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                if (ContextCompat.checkSelfPermission(
                        reactContext,
                        Manifest.permission.RECORD_AUDIO
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    val errorMap = Arguments.createMap().apply {
                        putString("error", "Microphone permission is required for voice input.")
                        putString("code", "PERMISSION_DENIED")
                        putBoolean("final", true)
                    }
                    sendEvent("SpeechRecognition", errorMap)
                    promise.reject("PERMISSION_DENIED", "Microphone permission not granted")
                    return@runOnUiThread
                }

                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    val errorMap = Arguments.createMap().apply {
                        putString("error", "Speech recognition is not available on this device.")
                        putString("code", "UNAVAILABLE")
                        putBoolean("final", true)
                    }
                    sendEvent("SpeechRecognition", errorMap)
                    promise.reject("UNAVAILABLE", "Speech recognition not available")
                    return@runOnUiThread
                }

                if (speechRecognizer == null) {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                    speechRecognizer?.setRecognitionListener(this)
                } else {
                    speechRecognizer?.cancel()
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, if (locale.isNotEmpty()) locale else Locale.getDefault().toLanguageTag())
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                }

                speechRecognizer?.startListening(intent)
                isListening = true
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                val errorMap = Arguments.createMap().apply {
                    putString("error", e.message ?: "Failed to start speech recognition")
                    putString("code", "START_FAILED")
                    putBoolean("final", true)
                }
                sendEvent("SpeechRecognition", errorMap)
                promise.reject("START_FAILED", e.message)
            }
        }
    }

    @ReactMethod
    fun stopRecognition() {
        UiThreadUtil.runOnUiThread {
            try {
                speechRecognizer?.stopListening()
                isListening = false
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    @ReactMethod
    fun cancelRecognition() {
        UiThreadUtil.runOnUiThread {
            try {
                speechRecognizer?.cancel()
                isListening = false
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {
        isListening = false
    }

    override fun onError(error: Int) {
        isListening = false
        val message = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client recognition error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission required"
            SpeechRecognizer.ERROR_NETWORK -> "Network error during speech recognition"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected. Try speaking again."
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer is busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input detected"
            else -> "Speech recognition error ($error)"
        }
        val map = Arguments.createMap().apply {
            putString("error", message)
            putString("code", "ERROR_$error")
            putBoolean("final", true)
        }
        sendEvent("SpeechRecognition", map)
    }

    override fun onResults(results: Bundle?) {
        isListening = false
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = if (!matches.isNullOrEmpty()) matches[0] else ""
        val map = Arguments.createMap().apply {
            putString("text", text)
            putBoolean("final", true)
        }
        sendEvent("SpeechRecognition", map)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val map = Arguments.createMap().apply {
                putString("text", matches[0])
                putBoolean("final", false)
            }
            sendEvent("SpeechRecognition", map)
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
