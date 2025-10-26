// Real LLM-powered movement detection
import { analyzeMovementWithLLM } from './openaiClient';

export function detectFitnessMovement(movementHistory, fitnessMove, setFitnessMove) {
  return async (intensity, { x, y, z }, poseData = null) => {
    console.log('🧠 [LLM] detectFitnessMovement called - intensity:', intensity.toFixed(3), 'history length:', movementHistory.length);
    
    if (movementHistory.length < 5) {
      console.log('🧠 [LLM] Not enough movement history, skipping analysis');
      return;
    }
    
    console.log('🧠 [LLM] Calling analyzeMovementWithLLM...');
    try {
      // Use real LLM to analyze movement pattern
      const movementType = await analyzeMovementWithLLM(intensity, { x, y, z }, poseData, movementHistory);
      console.log('🧠 [LLM] Movement analysis result:', movementType);
      setFitnessMove(movementType);
    } catch (error) {
      console.log('🧠 [LLM] Movement analysis error:', error);
    }
  };
}

// Real LLM-powered fitness tip generation
import { generateLLMTip, analyzePoseWithLLM } from './openaiClient';

export async function getFitnessTip(fitnessMove, movement, poseData = null) {
  console.log('🧠 [LLM] getFitnessTip called - fitnessMove:', fitnessMove, 'movement:', movement, 'poseData:', !!poseData);
  
  try {
    // Use real LLM to generate contextual feedback
    if (poseData && poseData.keypoints && poseData.summary?.highConfidenceKeypoints > 8) {
      console.log('🧠 [LLM] Using pose-based analysis (keypoints:', poseData.summary?.highConfidenceKeypoints, ')');
      // Use LLM for pose-based analysis when we have good pose data
      const tip = await analyzePoseWithLLM(poseData);
      console.log('🧠 [LLM] Pose-based tip received:', tip);
      return tip;
    } else {
      console.log('🧠 [LLM] Using movement-based analysis');
      // Use LLM for movement-based tips
      const tip = await generateLLMTip(fitnessMove, movement, poseData);
      console.log('🧠 [LLM] Movement-based tip received:', tip);
      return tip;
    }
  } catch (error) {
    console.log('🧠 [LLM] LLM tip generation error:', error);
    // Fallback to smart static tips
    const fallbackTip = getSmartFallbackTip(fitnessMove, movement, poseData);
    console.log('🧠 [LLM] Using fallback tip:', fallbackTip);
    return fallbackTip;
  }
}

// Smart fallback when LLM fails
function getSmartFallbackTip(fitnessMove, movement, poseData) {
  if (poseData && poseData.keypoints) {
    return getPoseBasedTip(poseData);
  }
  
  const fallbackTips = {
    explosive: ['Powerful movement! Focus on controlled landing.', 'Great explosive energy! Maintain control.'],
    rhythmic: ['Perfect rhythm! Keep this tempo.', 'Excellent cadence! Maintain this flow.'],
    sustained: ['Strong hold! Keep your form tight.', 'Excellent endurance! Maintain alignment.'],
    controlled: ['Precise control! Move with intention.', 'Excellent form! Keep movements deliberate.'],
    active: ['Great intensity! Keep your core engaged.', 'Excellent power! Control your movements.'],
    moving: ['Good tempo! Keep movements smooth.', 'Nice pace! Focus on proper form.'],
    idle: ['Get ready! Position yourself properly.', 'Set your foundation! Core engaged.']
  };
  
  const tips = fallbackTips[fitnessMove] || fallbackTips[movement] || fallbackTips.idle;
  return tips[Math.floor(Math.random() * tips.length)];
}

// Enhanced pose-based feedback with AI-like analysis
export function getPoseBasedTip(poseData) {
  const { keypoints, summary } = poseData;
  
  // Check pose quality
  if (summary.highConfidenceKeypoints < 8) {
    return 'Adjust your position for better pose detection. Ensure good lighting and full body visibility.';
  }

  // AI-enhanced pose analysis
  const alignment = calculatePoseAlignment(poseData);
  
  // Prioritize feedback based on severity
  if (alignment.shoulder > 25) {
    return 'Focus on shoulder alignment - keep both shoulders at the same height for better stability.';
  }
  if (alignment.hip > 20) {
    return 'Maintain level hips - this will improve your balance and reduce injury risk.';
  }
  if (alignment.knee > 35) {
    return 'Keep your knees aligned and pointing forward for proper form and safety.';
  }
  if (alignment.ankle > 30) {
    return 'Check your foot positioning - ensure both feet are properly aligned.';
  }
  
  // Positive reinforcement for good form
  if (summary.highConfidenceKeypoints > 12) {
    return 'Excellent form! Your body alignment looks great - keep it up!';
  }
  
  return 'Good posture! Continue focusing on maintaining proper alignment throughout your movement.';
}

// Calculate comprehensive pose alignment metrics
function calculatePoseAlignment(poseData) {
  const { keypoints } = poseData;
  
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');
  const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
  const rightKnee = keypoints.find(kp => kp.name === 'right_knee');
  const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
  const rightAnkle = keypoints.find(kp => kp.name === 'right_ankle');

  return {
    shoulder: calculateAlignment(leftShoulder, rightShoulder),
    hip: calculateAlignment(leftHip, rightHip),
    knee: calculateAlignment(leftKnee, rightKnee),
    ankle: calculateAlignment(leftAnkle, rightAnkle)
  };
}

// Helper function to calculate alignment between two keypoints
function calculateAlignment(left, right) {
  if (!left || !right || left.score < 0.5 || right.score < 0.5) {
    return 0;
  }
  return Math.abs(left.y - right.y);
}

// AI-enhanced pose data processing for advanced analysis
export function processPoseForLLM(poseData) {
  if (!poseData || !poseData.keypoints) {
    return null;
  }

  // Create comprehensive AI input structure
  const aiInput = {
    timestamp: poseData.timestamp,
    keypoints: poseData.keypoints,
    features: {
      // Body part positions with confidence scores
      head: getKeypointByName(poseData.keypoints, 'nose'),
      shoulders: [
        getKeypointByName(poseData.keypoints, 'left_shoulder'),
        getKeypointByName(poseData.keypoints, 'right_shoulder')
      ],
      hips: [
        getKeypointByName(poseData.keypoints, 'left_hip'),
        getKeypointByName(poseData.keypoints, 'right_hip')
      ],
      knees: [
        getKeypointByName(poseData.keypoints, 'left_knee'),
        getKeypointByName(poseData.keypoints, 'right_knee')
      ],
      ankles: [
        getKeypointByName(poseData.keypoints, 'left_ankle'),
        getKeypointByName(poseData.keypoints, 'right_ankle')
      ]
    },
    // AI-derived metrics for intelligent analysis
    metrics: {
      shoulderAlignment: calculateAlignmentByNames(poseData.keypoints, 'left_shoulder', 'right_shoulder'),
      hipAlignment: calculateAlignmentByNames(poseData.keypoints, 'left_hip', 'right_hip'),
      kneeAlignment: calculateAlignmentByNames(poseData.keypoints, 'left_knee', 'right_knee'),
      ankleAlignment: calculateAlignmentByNames(poseData.keypoints, 'left_ankle', 'right_ankle'),
      overallStability: calculateStability(poseData.keypoints),
      poseQuality: calculatePoseQuality(poseData),
      bodySymmetry: calculateBodySymmetry(poseData.keypoints)
    }
  };

  return aiInput;
}

// Helper functions for AI analysis
function getKeypointByName(keypoints, name) {
  return keypoints.find(kp => kp.name === name) || null;
}

function calculateAlignmentByNames(keypoints, leftName, rightName) {
  const left = getKeypointByName(keypoints, leftName);
  const right = getKeypointByName(keypoints, rightName);
  
  if (!left || !right || left.score < 0.5 || right.score < 0.5) {
    return null;
  }
  
  return Math.abs(left.y - right.y);
}

function calculateStability(keypoints) {
  const highConfidenceKeypoints = keypoints.filter(kp => kp.score > 0.5);
  return highConfidenceKeypoints.length / keypoints.length;
}

function calculatePoseQuality(poseData) {
  const { keypoints, summary } = poseData;
  const highConfidenceCount = summary?.highConfidenceKeypoints || 0;
  const totalKeypoints = keypoints?.length || 0;
  
  return {
    confidence: highConfidenceCount / totalKeypoints,
    completeness: highConfidenceCount,
    reliability: highConfidenceCount > 10 ? 'high' : highConfidenceCount > 6 ? 'medium' : 'low'
  };
}

function calculateBodySymmetry(keypoints) {
  const leftSide = ['left_shoulder', 'left_hip', 'left_knee', 'left_ankle'];
  const rightSide = ['right_shoulder', 'right_hip', 'right_knee', 'right_ankle'];
  
  let symmetryScore = 0;
  let validPairs = 0;
  
  leftSide.forEach((leftName, index) => {
    const rightName = rightSide[index];
    const left = getKeypointByName(keypoints, leftName);
    const right = getKeypointByName(keypoints, rightName);
    
    if (left && right && left.score > 0.5 && right.score > 0.5) {
      const alignment = Math.abs(left.y - right.y);
      symmetryScore += Math.max(0, 1 - alignment / 50); // Normalize to 0-1
      validPairs++;
    }
  });
  
  return validPairs > 0 ? symmetryScore / validPairs : 0;
}
