import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// Initialize TensorFlow for React Native
export const initializeTensorFlow = async () => {
  try {
    // Wait for TensorFlow to be ready
    await tf.ready();
    console.log('TensorFlow.js is ready!');

    // Prefer React Native WebGL backend when available, else fallback to CPU
    const availableBackends = tf.backendNames ? tf.backendNames() : [];
    const preferredBackend = availableBackends.includes('rn-webgl') ? 'rn-webgl' : 'cpu';
    await tf.setBackend(preferredBackend);
    console.log(`TensorFlow backend set to ${preferredBackend}`);
    
    return true;
  } catch (error) {
    console.error('Error initializing TensorFlow:', error);
    return false;
  }
};

// Initialize TensorFlow.js backend for React Native
tf.ready().then(() => {
  console.log('TensorFlow.js backend ready');
});

// Camera-based movement detection using frame analysis
export function useCameraMovementDetection(isAnalyzing, setMovement, setMovementIntensity, setMovementHistory, setFitnessMove, setLastSpokenTip, detectFitnessMovement, cameraRef) {
  const lastAnalysisRef = useRef(0);
  const movementBufferRef = useRef([]);
  const analysisThrottleMs = 1000; // 1 second to reduce LLM calls
  const initialDelayRef = useRef(true);
  const frameCountRef = useRef(0);
  const lastIntensityRef = useRef(1.0);
  const userInFrameRef = useRef(false);

  useEffect(() => {
    console.log('📱 [CAMERA] Camera movement detection effect triggered - isAnalyzing:', isAnalyzing);
    
    if (isAnalyzing) {
      console.log('📱 [CAMERA] Starting camera-based movement detection');
      
      // Simulate camera-based movement detection that only works when user is in frame
      const startCameraAnalysis = () => {
        if (isAnalyzing) {
          const timestamp = Date.now();
          frameCountRef.current++;
          
          // Simulate user detection in camera frame
          // In a real implementation, this would use pose detection to check if user is visible
          const isUserInFrame = frameCountRef.current > 5 && frameCountRef.current % 100 < 80; // User visible 80% of the time
          userInFrameRef.current = isUserInFrame;
          
          if (!isUserInFrame) {
            // User not in frame - set to idle
            console.log('📱 [CAMERA] User not in camera frame - setting idle');
            setMovementIntensity(1.0);
            setMovement('idle');
            setFitnessMove('none');
            
            // Continue analysis loop
            if (isAnalyzing) {
              setTimeout(startCameraAnalysis, 500);
            }
            return;
          }
          
          console.log('📱 [CAMERA] User detected in camera frame - analyzing movement');
          
          // Simulate realistic movement intensity based on user interaction
          const baseIntensity = 1.0; // Base intensity when idle
          
          // Create more realistic movement patterns for basketball (only when user is in frame)
          let intensity;
          if (frameCountRef.current < 10) {
            // Initial startup - stable
            intensity = baseIntensity + (Math.random() - 0.5) * 0.1;
          } else if (frameCountRef.current % 30 < 8) {
            // Simulate basketball shooting motions (every 3 seconds for 0.8 seconds)
            intensity = baseIntensity + 1.5 + (Math.random() - 0.5) * 0.8; // Higher intensity for basketball motions
          } else if (frameCountRef.current % 60 < 5) {
            // Simulate strong basketball movements (every 6 seconds for 0.5 seconds)
            intensity = baseIntensity + 2.2 + (Math.random() - 0.5) * 0.6; // Very high intensity for strong motions
          } else {
            // Normal idle state with small variations
            intensity = baseIntensity + (Math.random() - 0.5) * 0.2;
          }
          
          // Smooth the intensity to prevent wild jumps
          const smoothedIntensity = lastIntensityRef.current * 0.7 + intensity * 0.3;
          lastIntensityRef.current = smoothedIntensity;
          
          console.log('📱 [CAMERA] Frame analysis - intensity:', smoothedIntensity.toFixed(3), 'frame:', frameCountRef.current, 'userInFrame:', isUserInFrame);
          
          // Buffer movement data for batch processing
          movementBufferRef.current.push({ 
            x: (Math.random() - 0.5) * 0.1, 
            y: (Math.random() - 0.5) * 0.1, 
            z: 0, 
            intensity: smoothedIntensity, 
            timestamp 
          });
          
          // Update UI immediately for responsiveness
          setMovementIntensity(smoothedIntensity);
          
          // Smart movement classification with hysteresis to prevent flickering
          setMovement(prevMovement => {
            let newMovement;
            // Very strict thresholds for actual basketball shooting motions
            if (smoothedIntensity > 2.5) newMovement = 'active';      // Only very strong shooting motions
            else if (smoothedIntensity > 2.0) newMovement = 'moving'; // Strong shooting motions
            else if (smoothedIntensity < 1.5) newMovement = 'idle';   // Most device movement is idle
            else newMovement = prevMovement; // Keep current state for moderate movements
            
            if (newMovement !== prevMovement) {
              console.log('📱 [CAMERA] Movement changed:', prevMovement, '->', newMovement, '(intensity:', smoothedIntensity.toFixed(3), ')');
            }
            return newMovement;
          });
          
          // Throttled analysis to reduce LLM calls
          if (timestamp - lastAnalysisRef.current > analysisThrottleMs) {
            console.log('📱 [CAMERA] Throttle period reached, processing movement data');
            const recentData = movementBufferRef.current.slice(-10); // Last 10 readings
            setMovementHistory(prev => {
              const newHistory = [...prev, ...recentData];
              return newHistory.slice(-30);
            });

            if (initialDelayRef.current) {
              console.log('📱 [CAMERA] Still in initial delay period, skipping LLM analysis');
              setTimeout(() => {
                console.log('📱 [CAMERA] Initial delay period ended, LLM analysis now enabled');
                initialDelayRef.current = false;
              }, 3000);
            }
            
            // Only analyze if we have basketball shooting movement AND past initial delay AND user is in frame
            if (smoothedIntensity > 2.0 && !initialDelayRef.current && isUserInFrame) {
              console.log('📱 [CAMERA] Calling detectFitnessMovement (intensity:', smoothedIntensity.toFixed(3), ')');
              detectFitnessMovement(smoothedIntensity, { x: 0, y: 0, z: 0 });
            } else if (smoothedIntensity <= 2.0) {
              console.log('📱 [CAMERA] Movement too weak for basketball analysis (intensity:', smoothedIntensity.toFixed(3), ')');
            } else if (!isUserInFrame) {
              console.log('📱 [CAMERA] User not in frame, skipping LLM analysis');
            }
            
            lastAnalysisRef.current = timestamp;
            movementBufferRef.current = []; // Clear buffer
            console.log('📱 [CAMERA] Movement buffer cleared, next analysis in', analysisThrottleMs, 'ms');
          }
          
          // Continue analysis loop
          if (isAnalyzing) {
            setTimeout(startCameraAnalysis, 500); // Analyze every 500ms (slower to reduce load)
          }
        }
      };
      
      // Start the camera analysis loop
      startCameraAnalysis();
      
    } else {
      console.log('📱 [CAMERA] Stopping camera analysis - immediate cleanup');
      setMovement('idle');
      setMovementIntensity(0);
      setFitnessMove('none');
      setLastSpokenTip('');
      console.log('📱 [CAMERA] Basic state reset complete');

      setTimeout(() => {
        console.log('📱 [CAMERA] Batched cleanup - clearing history and buffers');
        setMovementHistory([]);
        movementBufferRef.current = [];
        initialDelayRef.current = true;
        frameCountRef.current = 0;
        lastIntensityRef.current = 1.0;
        userInFrameRef.current = false;
        console.log('📱 [CAMERA] Full cleanup complete, ready for next session');
      }, 0);
    }
  }, [isAnalyzing, cameraRef]);
}

export function useMovementDetection(isAnalyzing, setMovement, setMovementIntensity, setMovementHistory, setFitnessMove, setLastSpokenTip, detectFitnessMovement) {
  const lastAnalysisRef = useRef(0);
  const movementBufferRef = useRef([]);
  const analysisThrottleMs = 1000; // Increased to 1 second to reduce LLM calls
  const initialDelayRef = useRef(true);

  useEffect(() => {
    console.log('📱 [MOVEMENT] Movement detection effect triggered - isAnalyzing:', isAnalyzing);
    let subscription;
    if (isAnalyzing) {
      console.log('📱 [MOVEMENT] Starting accelerometer with 150ms interval');
      Accelerometer.setUpdateInterval(150); // Reduced frequency from 100ms to 150ms
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const intensity = Math.sqrt(x * x + y * y + z * z);
        const timestamp = Date.now();
        
        // Buffer movement data for batch processing
        movementBufferRef.current.push({ x, y, z, intensity, timestamp });
        
        // Update UI immediately for responsiveness
        setMovementIntensity(intensity);
        
               // Smart movement classification with hysteresis to prevent flickering
               setMovement(prevMovement => {
                 let newMovement;
                 // Very strict thresholds for actual basketball shooting motions
                 if (intensity > 2.5) newMovement = 'active';      // Only very strong shooting motions
                 else if (intensity > 2.0) newMovement = 'moving'; // Strong shooting motions
                 else if (intensity < 1.5) newMovement = 'idle';   // Most device movement is idle
                 else newMovement = prevMovement; // Keep current state for moderate movements
          
          if (newMovement !== prevMovement) {
            console.log('📱 [MOVEMENT] Movement changed:', prevMovement, '->', newMovement, '(intensity:', intensity.toFixed(3), ')');
          }
          return newMovement;
        });
        
        // Throttled analysis to reduce LLM calls
        if (timestamp - lastAnalysisRef.current > analysisThrottleMs) {
          console.log('📱 [MOVEMENT] Throttle period reached, processing movement data');
          const recentData = movementBufferRef.current.slice(-10); // Last 10 readings
          setMovementHistory(prev => {
            const newHistory = [...prev, ...recentData];
            return newHistory.slice(-30); // Keep more history for better analysis
          });
          
          // Skip LLM analysis for first 3 seconds to avoid initial delay
          if (initialDelayRef.current) {
            console.log('📱 [MOVEMENT] Still in initial delay period, skipping LLM analysis');
            setTimeout(() => {
              console.log('📱 [MOVEMENT] Initial delay period ended, LLM analysis now enabled');
              initialDelayRef.current = false;
            }, 3000);
          }
          
                 // Only analyze if we have significant basketball shooting movement AND past initial delay
                 if (intensity > 2.5 && !initialDelayRef.current) {
                   console.log('📱 [MOVEMENT] Calling detectFitnessMovement (intensity:', intensity.toFixed(3), ')');
                   detectFitnessMovement(intensity, { x, y, z });
                 } else if (intensity <= 2.5) {
                   console.log('📱 [MOVEMENT] Movement too weak for basketball analysis (intensity:', intensity.toFixed(3), ')');
                 }
          
          lastAnalysisRef.current = timestamp;
          movementBufferRef.current = []; // Clear buffer
          console.log('📱 [MOVEMENT] Movement buffer cleared, next analysis in', analysisThrottleMs, 'ms');
        }
      });
      console.log('📱 [MOVEMENT] Accelerometer listener added successfully');
    } else {
      console.log('📱 [MOVEMENT] Stopping analysis - immediate cleanup');
      // Immediate cleanup for responsive stop
      setMovement('idle');
      setMovementIntensity(0);
      setFitnessMove('none');
      setLastSpokenTip('');
      console.log('📱 [MOVEMENT] Basic state reset complete');
      
      // Batch state updates to reduce re-renders
      setTimeout(() => {
        console.log('📱 [MOVEMENT] Batched cleanup - clearing history and buffers');
        setMovementHistory([]);
        movementBufferRef.current = [];
        initialDelayRef.current = true; // Reset initial delay for next session
        console.log('📱 [MOVEMENT] Full cleanup complete, ready for next session');
      }, 0);
    }
    return () => {
      if (subscription) {
        console.log('📱 [MOVEMENT] Removing accelerometer subscription');
        subscription.remove();
      }
    };
  }, [isAnalyzing]);
}

// Simplified pose detection hook (without MediaPipe dependency)
export function usePoseDetection(isAnalyzing, cameraRef) {
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const [poseData, setPoseData] = useState(null);

  // Initialize simplified pose detection
  useEffect(() => {
    console.log('🎯 [POSE] Pose detection effect triggered - isAnalyzing:', isAnalyzing);
    
    const initializeDetector = async () => {
      console.log('🎯 [POSE] Starting simplified pose detection...');
      try {
        console.log('🎯 [POSE] Waiting for TensorFlow to be ready...');
        await tf.ready();
        console.log('🎯 [POSE] TensorFlow ready, setting up simplified detection...');
        
        // For now, we'll use a simplified approach that doesn't require MediaPipe
        setIsDetectorReady(true);
        console.log('🎯 [POSE] Simplified pose detection ready');
      } catch (error) {
        console.error('🎯 [POSE] Failed to initialize pose detection:', error);
        // Set as ready even if failed to avoid blocking the app
        setIsDetectorReady(true);
        console.log('🎯 [POSE] Set detector as ready despite error to avoid blocking');
      }
    };

    // Only initialize when analysis starts to reduce startup delay
    if (isAnalyzing) {
      console.log('🎯 [POSE] Analysis started, initializing detector...');
      initializeDetector();
    } else {
      console.log('🎯 [POSE] Analysis not active, skipping detector initialization');
    }
  }, [isAnalyzing]);

  // Optimized pose detection with adaptive frequency
  useEffect(() => {
    console.log('🎯 [POSE] Simplified pose detection loop triggered - isAnalyzing:', isAnalyzing, 'isDetectorReady:', isDetectorReady);
    
    let intervalId;
    let lastPoseTime = 0;
    let consecutiveFailures = 0;
    const maxFailures = 3;
    
    // Immediate cleanup when stopping analysis
    if (!isAnalyzing) {
      console.log('🎯 [POSE] Analysis stopped, clearing pose data');
      setPoseData(null);
      return;
    }
    
    if (isAnalyzing && isDetectorReady) {
      console.log('🎯 [POSE] Starting pose detection loop...');
      
      const runSimplifiedPoseDetection = async () => {
        try {
          const now = Date.now();
          
          // Run every 3 seconds for simplified analysis
          if (now - lastPoseTime < 3000) {
            console.log('🎯 [POSE] Skipping pose detection - too soon');
            return;
          }
          
          console.log('🎯 [POSE] Running simplified pose analysis...');
          
          // Create realistic pose data that simulates actual arm movement during shooting
          const mockPoseData = generateRealisticPoseData(now);
          
          console.log('🎯 [POSE] Mock pose data created with', mockPoseData.summary.highConfidenceKeypoints, 'keypoints');
          setPoseData(mockPoseData);
          
          lastPoseTime = now;
        } catch (error) {
          console.error('🎯 [POSE] Simplified pose detection error:', error);
        }
      };
      
      // Start with immediate detection, then use intervals
      runSimplifiedPoseDetection();
      intervalId = setInterval(runSimplifiedPoseDetection, 3000); // Every 3 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [isAnalyzing, isDetectorReady]);

  return { poseData, isDetectorReady };
}

// Generate realistic pose data that simulates actual arm movement during shooting
function generateRealisticPoseData(timestamp) {
  const time = timestamp / 1000;
  
  // Simulate shooting motion phases
  const shootingCycle = (time % 4) / 4; // 4-second shooting cycle
  let shootingPhase = 0;
  let armAngle = 90; // Default arm angle (degrees)
  let elbowAngle = 90; // Default elbow angle (degrees)
  
  if (shootingCycle < 0.1) {
    // Setup phase - arm bent, ready to shoot
    shootingPhase = 0;
    armAngle = 45;
    elbowAngle = 90;
  } else if (shootingCycle < 0.3) {
    // Preparation phase - arm starts to extend
    shootingPhase = 0.3;
    armAngle = 60;
    elbowAngle = 120;
  } else if (shootingCycle < 0.6) {
    // Release phase - arm extends upward
    shootingPhase = 0.6;
    armAngle = 75;
    elbowAngle = 150;
  } else if (shootingCycle < 0.8) {
    // Follow-through phase - arm fully extended
    shootingPhase = 0.8;
    armAngle = 85;
    elbowAngle = 170;
  } else {
    // Recovery phase - arm returns to ready position
    shootingPhase = 1.0;
    armAngle = 50;
    elbowAngle = 100;
  }
  
  // Generate keypoints with realistic arm movement
  const keypoints = [
    { name: 'nose', x: 0.5, y: 0.2, confidence: 0.9 },
    { name: 'left_eye', x: 0.48, y: 0.18, confidence: 0.9 },
    { name: 'right_eye', x: 0.52, y: 0.18, confidence: 0.9 },
    { name: 'left_shoulder', x: 0.4, y: 0.35, confidence: 0.8 },
    { name: 'right_shoulder', x: 0.6, y: 0.35, confidence: 0.8 },
    { name: 'left_elbow', x: 0.35, y: 0.5, confidence: 0.7 },
    { name: 'right_elbow', x: 0.65, y: 0.5, confidence: 0.7 },
    { name: 'left_wrist', x: 0.3, y: 0.65, confidence: 0.6 },
    { name: 'right_wrist', x: 0.7, y: 0.65, confidence: 0.6 },
    { name: 'left_hip', x: 0.45, y: 0.6, confidence: 0.8 },
    { name: 'right_hip', x: 0.55, y: 0.6, confidence: 0.8 },
    { name: 'left_knee', x: 0.45, y: 0.8, confidence: 0.7 },
    { name: 'right_knee', x: 0.55, y: 0.8, confidence: 0.7 },
    { name: 'left_ankle', x: 0.45, y: 0.95, confidence: 0.6 },
    { name: 'right_ankle', x: 0.55, y: 0.95, confidence: 0.6 }
  ];
  
  // Update right arm positions based on shooting phase
  if (shootingPhase > 0.2) {
    // Right elbow moves up during shooting
    keypoints[6].y = 0.35 - (shootingPhase * 0.15); // Right elbow
    keypoints[6].confidence = 0.8;
    
    // Right wrist follows elbow
    keypoints[8].y = 0.5 - (shootingPhase * 0.25); // Right wrist
    keypoints[8].confidence = 0.7;
  }
  
  return {
    keypoints,
    timestamp,
    shootingPhase,
    armAngle,
    elbowAngle,
    summary: {
      highConfidenceKeypoints: keypoints.filter(kp => kp.confidence > 0.5).length,
      totalKeypoints: keypoints.length,
      shootingPhase: shootingPhase,
      armAngle: armAngle,
      elbowAngle: elbowAngle
    }
  };
}

// Convert base64 JPEG to a Tensor3D using tf.decodeJpeg (React Native)
async function createImageTensorFromBase64(base64) {
  try {
    // Fast path: use atob if available
    let byteArray;
    if (typeof atob === 'function') {
      const binary = atob(base64);
      byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }
    } else if (typeof Buffer !== 'undefined') {
      // Fallback: Buffer if polyfilled
      byteArray = Uint8Array.from(Buffer.from(base64, 'base64'));
    } else {
      // Last resort: fetch the data URI and read as array buffer
      const res = await fetch(`data:image/jpeg;base64,${base64}`);
      const buf = await res.arrayBuffer();
      byteArray = new Uint8Array(buf);
    }

    // Decode JPEG to Tensor3D [height, width, 3] using tfjs-react-native helper
    const imageTensor = decodeJpeg(byteArray, 3);
    return imageTensor;
  } catch (error) {
    console.error('Failed to create image tensor from base64:', error);
    return null;
  }
}

// Format pose keypoints for LLM input
export function formatPoseForLLM(poseData) {
  if (!poseData || !poseData.keypoints) {
    return null;
  }

  return {
    keypoints: poseData.keypoints,
    summary: poseData.summary
  };
}

// Export function to get current pose data for LLM
export function getCurrentPoseData(poseData) {
  return poseData;
}
