import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Simple hook to provide spoken feedback when a new tip is available
// It speaks only when analyzing and when the generated tip changes
export function useAudioFeedback(
  isAnalyzing,
  movement,
  fitnessMove,
  lastSpokenTip,
  setLastSpokenTip,
  getTip
) {
  const lastSpokenAtRef = useRef(0);
  const lastMovementRef = useRef('');
  const lastFitnessMoveRef = useRef('');
  const minSpeakIntervalMs = 5000; // 5 seconds for focused shooting technique feedback
  const significantChangeThreshold = 0.3; // Only speak on significant changes
  const audioConfiguredRef = useRef(false);

  // Configure audio for optimal headphone/speaker output
  const configureAudio = async () => {
    if (audioConfiguredRef.current) return;
    
    try {
      console.log('🔊 [AUDIO] Configuring audio for headphones and speaker...');
      
      // Set audio mode for optimal playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true, // Play even when phone is silent
        shouldDuckAndroid: true, // Duck other audio on Android
        playThroughEarpieceAndroid: false, // Use speaker/headphones, not earpiece
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
      
      audioConfiguredRef.current = true;
      console.log('🔊 [AUDIO] Audio configured successfully for headphones and speaker');
    } catch (error) {
      console.warn('🔊 [AUDIO] Audio configuration failed, using fallback:', error);
      // Fallback: just mark as configured to avoid repeated attempts
      audioConfiguredRef.current = true;
    }
  };

  useEffect(() => {
    console.log('🔊 [AUDIO] Audio feedback effect triggered - isAnalyzing:', isAnalyzing, 'movement:', movement, 'fitnessMove:', fitnessMove);
    
    // Reset lastSpokenAtRef when analysis starts to allow first tip
    if (isAnalyzing && lastSpokenAtRef.current === 0) {
      console.log('🔊 [AUDIO] Analysis started, resetting audio timer');
      lastSpokenAtRef.current = Date.now() - 4000; // Allow immediate first tip
    }
    
    if (!isAnalyzing) {
      console.log('🔊 [AUDIO] Not analyzing, skipping audio feedback');
      return;
    }

    // Only give audio feedback for significant movement - same thresholds as visual feedback
    if (movement === 'idle') {
      console.log('🔊 [AUDIO] Movement is idle, skipping audio feedback');
      return;
    }

    const trySpeak = async () => {
      try {
        const now = Date.now();
        
        // Configure audio first
        await configureAudio();
        
        // Check if enough time has passed
        if (now - lastSpokenAtRef.current < minSpeakIntervalMs) {
          console.log('🔊 [AUDIO] Too soon to speak again (interval:', minSpeakIntervalMs, 'ms)');
          return;
        }
        
        console.log('🔊 [AUDIO] Attempting to speak feedback...');
        
        // Check if there's been a significant change in movement
        const movementChanged = movement !== lastMovementRef.current;
        const fitnessMoveChanged = fitnessMove !== lastFitnessMoveRef.current;
        
        console.log('🔊 [AUDIO] Movement changed:', movementChanged, 'Fitness move changed:', fitnessMoveChanged);
        
        // Always try to get basketball tips, even if movement hasn't changed
        // This ensures we get basketball-specific feedback
        console.log('🔊 [AUDIO] Proceeding to get basketball tip...');

        console.log('🔊 [AUDIO] Getting tip for speech...');
        console.log('🔊 [AUDIO] getTip function type:', typeof getTip);
        const tip = typeof getTip === 'function' ? await getTip() : '🏀 Basketball coaching tip!';
        console.log('🔊 [AUDIO] Tip received:', tip, 'length:', tip?.length || 0);
        
        if (tip && tip !== lastSpokenTip && tip.length > 5) { // Speak basketball tips even if short
          console.log('🔊 [AUDIO] Speaking tip:', tip);
          
          // Stop any current speech to avoid overlap
          await Speech.stop();
          
          // Speak with optimized settings for headphones and speaker
          Speech.speak(tip, {
            language: 'en-US',
            rate: 0.8, // Slightly faster for better flow
            pitch: 1.0,
            volume: 1.0, // Full volume - will route to headphones if connected, speaker if not
            quality: 'enhanced', // Better quality for headphones
            voice: 'com.apple.voice.compact.en-US.Samantha', // Use high-quality voice
            onStart: () => console.log('🔊 [AUDIO] Speech started'),
            onDone: () => console.log('🔊 [AUDIO] Speech completed'),
            onError: (error) => console.warn('🔊 [AUDIO] Speech error:', error)
          });
          
          // Update state immediately to prevent repetition
          setLastSpokenTip(tip);
          lastSpokenAtRef.current = now;
          lastMovementRef.current = movement;
          lastFitnessMoveRef.current = fitnessMove;
          console.log('🔊 [AUDIO] Speech started successfully, lastSpokenTip updated to:', tip);
        } else {
          console.log('🔊 [AUDIO] Tip not suitable for speech (same as last or too short) - lastSpokenTip:', lastSpokenTip, 'current tip:', tip);
        }
      } catch (error) {
        // Fail silently; audio feedback is auxiliary
        console.warn('🔊 [AUDIO] Audio feedback error:', error);
      }
    };

    // Always try to speak for basketball feedback (removed movement change requirement)
    trySpeak();
  }, [isAnalyzing, movement, fitnessMove, getTip, lastSpokenTip, setLastSpokenTip]);
}

export default useAudioFeedback;
