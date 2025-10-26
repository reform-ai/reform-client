import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';

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
          // Don't stop current speech - let it finish naturally to avoid cutting off
          Speech.speak(tip, {
            language: 'en-US',
            rate: 0.7, // Slower for clarity and to avoid cutting off
            pitch: 1.0,
            volume: 1.0, // MAX VOLUME for demo
            quality: 'enhanced' // Better quality
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
        console.warn('Audio feedback error:', error);
      }
    };

    // Always try to speak for basketball feedback (removed movement change requirement)
    trySpeak();
  }, [isAnalyzing, movement, fitnessMove, getTip, lastSpokenTip, setLastSpokenTip]);
}

export default useAudioFeedback;
