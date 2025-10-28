import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCameraMovementDetection, usePoseDetection, initializeTensorFlow } from '../core/video/videoInput';
import { detectFitnessMovement, getFitnessTip } from '../core/llm/llmArchitecture';
import { useAudioFeedback } from '../core/audio/audioOutput';
import { getBasketballShootingTip, detectBasketballMovement, BASKETBALL_MOVEMENTS, resetBasketballAggregation } from '../core/pose/basketballFormAnalyzer';
import { PoseOverlay, ShootingPhaseIndicator } from './components/PoseOverlay';
import VideoDemoScreen from './screens/VideoDemoScreen';
import styles from './styles/appStyles';

export default function App() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [movement, setMovement] = useState('idle');
  const [movementIntensity, setMovementIntensity] = useState(0);
  const [fitnessMove, setFitnessMove] = useState('none');
  const [lastSpokenTip, setLastSpokenTip] = useState('');
  const [currentTip, setCurrentTip] = useState('💪 Get ready to start your workout! Position yourself in front of the camera.');
  const [movementHistory, setMovementHistory] = useState([]);
  const [tensorFlowReady, setTensorFlowReady] = useState(false);
  const [basketballMovement, setBasketballMovement] = useState(BASKETBALL_MOVEMENTS.SHOOTING);
  const [techniqueScore, setTechniqueScore] = useState(0);
  const [cameraDimensions, setCameraDimensions] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('camera'); // 'camera' or 'video-demo'

  // Initialize TensorFlow on app start
  useEffect(() => {
    const initTF = async () => {
      const ready = await initializeTensorFlow();
      setTensorFlowReady(ready);
    };
    initTF();
  }, []); 

  // AI-powered movement detection function
  const detectMovement = detectFitnessMovement(movementHistory, fitnessMove, setFitnessMove);

  // Camera-based movement detection (instead of accelerometer)
  useCameraMovementDetection(
    isAnalyzing,
    setMovement,
    setMovementIntensity,
    setMovementHistory,
    setFitnessMove,
    setLastSpokenTip,
    detectMovement,
    cameraRef
  );

  // Pose detection using MoveNet
  const { poseData, isDetectorReady } = usePoseDetection(isAnalyzing, cameraRef);

  // Optimized tip updates with immediate feedback and smart debouncing
  const tipUpdateTimeoutRef = useRef(null);
  const lastTipRef = useRef('');
  
  useEffect(() => {
    console.log('💡 [TIPS] Tip effect triggered - isAnalyzing:', isAnalyzing, 'movement:', movement, 'fitnessMove:', fitnessMove, 'intensity:', movementIntensity);
    
    if (!isAnalyzing) {
      console.log('💡 [TIPS] Not analyzing - setting ready message');
      setCurrentTip('💪 Get ready to start your workout! Position yourself in front of the camera.');
      lastTipRef.current = '';
      return;
    }
    
    // Immediate workout feedback
    const immediateTips = {
      'idle': '💪 Get in position - feet shoulder-width apart!',
      'moving': '💪 Good movement! Keep your form steady.',
      'active': '💪 Strong motion! Focus on your technique.',
      'explosive': '💪 Powerful movement! Maintain that control.',
      'rhythmic': '💪 Perfect rhythm! Keep your form consistent.',
      'sustained': '💪 Strong hold! Keep your core engaged.',
      'controlled': '💪 Precise control! Focus on your positioning.'
    };
    
           // Show immediate feedback for any workout movement
           if (movementIntensity > 1.5 || movement !== 'idle') {
             const immediateTip = immediateTips[movement] || immediateTips[fitnessMove] || '💪 Keep up the great work!';
             console.log('💡 [TIPS] Immediate tip selected:', immediateTip);
             
             if (immediateTip !== lastTipRef.current) {
               console.log('💡 [TIPS] Setting immediate tip:', immediateTip);
               setCurrentTip(immediateTip);
               lastTipRef.current = immediateTip;
             } else {
               console.log('💡 [TIPS] Immediate tip unchanged, skipping update');
             }
           } else {
             console.log('💡 [TIPS] Movement too low for immediate feedback (intensity:', movementIntensity, ')');
           }
    
    // Then get AI-enhanced tip after a longer delay (only for significant movements)
    if (tipUpdateTimeoutRef.current) {
      console.log('💡 [TIPS] Clearing existing AI tip timeout');
      clearTimeout(tipUpdateTimeoutRef.current);
    }
    
           // Only call LLM for significant movements and after longer delay
           if (movementIntensity > 2.0 || fitnessMove !== 'none') {
             console.log('💡 [TIPS] Scheduling AI tip generation in 2 seconds (intensity:', movementIntensity, 'fitnessMove:', fitnessMove, ')');
      tipUpdateTimeoutRef.current = setTimeout(async () => {
        console.log('🤖 [AI] Starting AI tip generation...');
        try {
          // Use workout-specific analysis with pose detection
          let aiTip;
          console.log('🏀 [WORKOUT] Using workout-specific analysis (pose keypoints:', poseData?.summary?.highConfidenceKeypoints || 0, ')');
          const basketballResult = await getBasketballShootingTip(poseData, movementIntensity, movementHistory, basketballMovement);
          aiTip = basketballResult.tip;
          setTechniqueScore(basketballResult.formScore);
          
          // Update detected movement type
          const detectedMovement = detectBasketballMovement(movementIntensity, movementHistory, poseData);
          if (detectedMovement !== basketballMovement) {
            console.log('🏀 [WORKOUT] Movement type changed:', basketballMovement, '->', detectedMovement);
            setBasketballMovement(detectedMovement);
          }
          
          console.log('🤖 [AI] AI tip received:', aiTip);
          if (aiTip && aiTip !== immediateTip) {
            console.log('🤖 [AI] Setting AI tip:', aiTip);
            setCurrentTip(aiTip);
            lastTipRef.current = aiTip;
          } else {
            console.log('🤖 [AI] AI tip same as immediate tip, keeping current');
          }
        } catch (error) {
          console.log('🤖 [AI] AI tip generation error:', error);
          // Keep the immediate tip, don't change it
        }
      }, 2000); // 2 second delay for AI tips
    } else {
      console.log('💡 [TIPS] Movement not significant enough for AI tips (intensity:', movementIntensity, 'fitnessMove:', fitnessMove, ')');
    }
    
    return () => {
      if (tipUpdateTimeoutRef.current) {
        console.log('💡 [TIPS] Cleanup: clearing tip timeout');
        clearTimeout(tipUpdateTimeoutRef.current);
      }
    };
  }, [isAnalyzing, fitnessMove, movement, movementIntensity]);

  // Audio feedback
  useAudioFeedback(
    isAnalyzing,
    movement,
    fitnessMove,
    lastSpokenTip,
    setLastSpokenTip,
    async () => {
      console.log('🎧 [AUDIO] Audio feedback function called - isAnalyzing:', isAnalyzing);
      // Use workout-specific tips for audio feedback
      if (isAnalyzing) {
        try {
          console.log('🎧 [AUDIO] Getting workout-specific tip for audio feedback...');
                 const basketballResult = await getBasketballShootingTip(poseData, movementIntensity, movementHistory, basketballMovement);
                 console.log('🎧 [AUDIO] Workout technique tip received:', basketballResult.tip);
                 return basketballResult.tip;
        } catch (error) {
          console.log('🎧 [AUDIO] Workout tip error, using fallback:', error);
          return getFitnessTip(fitnessMove, movement, poseData);
        }
      }
      console.log('🎧 [AUDIO] Not analyzing, using fitness tip');
      return getFitnessTip(fitnessMove, movement, poseData);
    }
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💪 Reform</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💪 Reform</Text>
        <Text style={styles.subtitle}>Camera permission needed</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getMovementColor = () => {
    switch (movement) {
      case 'active': return '#22c55e';
      case 'moving': return '#f59e0b';
      case 'idle': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getFitnessMoveColor = () => {
    switch (fitnessMove) {
      case 'explosive': return '#ef4444';
      case 'rhythmic': return '#8b5cf6';
      case 'sustained': return '#06b6d4';
      case 'controlled': return '#f97316';
      default: return '#6b7280';
    }
  };

  const handleStartAnalysis = () => {
    console.log('🚀 [START] User clicked Start Analysis button');
    console.log('🚀 [START] Resetting basketball aggregation data');
    resetBasketballAggregation();
    console.log('🚀 [START] Setting isAnalyzing to true');
    setIsAnalyzing(true);
    console.log('🚀 [START] Analysis started successfully');
  };

  const handleStopAnalysis = () => {
    console.log('🛑 [STOP] User clicked Stop Analysis button');
    
    // Clear any pending tip updates
    if (tipUpdateTimeoutRef.current) {
      console.log('🛑 [STOP] Clearing pending tip timeout');
      clearTimeout(tipUpdateTimeoutRef.current);
      tipUpdateTimeoutRef.current = null;
    } else {
      console.log('🛑 [STOP] No pending tip timeout to clear');
    }
    
    // Immediate UI feedback
    console.log('🛑 [STOP] Setting immediate stop message');
    setCurrentTip('Analysis stopped. Great workout!');
    
    // Stop analysis with minimal delay
    console.log('🛑 [STOP] Setting isAnalyzing to false');
    setIsAnalyzing(false);
    console.log('🛑 [STOP] Analysis stopped successfully');
  };

  // Handle camera layout to get dimensions
  const handleCameraLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCameraDimensions({ width, height });
    console.log('📱 [CAMERA] Camera dimensions set:', { width, height });
  };

  // Screen switching
  if (currentScreen === 'video-demo') {
    return <VideoDemoScreen onBack={() => setCurrentScreen('camera')} />;
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing}
        onLayout={handleCameraLayout}
      />
      
      {/* Pose Detection Overlay */}
      {isAnalyzing && poseData && cameraDimensions && (
        <>
          <PoseOverlay 
            poseData={poseData} 
            cameraDimensions={cameraDimensions} 
          />
          <ShootingPhaseIndicator poseData={poseData} />
        </>
      )}
      
      <View style={styles.overlay}>
        <Text style={styles.title}>💪 Reform</Text>
        <Text style={styles.subtitle}>
          {!tensorFlowReady ? 'Initializing TensorFlow...' : 
           isAnalyzing ? 'Analyzing...' : 'Ready to analyze'}
        </Text>
        {isAnalyzing && (
          <View style={styles.movementInfo}>
            <View style={styles.movementRow}>
              <View style={[styles.movementDot, { backgroundColor: getMovementColor() }]} />
              <Text style={[styles.movementText, { color: getMovementColor() }]}> {movement.toUpperCase()} </Text>
            </View>
            {fitnessMove !== 'none' && (
              <View style={styles.fitnessMoveRow}>
                <View style={[styles.fitnessMoveDot, { backgroundColor: getFitnessMoveColor() }]} />
                <Text style={[styles.fitnessMoveText, { color: getFitnessMoveColor() }]}> {fitnessMove.toUpperCase()} </Text>
              </View>
            )}
            <Text style={styles.intensityText}> Intensity: {movementIntensity.toFixed(2)} </Text>
            <View style={styles.basketballInfo}>
              <Text style={styles.basketballText}>
                🏀 {basketballMovement.replace('_', ' ').toUpperCase()}
              </Text>
              {techniqueScore > 0 && (
                <Text style={styles.formScoreText}>
                  Technique Score: {techniqueScore}/100
                </Text>
              )}
            </View>
            {isDetectorReady && (
              <Text style={styles.poseStatus}>🤖 Pose detection active</Text>
            )}
            <Text style={styles.tipText}>{currentTip}</Text>
            <Text style={styles.audioStatus}>🎧 Audio feedback active</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, isAnalyzing && styles.stopButton, !tensorFlowReady && styles.disabledButton]} 
            onPress={isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
            disabled={!tensorFlowReady}
          >
            <Text style={styles.buttonText}>
              {!tensorFlowReady ? 'Initializing...' : 
               isAnalyzing ? 'Stop' : 'Start Analysis'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Text style={styles.switchText}>Switch Camera</Text>
          </TouchableOpacity>
        </View>
        
        {/* Video Demo Button */}
        <TouchableOpacity 
          style={styles.videoDemoButton} 
          onPress={() => setCurrentScreen('video-demo')}
        >
          <Text style={styles.videoDemoButtonText}>🎬 Video Demo</Text>
        </TouchableOpacity>
        
        <Text style={styles.status}>
          Status: {isAnalyzing ? 'Analyzing' : 'Ready'}
        </Text>
      </View>
    </View>
  );
}
