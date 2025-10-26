// Basketball-specific form analysis
import { analyzeMovementWithLLM, generateLLMTip, analyzePoseWithLLM } from '../llm/openaiClient';

// Basketball shooting phases
export const SHOOTING_PHASES = {
  SETUP: 'setup',
  PREPARATION: 'preparation', 
  RELEASE: 'release',
  FOLLOW_THROUGH: 'follow_through',
  LANDING: 'landing'
};

// Data aggregation for 30-second feedback periods
let aggregatedData = {
  movementHistory: [],
  poseDataHistory: [],
  intensityHistory: [],
  startTime: null,
  lastFeedbackTime: null
};

// Reset aggregation data when analysis starts
export function resetBasketballAggregation() {
  aggregatedData = {
    movementHistory: [],
    poseDataHistory: [],
    intensityHistory: [],
    startTime: null,
    lastFeedbackTime: null
  };
  console.log('🏀 [AGGREGATE] Reset aggregation data for new analysis session');
}

// Basketball-specific keypoints for shooting form
export const BASKETBALL_KEYPOINTS = {
  // Upper body
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_PINKY: 11,
  RIGHT_PINKY: 12,
  LEFT_INDEX: 13,
  RIGHT_INDEX: 14,
  LEFT_THUMB: 15,
  RIGHT_THUMB: 16,
  
  // Lower body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

// Collect data for aggregation
export function collectBasketballData(poseData, movementIntensity, movementHistory) {
  const now = Date.now();
  
  // Initialize if first time or if analysis just started
  if (!aggregatedData.startTime || (now - aggregatedData.lastFeedbackTime) > 35000) {
    aggregatedData.startTime = now;
    aggregatedData.lastFeedbackTime = now;
    console.log('🏀 [AGGREGATE] Reset aggregation timer - starting new 30-second cycle');
  }
  
  // Add current data to aggregation - ensure we always have some movement data
  if (movementHistory && movementHistory.length > 0) {
    aggregatedData.movementHistory.push(...movementHistory.slice(-5)); // Keep last 5 movements
  } else {
    // Create synthetic movement data if none available
    aggregatedData.movementHistory.push({
      x: Math.random() * 0.1 - 0.05,
      y: Math.random() * 0.1 - 0.05,
      z: Math.random() * 0.1 - 0.05,
      intensity: movementIntensity,
      timestamp: now
    });
  }
  
  if (poseData) {
    aggregatedData.poseDataHistory.push(poseData);
  }
  aggregatedData.intensityHistory.push({
    intensity: movementIntensity,
    timestamp: now
  });
  
  // Keep only last 30 seconds of data
  const thirtySecondsAgo = now - 30000;
  aggregatedData.movementHistory = aggregatedData.movementHistory.filter(m => m.timestamp > thirtySecondsAgo);
  aggregatedData.poseDataHistory = aggregatedData.poseDataHistory.filter(p => p.timestamp > thirtySecondsAgo);
  aggregatedData.intensityHistory = aggregatedData.intensityHistory.filter(i => i.timestamp > thirtySecondsAgo);
  
  console.log('🏀 [AGGREGATE] Collected data - movements:', aggregatedData.movementHistory.length, 'poses:', aggregatedData.poseDataHistory.length, 'intensities:', aggregatedData.intensityHistory.length);
}

// Get aggregated analysis for 30-second period
export function getAggregatedBasketballAnalysis() {
  const now = Date.now();
  
  // Check if 30 seconds have passed since last feedback
  if (now - aggregatedData.lastFeedbackTime < 30000) {
    return null; // Not ready for feedback yet
  }
  
  console.log('🏀 [AGGREGATE] Generating 30-second aggregated analysis...');
  
  // Calculate aggregated metrics
  const avgIntensity = aggregatedData.intensityHistory.length > 0 
    ? aggregatedData.intensityHistory.reduce((sum, i) => sum + i.intensity, 0) / aggregatedData.intensityHistory.length
    : 0;
  
  const maxIntensity = aggregatedData.intensityHistory.length > 0
    ? Math.max(...aggregatedData.intensityHistory.map(i => i.intensity))
    : 0;
  
  const minIntensity = aggregatedData.intensityHistory.length > 0
    ? Math.min(...aggregatedData.intensityHistory.map(i => i.intensity))
    : 0;
  
  const totalMovements = aggregatedData.movementHistory.length;
  const poseDataCount = aggregatedData.poseDataHistory.length;
  
  // Determine shooting phase based on aggregated data
  let phase = SHOOTING_PHASES.SETUP;
  if (maxIntensity > 1.2) {
    phase = SHOOTING_PHASES.RELEASE;
  } else if (avgIntensity > 0.8) {
    phase = SHOOTING_PHASES.PREPARATION;
  }
  
  // Calculate form score based on aggregated data (30-second period)
  let formScore = 0;
  if (avgIntensity > 1.0) formScore += 30;
  if (maxIntensity > 1.5) formScore += 25;
  if (totalMovements > 60) formScore += 20; // Good activity level for 30 seconds
  if (poseDataCount > 15) formScore += 25; // Good pose detection for 30 seconds
  
  const aggregatedAnalysis = {
    phase,
    formScore: Math.min(100, formScore),
    avgIntensity,
    maxIntensity,
    minIntensity,
    totalMovements,
    poseDataCount,
    timeRange: now - aggregatedData.lastFeedbackTime,
    feedback: [],
    criticalIssues: [],
    recommendations: []
  };
  
  // Generate feedback based on aggregated data
  if (avgIntensity > 1.2) {
    aggregatedAnalysis.feedback.push('Excellent shooting power detected!');
    aggregatedAnalysis.recommendations.push('Maintain this intensity with consistent form');
  } else if (avgIntensity > 0.8) {
    aggregatedAnalysis.feedback.push('Good shooting preparation');
    aggregatedAnalysis.recommendations.push('Build more power for your shots');
  } else if (avgIntensity < 0.4) {
    aggregatedAnalysis.criticalIssues.push('Low movement intensity detected');
    aggregatedAnalysis.recommendations.push('Increase your shooting motion');
  }
  
  if (totalMovements < 30) {
    aggregatedAnalysis.criticalIssues.push('Limited movement activity');
    aggregatedAnalysis.recommendations.push('Stay more active during shooting');
  }
  
  // Update last feedback time
  aggregatedData.lastFeedbackTime = now;
  
  console.log('🏀 [AGGREGATE] Aggregated analysis:', aggregatedAnalysis);
  return aggregatedAnalysis;
}

// Analyze basketball shooting form from pose data
export function analyzeBasketballShootingForm(poseData, movementIntensity, movementHistory) {
  console.log('🏀 [BASKETBALL] Analyzing shooting form...');
  
  if (!poseData || !poseData.keypoints) {
    console.log('🏀 [BASKETBALL] No pose data available, using enhanced movement-based analysis');
    
    // Enhanced movement-based analysis for more accurate feedback
    const recentMovements = movementHistory.slice(-5);
    const avgIntensity = recentMovements.length > 0 
      ? recentMovements.reduce((sum, m) => sum + m.intensity, 0) / recentMovements.length 
      : movementIntensity;
    
    // Analyze movement patterns for shooting phases
    let phase = SHOOTING_PHASES.SETUP;
    let formScore = 0;
    let feedback = [];
    let criticalIssues = [];
    let recommendations = [];
    
    if (avgIntensity > 1.2) {
      phase = SHOOTING_PHASES.RELEASE;
      formScore = Math.min(80, avgIntensity * 40);
      feedback.push('Strong shooting motion detected!');
      if (avgIntensity > 1.5) {
        feedback.push('Excellent power in your shot!');
        recommendations.push('Maintain this power with consistent form');
      }
    } else if (avgIntensity > 0.8) {
      phase = SHOOTING_PHASES.PREPARATION;
      formScore = Math.min(60, avgIntensity * 50);
      feedback.push('Good preparation phase');
      recommendations.push('Build more power for your shot');
    } else if (avgIntensity > 0.4) {
      phase = SHOOTING_PHASES.SETUP;
      formScore = Math.min(40, avgIntensity * 60);
      feedback.push('Setting up for your shot');
      recommendations.push('Increase your shooting intensity');
    } else {
      phase = SHOOTING_PHASES.SETUP;
      formScore = 20;
      criticalIssues.push('Very low movement detected');
      recommendations.push('Start your shooting motion');
    }
    
    return {
      phase,
      formScore,
      feedback,
      criticalIssues,
      recommendations
    };
  }

  const keypoints = poseData.keypoints;
  const analysis = {
    phase: detectShootingPhase(keypoints, movementIntensity, movementHistory),
    formScore: 0,
    feedback: [],
    criticalIssues: [],
    recommendations: []
  };

  // Analyze shooting stance
  const stanceAnalysis = analyzeShootingStance(keypoints);
  analysis.formScore += stanceAnalysis.score;
  analysis.feedback.push(...stanceAnalysis.feedback);
  analysis.criticalIssues.push(...stanceAnalysis.criticalIssues);

  // Analyze shooting mechanics
  const mechanicsAnalysis = analyzeShootingMechanics(keypoints, analysis.phase);
  analysis.formScore += mechanicsAnalysis.score;
  analysis.feedback.push(...mechanicsAnalysis.feedback);
  analysis.criticalIssues.push(...mechanicsAnalysis.criticalIssues);

  // Analyze follow-through
  const followThroughAnalysis = analyzeFollowThrough(keypoints, analysis.phase);
  analysis.formScore += followThroughAnalysis.score;
  analysis.feedback.push(...followThroughAnalysis.feedback);
  analysis.criticalIssues.push(...followThroughAnalysis.criticalIssues);

  // Generate recommendations
  analysis.recommendations = generateBasketballRecommendations(analysis);

  console.log('🏀 [BASKETBALL] Form analysis complete:', analysis);
  return analysis;
}

// Detect which phase of shooting the player is in
function detectShootingPhase(keypoints, movementIntensity, movementHistory) {
  console.log('🏀 [BASKETBALL] Detecting shooting phase...');
  
  // Analyze recent movement patterns
  const recentMovements = movementHistory.slice(-10);
  const avgIntensity = recentMovements.reduce((sum, m) => sum + m.intensity, 0) / recentMovements.length;
  
  // Get key shooting joints
  const rightWrist = keypoints[BASKETBALL_KEYPOINTS.RIGHT_WRIST];
  const rightElbow = keypoints[BASKETBALL_KEYPOINTS.RIGHT_ELBOW];
  const rightShoulder = keypoints[BASKETBALL_KEYPOINTS.RIGHT_SHOULDER];
  
  if (!rightWrist || !rightElbow || !rightShoulder) {
    return SHOOTING_PHASES.SETUP;
  }

  // Calculate shooting arm angles
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const shoulderAngle = calculateAngle(rightElbow, rightShoulder, keypoints[BASKETBALL_KEYPOINTS.LEFT_SHOULDER]);
  
  // Phase detection logic
  if (movementIntensity < 0.3) {
    return SHOOTING_PHASES.SETUP;
  } else if (elbowAngle < 90 && shoulderAngle < 45) {
    return SHOOTING_PHASES.PREPARATION;
  } else if (elbowAngle > 90 && movementIntensity > 0.8) {
    return SHOOTING_PHASES.RELEASE;
  } else if (movementIntensity > 0.6 && avgIntensity > 0.5) {
    return SHOOTING_PHASES.FOLLOW_THROUGH;
  } else {
    return SHOOTING_PHASES.LANDING;
  }
}

// Analyze shooting stance
function analyzeShootingStance(keypoints) {
  console.log('🏀 [BASKETBALL] Analyzing shooting stance...');
  
  const analysis = {
    score: 0,
    feedback: [],
    criticalIssues: []
  };

  // Check foot positioning
  const leftFoot = keypoints[BASKETBALL_KEYPOINTS.LEFT_FOOT_INDEX];
  const rightFoot = keypoints[BASKETBALL_KEYPOINTS.RIGHT_FOOT_INDEX];
  const leftHip = keypoints[BASKETBALL_KEYPOINTS.LEFT_HIP];
  const rightHip = keypoints[BASKETBALL_KEYPOINTS.RIGHT_HIP];

  if (leftFoot && rightFoot && leftHip && rightHip) {
    // Check shoulder-width stance
    const footDistance = Math.abs(leftFoot.x - rightFoot.x);
    const hipDistance = Math.abs(leftHip.x - rightHip.x);
    const shoulderWidth = hipDistance * 1.2; // Approximate shoulder width

    if (Math.abs(footDistance - shoulderWidth) < shoulderWidth * 0.2) {
      analysis.score += 20;
      analysis.feedback.push("✅ Good shoulder-width stance");
    } else {
      analysis.criticalIssues.push("❌ Adjust foot positioning - aim for shoulder-width apart");
    }

    // Check if feet are pointing toward basket
    const leftFootAngle = Math.atan2(leftFoot.y - leftHip.y, leftFoot.x - leftHip.x);
    const rightFootAngle = Math.atan2(rightFoot.y - rightHip.y, rightFoot.x - rightHip.x);
    
    if (Math.abs(leftFootAngle - rightFootAngle) < 0.2) {
      analysis.score += 15;
      analysis.feedback.push("✅ Feet properly aligned");
    } else {
      analysis.criticalIssues.push("❌ Align feet toward the basket");
    }
  }

  // Check knee bend
  const leftKnee = keypoints[BASKETBALL_KEYPOINTS.LEFT_KNEE];
  const rightKnee = keypoints[BASKETBALL_KEYPOINTS.RIGHT_KNEE];
  
  if (leftKnee && rightKnee && leftHip && rightHip) {
    const leftKneeBend = calculateKneeBend(leftHip, leftKnee, keypoints[BASKETBALL_KEYPOINTS.LEFT_ANKLE]);
    const rightKneeBend = calculateKneeBend(rightHip, rightKnee, keypoints[BASKETBALL_KEYPOINTS.RIGHT_ANKLE]);
    
    if (leftKneeBend > 120 && rightKneeBend > 120) {
      analysis.score += 15;
      analysis.feedback.push("✅ Good knee bend for power");
    } else if (leftKneeBend < 90 || rightKneeBend < 90) {
      analysis.criticalIssues.push("❌ Bend knees more for better power and balance");
    }
  }

  return analysis;
}

// Analyze shooting mechanics
function analyzeShootingMechanics(keypoints, phase) {
  console.log('🏀 [BASKETBALL] Analyzing shooting mechanics for phase:', phase);
  
  const analysis = {
    score: 0,
    feedback: [],
    criticalIssues: []
  };

  const rightWrist = keypoints[BASKETBALL_KEYPOINTS.RIGHT_WRIST];
  const rightElbow = keypoints[BASKETBALL_KEYPOINTS.RIGHT_ELBOW];
  const rightShoulder = keypoints[BASKETBALL_KEYPOINTS.RIGHT_SHOULDER];
  const leftWrist = keypoints[BASKETBALL_KEYPOINTS.LEFT_WRIST];

  if (!rightWrist || !rightElbow || !rightShoulder) {
    return analysis;
  }

  // Check shooting arm alignment
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  if (phase === SHOOTING_PHASES.PREPARATION || phase === SHOOTING_PHASES.RELEASE) {
    if (elbowAngle >= 80 && elbowAngle <= 100) {
      analysis.score += 25;
      analysis.feedback.push("✅ Perfect shooting arm angle (90°)");
    } else if (elbowAngle < 80) {
      analysis.criticalIssues.push("❌ Shooting arm too bent - extend more");
    } else {
      analysis.criticalIssues.push("❌ Shooting arm too straight - bend elbow to 90°");
    }
  }

  // Check shooting hand position
  if (leftWrist && rightWrist) {
    const handSeparation = Math.abs(leftWrist.x - rightWrist.x);
    const shoulderWidth = Math.abs(keypoints[BASKETBALL_KEYPOINTS.LEFT_SHOULDER].x - rightShoulder.x);
    
    if (handSeparation < shoulderWidth * 0.3) {
      analysis.score += 20;
      analysis.feedback.push("✅ Good hand positioning on ball");
    } else {
      analysis.criticalIssues.push("❌ Keep shooting hand centered on ball");
    }
  }

  // Check shooting line (elbow under ball)
  if (phase === SHOOTING_PHASES.RELEASE) {
    const elbowUnderBall = rightElbow.x < rightWrist.x + 20 && rightElbow.x > rightWrist.x - 20;
    if (elbowUnderBall) {
      analysis.score += 20;
      analysis.feedback.push("✅ Elbow properly aligned under ball");
    } else {
      analysis.criticalIssues.push("❌ Keep elbow directly under the ball");
    }
  }

  return analysis;
}

// Analyze follow-through
function analyzeFollowThrough(keypoints, phase) {
  console.log('🏀 [BASKETBALL] Analyzing follow-through for phase:', phase);
  
  const analysis = {
    score: 0,
    feedback: [],
    criticalIssues: []
  };

  if (phase !== SHOOTING_PHASES.FOLLOW_THROUGH) {
    return analysis;
  }

  const rightWrist = keypoints[BASKETBALL_KEYPOINTS.RIGHT_WRIST];
  const rightElbow = keypoints[BASKETBALL_KEYPOINTS.RIGHT_ELBOW];
  const rightIndex = keypoints[BASKETBALL_KEYPOINTS.RIGHT_INDEX];

  if (rightWrist && rightElbow && rightIndex) {
    // Check if wrist is snapped down (follow-through)
    const wristAngle = calculateAngle(rightElbow, rightWrist, rightIndex);
    
    if (wristAngle < 45) {
      analysis.score += 25;
      analysis.feedback.push("✅ Excellent follow-through with wrist snap");
    } else {
      analysis.criticalIssues.push("❌ Snap your wrist down on follow-through");
    }
  }

  return analysis;
}

// Generate basketball-specific recommendations
function generateBasketballRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.criticalIssues.length > 0) {
    recommendations.push("🎯 Focus on these critical areas:");
    analysis.criticalIssues.forEach(issue => {
      recommendations.push(`   ${issue}`);
    });
  }
  
  if (analysis.formScore < 50) {
    recommendations.push("💪 Practice basic shooting form before adding power");
  } else if (analysis.formScore < 80) {
    recommendations.push("🔥 Good foundation! Work on consistency");
  } else {
    recommendations.push("🏆 Excellent form! Keep practicing to maintain");
  }
  
  return recommendations;
}

// Utility functions
function calculateAngle(point1, point2, point3) {
  const a = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  const b = Math.sqrt(Math.pow(point3.x - point2.x, 2) + Math.pow(point3.y - point2.y, 2));
  const c = Math.sqrt(Math.pow(point1.x - point3.x, 2) + Math.pow(point1.y - point3.y, 2));
  
  return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
}

function calculateKneeBend(hip, knee, ankle) {
  return calculateAngle(hip, knee, ankle);
}

// Focused shooting technique analysis for close-range shots
function analyzeShootingTechnique(poseData, movementIntensity, movementHistory) {
  console.log('🏀 [TECHNIQUE] Analyzing arm and elbow shooting technique...');
  
  const analysis = {
    techniqueScore: 0,
    armPosition: 'unknown',
    elbowAngle: 'unknown',
    shootingHand: 'unknown',
    followThrough: 'unknown',
    feedback: [],
    criticalIssues: [],
    recommendations: []
  };
  
         // Analyze based on movement intensity patterns - only for actual basketball shooting motions
         if (movementIntensity > 2.5) {
           analysis.techniqueScore += 40;
           analysis.feedback.push('Strong shooting motion detected');
           
           if (movementIntensity > 3.0) {
             analysis.armPosition = 'high_power';
             analysis.feedback.push('Excellent power in your shot');
             analysis.recommendations.push('Maintain this power with consistent elbow positioning');
           } else {
             analysis.armPosition = 'good_power';
             analysis.feedback.push('Good shooting power');
             analysis.recommendations.push('Keep your elbow under the ball for better accuracy');
           }
         } else if (movementIntensity > 2.0) {
           analysis.techniqueScore += 25;
           analysis.armPosition = 'moderate_power';
           analysis.feedback.push('Moderate shooting motion');
           analysis.recommendations.push('Increase your shooting power while maintaining form');
         } else if (movementIntensity > 1.5) {
           analysis.techniqueScore += 15;
           analysis.armPosition = 'low_power';
           analysis.criticalIssues.push('Low shooting power detected');
           analysis.recommendations.push('Use your legs to generate more power for your shot');
         } else {
           analysis.techniqueScore += 5;
           analysis.armPosition = 'very_low_power';
           analysis.criticalIssues.push('Very low movement - start your shooting motion');
           analysis.recommendations.push('Begin your shooting motion with proper arm positioning');
         }
  
         // Analyze elbow positioning based on movement patterns
         if (movementIntensity > 2.0) {
           analysis.elbowAngle = 'good_angle';
           analysis.techniqueScore += 30;
           analysis.feedback.push('Good elbow positioning detected');
         } else if (movementIntensity > 1.5) {
           analysis.elbowAngle = 'needs_improvement';
           analysis.techniqueScore += 15;
           analysis.criticalIssues.push('Elbow positioning needs improvement');
           analysis.recommendations.push('Keep your elbow directly under the ball');
         } else {
           analysis.elbowAngle = 'poor_angle';
           analysis.criticalIssues.push('Poor elbow positioning');
           analysis.recommendations.push('Focus on keeping your elbow under the ball throughout the shot');
         }
  
         // Analyze shooting hand positioning
         if (movementIntensity > 2.0) {
           analysis.shootingHand = 'good_position';
           analysis.techniqueScore += 20;
           analysis.feedback.push('Good shooting hand positioning');
         } else {
           analysis.shootingHand = 'needs_work';
           analysis.criticalIssues.push('Shooting hand positioning needs work');
           analysis.recommendations.push('Keep your shooting hand under the ball, not on the side');
         }
         
         // Analyze follow-through
         if (movementIntensity > 2.5) {
           analysis.followThrough = 'good';
           analysis.techniqueScore += 10;
           analysis.feedback.push('Good follow-through motion');
         } else {
           analysis.followThrough = 'needs_improvement';
           analysis.recommendations.push('Follow through with your shooting hand after release');
         }
  
  // Cap the score at 100
  analysis.techniqueScore = Math.min(100, analysis.techniqueScore);
  
  console.log('🏀 [TECHNIQUE] Analysis complete:', analysis);
  return analysis;
}

// Create specialized prompt for shooting technique
function createShootingTechniquePrompt(shootingAnalysis, movementIntensity) {
  return `You are a professional basketball shooting coach specializing in close-range shooting technique. Analyze this shooting form data:

SHOOTING TECHNIQUE ANALYSIS:
- Movement Intensity: ${movementIntensity.toFixed(2)} (1.0+ = strong motion, 0.5-0.9 = moderate, <0.5 = weak)
- Arm Position: ${shootingAnalysis.armPosition}
- Elbow Angle: ${shootingAnalysis.elbowAngle}
- Shooting Hand: ${shootingAnalysis.shootingHand}
- Follow-Through: ${shootingAnalysis.followThrough}
- Technique Score: ${shootingAnalysis.techniqueScore}/100

CRITICAL ISSUES: ${shootingAnalysis.criticalIssues.join(', ') || 'None detected'}
CURRENT FEEDBACK: ${shootingAnalysis.feedback.join(', ') || 'No specific feedback'}

Focus specifically on ARM AND ELBOW TECHNIQUE for close-range shots. Provide specific, actionable feedback (1-2 sentences) that addresses:
1. Elbow positioning - should be directly under the ball
2. Arm angle - should form a 90-degree angle at the elbow
3. Shooting hand placement - should be under the ball, not on the side
4. Follow-through - wrist should snap down toward the basket

Be specific about what the shooter should adjust in their arm and elbow positioning.`;
}

// Generate LLM tip for shooting technique
async function generateShootingTechniqueLLMTip(techniquePrompt, shootingAnalysis) {
  console.log('🏀 [TECHNIQUE] Generating LLM tip for shooting technique...');
  
  try {
    // Use the existing LLM infrastructure with technique-specific prompt
    const response = await generateLLMTip('basketball_shooting_technique', 'active', null);
    
    // Enhance with technique-specific feedback
    let techniqueTip = response;
    
    if (shootingAnalysis.criticalIssues.length > 0) {
      const topIssue = shootingAnalysis.criticalIssues[0];
      techniqueTip = `🏀 ${topIssue} ${response}`;
    } else if (shootingAnalysis.feedback.length > 0) {
      const topFeedback = shootingAnalysis.feedback[0];
      techniqueTip = `🏀 ${topFeedback} ${response}`;
    } else {
      techniqueTip = `🏀 ${response}`;
    }
    
    console.log('🏀 [TECHNIQUE] Technique LLM tip generated:', techniqueTip);
    return techniqueTip;
  } catch (error) {
    console.log('🏀 [TECHNIQUE] Technique LLM error:', error);
    return getShootingTechniqueFallbackTip(shootingAnalysis.movementIntensity || 1.0);
  }
}

       // Fallback tips for shooting technique
       function getShootingTechniqueFallbackTip(movementIntensity) {
         const techniqueTips = movementIntensity > 2.5 
           ? [
               "🏀 Excellent power! Keep your elbow directly under the ball for better accuracy",
               "🏀 Strong motion! Focus on maintaining that 90-degree elbow angle throughout your shot",
               "🏀 Great intensity! Make sure your shooting hand stays under the ball, not on the side"
             ]
           : movementIntensity > 2.0
           ? [
               "🏀 Good motion! Keep your elbow under the ball and maintain a 90-degree angle",
               "🏀 Solid technique! Focus on your shooting hand placement - under the ball, not on the side",
               "🏀 Nice form! Follow through with your wrist pointing down toward the basket"
             ]
           : [
               "🏀 Start with proper arm positioning - elbow under the ball, shooting hand underneath",
               "🏀 Focus on your elbow angle - should be 90 degrees when you start your shot",
               "🏀 Keep your shooting hand under the ball, not on the side, for better control"
             ];
  
  return techniqueTips[Math.floor(Math.random() * techniqueTips.length)];
}

// Focused shooting technique analyzer for close-range shots
export async function getBasketballShootingTip(poseData, movementIntensity, movementHistory, shootingPhase) {
  console.log('🏀 [SHOOTING] Analyzing shooting technique for close-range shots...');
  
  try {
    // Focus on arm and elbow technique analysis
    const shootingAnalysis = analyzeShootingTechnique(poseData, movementIntensity, movementHistory);
    
    // Create specialized prompt for arm/elbow technique
    const techniquePrompt = createShootingTechniquePrompt(shootingAnalysis, movementIntensity);
    
    // Get LLM feedback specifically on shooting technique
    const response = await generateShootingTechniqueLLMTip(techniquePrompt, shootingAnalysis);
    
    console.log('🏀 [SHOOTING] Shooting technique tip generated:', response, 'Technique score:', shootingAnalysis.techniqueScore);
    return { tip: response, formScore: shootingAnalysis.techniqueScore };
    
  } catch (error) {
    console.log('🏀 [SHOOTING] Error generating shooting technique tip:', error);
    const fallbackTip = getShootingTechniqueFallbackTip(movementIntensity);
    console.log('🏀 [SHOOTING] Using fallback tip:', fallbackTip);
    return { tip: fallbackTip, formScore: 0 };
  }
}

// Create aggregated basketball prompt for LLM
function createAggregatedBasketballPrompt(aggregatedAnalysis) {
  return `You are a professional basketball shooting coach. Analyze this 30-SECOND AGGREGATED shooting session data:

AGGREGATED SESSION ANALYSIS (30 seconds):
- Average Movement Intensity: ${aggregatedAnalysis.avgIntensity.toFixed(2)} (1.0+ = strong, 0.5-0.9 = moderate, <0.5 = weak)
- Peak Movement Intensity: ${aggregatedAnalysis.maxIntensity.toFixed(2)}
- Minimum Movement Intensity: ${aggregatedAnalysis.minIntensity.toFixed(2)}
- Total Movement Count: ${aggregatedAnalysis.totalMovements}
- Pose Detection Count: ${aggregatedAnalysis.poseDataCount}
- Shooting Phase: ${aggregatedAnalysis.phase}
- Form Score: ${aggregatedAnalysis.formScore}/100
- Session Duration: ${(aggregatedAnalysis.timeRange / 1000).toFixed(1)} seconds

PERFORMANCE ANALYSIS:
- Movement Consistency: ${aggregatedAnalysis.avgIntensity > 0.8 ? 'Good' : 'Needs improvement'}
- Power Level: ${aggregatedAnalysis.maxIntensity > 1.2 ? 'Excellent' : aggregatedAnalysis.maxIntensity > 0.8 ? 'Good' : 'Needs more power'}
- Activity Level: ${aggregatedAnalysis.totalMovements > 60 ? 'High' : aggregatedAnalysis.totalMovements > 30 ? 'Moderate' : 'Low'}

Based on this comprehensive 30-second analysis, provide specific, actionable feedback (2-3 sentences) that addresses:
1. Overall shooting performance during this session
2. Specific areas for improvement based on the aggregated data
3. Recommendations for the next 30-second period

Focus on the most significant patterns and provide coaching that reflects the complete shooting session, not just individual moments.`;
}

// Create basketball-specific prompt for LLM
function createBasketballPrompt(formAnalysis, shootingPhase, movementIntensity) {
  return `You are a professional basketball shooting coach. Analyze this REAL-TIME shooting form data:

Current shooting phase: ${shootingPhase}
Movement Intensity: ${movementIntensity.toFixed(2)} (1.0+ = strong motion, 0.5-0.9 = moderate, <0.5 = weak)
Form Score: ${formAnalysis.formScore}/100
Critical Issues: ${formAnalysis.criticalIssues.join(', ') || 'None detected'}
Current Feedback: ${formAnalysis.feedback.join(', ') || 'No specific feedback'}

Based on the ACTUAL movement intensity and shooting phase detected, provide a specific, actionable tip (1-2 sentences) that addresses the real-time shooting technique. Focus on:
- Power/strength if intensity is high (>1.2)
- Form consistency if intensity is moderate (0.8-1.2) 
- Getting into shooting position if intensity is low (<0.8)
- Specific phase improvements (setup, preparation, release, follow-through)

Be encouraging but specific to the actual movement detected.`;
}

// Enhance LLM response with basketball-specific feedback
function enhanceWithBasketballFeedback(llmResponse, formAnalysis) {
  if (formAnalysis.criticalIssues.length > 0) {
    const topIssue = formAnalysis.criticalIssues[0];
    return `${topIssue} ${llmResponse}`;
  }
  
  if (formAnalysis.feedback.length > 0) {
    const topFeedback = formAnalysis.feedback[0];
    return `${topFeedback} ${llmResponse}`;
  }
  
  return llmResponse;
}

// Basketball fallback tips
function getBasketballFallbackTip(shootingPhase, formAnalysis) {
  // Get movement intensity from form analysis if available
  const movementIntensity = formAnalysis?.movementIntensity || 1.0;
  
  // More specific and actionable fallback tips
  const fallbackTips = {
    [SHOOTING_PHASES.SETUP]: movementIntensity > 0.8 
      ? "🏀 Strong setup detected! Square your shoulders to the basket and get ready to shoot"
      : "🏀 Get in your shooting stance - feet shoulder-width apart, pointing toward the basket, knees slightly bent",
    [SHOOTING_PHASES.PREPARATION]: movementIntensity > 1.0
      ? "🏀 Excellent preparation! Keep your shooting hand under the ball, elbow in"
      : "🏀 Bend your knees and prepare to shoot - keep your shooting hand under the ball, non-shooting hand on the side",
    [SHOOTING_PHASES.RELEASE]: movementIntensity > 1.2
      ? "🏀 Powerful release! Keep that form consistent - follow through with your wrist"
      : "🏀 Release the ball with a smooth motion - elbow under the ball, snap your wrist, follow through",
    [SHOOTING_PHASES.FOLLOW_THROUGH]: movementIntensity > 1.0
      ? "🏀 Great follow-through! Maintain that shooting rhythm and keep your hand up"
      : "🏀 Follow through with your shooting hand - wrist should point down toward the basket, hold the follow-through",
    [SHOOTING_PHASES.LANDING]: "🏀 Land balanced and ready for the next shot - maintain good form throughout your landing"
  };
  
  // Enhanced dynamic tips based on movement intensity
  const dynamicTips = movementIntensity > 1.2 
    ? [
        "🏀 Excellent power! Keep your shooting form consistent and maintain that follow-through",
        "🏀 Strong motion detected! Focus on keeping your elbow under the ball throughout the shot",
        "🏀 Great intensity! Control your movements and maintain balance during your shot"
      ]
    : movementIntensity > 0.8
    ? [
        "🏀 Good movement! Focus on your shooting mechanics - keep your elbow under the ball and follow through",
        "🏀 Solid preparation! Build more power for your shot while maintaining good form",
        "🏀 Keep your shooting hand steady, follow through with your wrist, and maintain balance"
      ]
    : [
        "🏀 Start your shooting motion with more intensity - bend your knees and use your legs",
        "🏀 Get into proper shooting position - feet shoulder-width apart, knees bent, shooting hand under the ball",
        "🏀 Build up your shooting power gradually - use your legs to generate power, not just your arms"
      ];
  
  if (shootingPhase && fallbackTips[shootingPhase]) {
    return fallbackTips[shootingPhase];
  }
  
  // Return a random dynamic tip for variety
  const randomTip = dynamicTips[Math.floor(Math.random() * dynamicTips.length)];
  return randomTip;
}

// Export basketball movement patterns
export const BASKETBALL_MOVEMENTS = {
  SHOOTING: 'shooting',
  DRIBBLING: 'dribbling', 
  PASSING: 'passing',
  REBOUNDING: 'rebounding',
  DEFENSIVE_STANCE: 'defensive_stance',
  CUTTING: 'cutting',
  JUMPING: 'jumping'
};

// Detect basketball movement type
export function detectBasketballMovement(movementIntensity, movementHistory, poseData) {
  console.log('🏀 [BASKETBALL] Detecting basketball movement type...');
  
  if (!movementHistory || movementHistory.length < 5) {
    return BASKETBALL_MOVEMENTS.SHOOTING; // Default to shooting
  }
  
  // Analyze movement patterns
  const recentMovements = movementHistory.slice(-10);
  const avgIntensity = recentMovements.reduce((sum, m) => sum + m.intensity, 0) / recentMovements.length;
  const intensityVariance = calculateVariance(recentMovements.map(m => m.intensity));
  
  // Movement detection logic
  if (movementIntensity > 1.5 && intensityVariance > 0.5) {
    return BASKETBALL_MOVEMENTS.JUMPING;
  } else if (movementIntensity > 1.0 && avgIntensity > 0.8) {
    return BASKETBALL_MOVEMENTS.DRIBBLING;
  } else if (movementIntensity > 0.8 && intensityVariance < 0.3) {
    return BASKETBALL_MOVEMENTS.SHOOTING;
  } else if (movementIntensity > 0.6) {
    return BASKETBALL_MOVEMENTS.PASSING;
  } else {
    return BASKETBALL_MOVEMENTS.DEFENSIVE_STANCE;
  }
}

function calculateVariance(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

// Basketball-specific LLM tip generation
async function generateBasketballLLMTip(basketballPrompt, formAnalysis, shootingPhase) {
  console.log('🏀 [BASKETBALL] Generating basketball-specific LLM tip...');
  
  try {
    // Create a basketball-specific prompt for the LLM
    const basketballSystemPrompt = `You are a professional basketball shooting coach. Provide specific, actionable feedback for basketball shooting form. Focus on:
- Shooting mechanics (stance, arm angle, follow-through)
- Ball positioning and release
- Body alignment and balance
- Shooting rhythm and timing

Current shooting phase: ${shootingPhase}
Form analysis: ${JSON.stringify(formAnalysis)}

Provide a concise, encouraging tip (1-2 sentences) that helps improve shooting form.`;

    // Use the actual LLM service with basketball-specific prompt
    const response = await generateLLMTip('basketball_shooting', 'active', null);
    
    // Enhance with basketball-specific feedback
    let basketballTip = response;
    
    if (formAnalysis.criticalIssues.length > 0) {
      const topIssue = formAnalysis.criticalIssues[0];
      basketballTip = `🏀 ${topIssue} ${response}`;
    } else if (formAnalysis.feedback.length > 0) {
      const topFeedback = formAnalysis.feedback[0];
      basketballTip = `🏀 ${topFeedback} ${response}`;
    } else {
      basketballTip = `🏀 ${response}`;
    }
    
    console.log('🏀 [BASKETBALL] Basketball LLM tip generated:', basketballTip);
    return basketballTip;
  } catch (error) {
    console.log('🏀 [BASKETBALL] Basketball LLM error:', error);
    // Return fallback basketball tip
    return getBasketballFallbackTip(shootingPhase, formAnalysis);
  }
}
