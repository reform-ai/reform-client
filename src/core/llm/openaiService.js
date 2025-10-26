// OpenAI LLM Service for Fitness Form Analysis
// This service provides real AI-powered pose analysis and coaching feedback

import { LLM_CONFIG } from './config.js';

// Initialize OpenAI client (you'll need to install: npm install openai)
let openai = null;
let isOpenAIAvailable = false;

try {
  // Dynamic import to handle missing package gracefully
  const { OpenAI } = require('openai');
  openai = new OpenAI({
    apiKey: LLM_CONFIG.OPENAI_API_KEY,
  });
  isOpenAIAvailable = true;
  console.log('✅ OpenAI client initialized successfully');
} catch (error) {
  console.log('⚠️ OpenAI package not installed. Install with: npm install openai');
  console.log('⚠️ Or set your API key in llm/config.js');
  console.log('🔄 Using mock LLM responses for testing...');
}

// Enhanced movement analysis with caching and smart thresholds
const movementCache = new Map();
const lastAnalysisTime = new Map();
const CACHE_DURATION_MS = 2000; // Cache results for 2 seconds
const MIN_ANALYSIS_INTERVAL_MS = 1000; // Minimum time between analyses

export async function analyzeMovementWithLLM(intensity, accelerometer, poseData, history) {
  // Create cache key based on movement signature
  const movementSignature = createMovementSignature(intensity, accelerometer, history);
  const now = Date.now();
  
  // Check cache first
  if (movementCache.has(movementSignature)) {
    const cached = movementCache.get(movementSignature);
    if (now - cached.timestamp < CACHE_DURATION_MS) {
      console.log('🎯 Using cached movement analysis');
      return cached.result;
    }
  }
  
  // Rate limiting - don't analyze too frequently
  const lastTime = lastAnalysisTime.get('movement') || 0;
  if (now - lastTime < MIN_ANALYSIS_INTERVAL_MS) {
    console.log('⏱️ Rate limiting movement analysis');
    return analyzeMovementFallback(intensity, accelerometer, poseData, history);
  }
  
  if (!isOpenAIAvailable) {
    console.log('🤖 Mock LLM: Analyzing movement pattern...');
    const result = await mockLLMMovementAnalysis(intensity, accelerometer, poseData, history);
    cacheMovementResult(movementSignature, result, now);
    return result;
  }

  try {
    // Enhanced context with better movement patterns
    const context = createEnhancedMovementContext(intensity, accelerometer, poseData, history);
    
    const prompt = `You are an expert fitness AI coach. Analyze this movement pattern and classify it:

Movement Analysis:
- Current Intensity: ${intensity.toFixed(2)} (0-2 scale)
- Accelerometer: X=${accelerometer.x.toFixed(2)}, Y=${accelerometer.y.toFixed(2)}, Z=${accelerometer.z.toFixed(2)}
- Movement Pattern: ${context.pattern}
- Stability: ${context.stability}
- Recent Trend: ${context.trend}
- Pose Quality: ${poseData ? `${poseData.summary?.highConfidenceKeypoints || 0}/17 keypoints` : 'No pose data'}

Based on this data, classify as: explosive, rhythmic, sustained, controlled, or none.

Explosive: High intensity, sudden acceleration, vertical movement
Rhythmic: Consistent tempo, moderate intensity, repetitive pattern  
Sustained: High intensity maintained, controlled movement
Controlled: Low-moderate intensity, precise movement
None: Minimal or no significant movement

Respond with ONLY the classification.`;

    const response = await openai.chat.completions.create({
      model: LLM_CONFIG.MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 15,
      temperature: 0.2, // Lower temperature for more consistent classification
    });

    const movementType = response.choices[0].message.content.trim().toLowerCase();
    
    // Enhanced validation with fuzzy matching
    const validTypes = ['explosive', 'rhythmic', 'sustained', 'controlled', 'none'];
    const result = validTypes.find(type => movementType.includes(type)) || 'none';
    
    // Cache the result
    cacheMovementResult(movementSignature, result, now);
    lastAnalysisTime.set('movement', now);
    
    return result;
    
  } catch (error) {
    console.log('LLM analysis error:', error);
    const fallback = analyzeMovementFallback(intensity, accelerometer, poseData, history);
    cacheMovementResult(movementSignature, fallback, now);
    return fallback;
  }
}

// Helper functions for enhanced analysis
function createMovementSignature(intensity, accelerometer, history) {
  const recentIntensities = history.slice(-5).map(h => Math.round(h.intensity * 10) / 10);
  const avgIntensity = recentIntensities.reduce((a, b) => a + b, 0) / recentIntensities.length;
  const variance = recentIntensities.reduce((sum, val) => sum + Math.pow(val - avgIntensity, 2), 0) / recentIntensities.length;
  
  return `${Math.round(intensity * 10)}_${Math.round(accelerometer.z * 10)}_${Math.round(variance * 100)}`;
}

function cacheMovementResult(signature, result, timestamp) {
  movementCache.set(signature, { result, timestamp });
  
  // Clean old cache entries
  if (movementCache.size > 50) {
    const now = Date.now();
    for (const [key, value] of movementCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION_MS * 2) {
        movementCache.delete(key);
      }
    }
  }
}

function createEnhancedMovementContext(intensity, accelerometer, poseData, history) {
  const recentData = history.slice(-10);
  const intensities = recentData.map(h => h.intensity);
  const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
  const variance = intensities.reduce((sum, val) => sum + Math.pow(val - avgIntensity, 2), 0) / intensities.length;
  
  // Determine movement pattern
  let pattern = 'stable';
  if (variance > 0.1) pattern = 'variable';
  if (accelerometer.z > 0.4) pattern = 'vertical';
  if (Math.abs(accelerometer.y) > 0.3) pattern = 'lateral';
  
  // Determine stability
  let stability = 'high';
  if (poseData?.summary?.highConfidenceKeypoints < 8) stability = 'low';
  else if (poseData?.summary?.highConfidenceKeypoints < 12) stability = 'medium';
  
  // Determine trend
  let trend = 'stable';
  if (intensities.length >= 3) {
    const recent = intensities.slice(-3);
    const older = intensities.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    if (recentAvg > olderAvg * 1.2) trend = 'increasing';
    else if (recentAvg < olderAvg * 0.8) trend = 'decreasing';
  }
  
  return { pattern, stability, trend, avgIntensity, variance };
}

// Enhanced tip generation with smart caching and contextual feedback
const tipCache = new Map();
const lastTipTime = new Map();
const TIP_CACHE_DURATION_MS = 3000; // Cache tips for 3 seconds
const MIN_TIP_INTERVAL_MS = 2000; // Minimum time between new tips

export async function generateLLMTip(fitnessMove, movement, poseData) {
  // Create cache key based on context
  const tipSignature = createTipSignature(fitnessMove, movement, poseData);
  const now = Date.now();
  
  // Check cache first
  if (tipCache.has(tipSignature)) {
    const cached = tipCache.get(tipSignature);
    if (now - cached.timestamp < TIP_CACHE_DURATION_MS) {
      console.log('🎯 Using cached tip');
      return cached.result;
    }
  }
  
  // Rate limiting for tips
  const lastTime = lastTipTime.get('tip') || 0;
  if (now - lastTime < MIN_TIP_INTERVAL_MS) {
    console.log('⏱️ Rate limiting tip generation');
    return generateFallbackTip(fitnessMove, movement, poseData);
  }
  
  if (!isOpenAIAvailable) {
    console.log('🤖 Mock LLM: Generating coaching tip...');
    const result = await mockLLMTipGeneration(fitnessMove, movement, poseData);
    cacheTipResult(tipSignature, result, now);
    return result;
  }

  try {
    // Enhanced context with better analysis
    const context = createEnhancedTipContext(fitnessMove, movement, poseData);
    
    const prompt = `You are an expert fitness coach providing real-time form feedback. Analyze this data and provide a helpful, encouraging tip:

Fitness Context:
- Movement Type: ${fitnessMove}
- Current State: ${movement}
- Movement Quality: ${context.quality}
- Form Issues: ${context.issues.length > 0 ? context.issues.join(', ') : 'None detected'}
- Strengths: ${context.strengths.length > 0 ? context.strengths.join(', ') : 'Good baseline'}
- Pose Quality: ${poseData ? `${poseData.summary?.highConfidenceKeypoints || 0}/17 keypoints` : 'No pose data'}

Provide a specific, actionable tip (max 60 characters) that helps improve form or encourages good technique. Be encouraging and specific.

Priority: Address the most critical form issue first, or provide positive reinforcement if form is good.

Examples:
- "Keep shoulders level for stability"
- "Great rhythm! Maintain tempo"
- "Focus on controlled landing"
- "Excellent form! Keep it up"

Respond with ONLY the tip, no quotes or extra text.`;

    const response = await openai.chat.completions.create({
      model: LLM_CONFIG.MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 30, // Reduced for shorter, more focused tips
      temperature: 0.4, // Slightly lower for more consistent tips
    });

    const tip = response.choices[0].message.content.trim();
    
    // Cache the result
    cacheTipResult(tipSignature, tip, now);
    lastTipTime.set('tip', now);
    
    return tip;
    
  } catch (error) {
    console.log('LLM tip generation error:', error);
    const fallback = generateFallbackTip(fitnessMove, movement, poseData);
    cacheTipResult(tipSignature, fallback, now);
    return fallback;
  }
}

// Helper functions for enhanced tip generation
function createTipSignature(fitnessMove, movement, poseData) {
  const poseQuality = poseData?.summary?.highConfidenceKeypoints || 0;
  const alignment = poseData ? calculatePoseAlignment(poseData) : { shoulder: 0, hip: 0, knee: 0, ankle: 0 };
  const maxAlignment = Math.max(alignment.shoulder, alignment.hip, alignment.knee, alignment.ankle);
  
  return `${fitnessMove}_${movement}_${Math.round(poseQuality/5)}_${Math.round(maxAlignment/10)}`;
}

function cacheTipResult(signature, result, timestamp) {
  tipCache.set(signature, { result, timestamp });
  
  // Clean old cache entries
  if (tipCache.size > 30) {
    const now = Date.now();
    for (const [key, value] of tipCache.entries()) {
      if (now - value.timestamp > TIP_CACHE_DURATION_MS * 2) {
        tipCache.delete(key);
      }
    }
  }
}

function createEnhancedTipContext(fitnessMove, movement, poseData) {
  const issues = [];
  const strengths = [];
  let quality = 'good';
  
  // Analyze pose data for specific issues
  if (poseData) {
    const alignment = calculatePoseAlignment(poseData);
    const confidence = poseData.summary?.highConfidenceKeypoints || 0;
    
    if (alignment.shoulder > 25) issues.push('shoulder misalignment');
    if (alignment.hip > 20) issues.push('hip imbalance');
    if (alignment.knee > 35) issues.push('knee alignment');
    if (alignment.ankle > 30) issues.push('foot positioning');
    
    if (confidence > 12) strengths.push('excellent pose detection');
    if (confidence > 8 && issues.length === 0) strengths.push('good alignment');
    
    if (confidence < 6) {
      issues.push('poor pose detection');
      quality = 'poor';
    } else if (issues.length > 2) {
      quality = 'needs improvement';
    } else if (issues.length === 0) {
      quality = 'excellent';
    }
  }
  
  // Analyze movement patterns
  if (fitnessMove === 'explosive' && movement === 'active') {
    strengths.push('good power generation');
  } else if (fitnessMove === 'rhythmic' && movement === 'moving') {
    strengths.push('consistent tempo');
  } else if (fitnessMove === 'controlled' && movement === 'moving') {
    strengths.push('precise control');
  }
  
  return { quality, issues, strengths };
}

// Advanced LLM pose analysis
export async function analyzePoseWithLLM(poseData) {
  if (!isOpenAIAvailable || !poseData?.keypoints) {
    console.log('🤖 Mock LLM: Analyzing pose data...');
    return mockLLMPoseAnalysis(poseData);
  }

  try {
    // Create detailed pose analysis context
    const poseContext = createPoseContext(poseData);
    
    const prompt = `You are a movement analysis expert. Analyze this pose data and provide specific form feedback:

Pose Analysis:
${JSON.stringify(poseContext, null, 2)}

Provide a specific, actionable tip (max 80 characters) focusing on the most important form correction needed. Be encouraging and specific.

Examples:
- "Keep shoulders level and aligned"
- "Maintain level hips for stability"
- "Excellent form! Keep it up"

Respond with ONLY the tip, no quotes or extra text.`;

    const response = await openai.chat.completions.create({
      model: LLM_CONFIG.MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: LLM_CONFIG.MAX_TOKENS,
      temperature: 0.6,
    });

    return response.choices[0].message.content.trim();
    
  } catch (error) {
    console.log('LLM pose analysis error:', error);
    return generateFallbackTip('none', 'idle', poseData);
  }
}

// Helper functions for context creation
function createMovementContext(intensity, accelerometer, poseData, history) {
  return {
    currentIntensity: intensity,
    accelerometer: accelerometer,
    recentHistory: history.slice(-5),
    poseQuality: poseData ? {
      keypoints: poseData.keypoints?.length || 0,
      confidence: poseData.summary?.highConfidenceKeypoints || 0
    } : null,
    timestamp: new Date().toISOString()
  };
}

function createTipContext(fitnessMove, movement, poseData) {
  return {
    movementType: fitnessMove,
    currentState: movement,
    poseQuality: poseData ? {
      keypoints: poseData.keypoints?.length || 0,
      confidence: poseData.summary?.highConfidenceKeypoints || 0,
      alignment: calculatePoseAlignment(poseData)
    } : null,
    timestamp: new Date().toISOString()
  };
}

function createPoseContext(poseData) {
  const { keypoints, summary } = poseData;
  
  return {
    keypointCount: keypoints?.length || 0,
    highConfidenceKeypoints: summary?.highConfidenceKeypoints || 0,
    alignment: calculatePoseAlignment(poseData),
    bodyParts: {
      shoulders: getKeypointPair(keypoints, 'left_shoulder', 'right_shoulder'),
      hips: getKeypointPair(keypoints, 'left_hip', 'right_hip'),
      knees: getKeypointPair(keypoints, 'left_knee', 'right_knee'),
      ankles: getKeypointPair(keypoints, 'left_ankle', 'right_ankle')
    }
  };
}

function calculatePoseAlignment(poseData) {
  if (!poseData?.keypoints) return { shoulder: 0, hip: 0, knee: 0, ankle: 0 };
  
  const { keypoints } = poseData;
  
  return {
    shoulder: calculateAlignment(keypoints, 'left_shoulder', 'right_shoulder'),
    hip: calculateAlignment(keypoints, 'left_hip', 'right_hip'),
    knee: calculateAlignment(keypoints, 'left_knee', 'right_knee'),
    ankle: calculateAlignment(keypoints, 'left_ankle', 'right_ankle')
  };
}

function getKeypointPair(keypoints, leftName, rightName) {
  const left = keypoints.find(kp => kp.name === leftName);
  const right = keypoints.find(kp => kp.name === rightName);
  
  return {
    left: left ? { x: left.x, y: left.y, score: left.score } : null,
    right: right ? { x: right.x, y: right.y, score: right.score } : null,
    alignment: calculateAlignment(keypoints, leftName, rightName)
  };
}

function calculateAlignment(keypoints, leftName, rightName) {
  const left = keypoints.find(kp => kp.name === leftName);
  const right = keypoints.find(kp => kp.name === rightName);
  
  if (!left || !right || left.score < 0.5 || right.score < 0.5) {
    return 0;
  }
  
  return Math.abs(left.y - right.y);
}

// Enhanced fallback functions with better movement classification
function analyzeMovementFallback(intensity, accelerometer, poseData, history) {
  if (history.length < 3) return 'none';
  
  const recentData = history.slice(-8); // Use more data points
  const intensities = recentData.map(r => r.intensity);
  const avgIntensity = intensities.reduce((sum, r) => sum + r, 0) / intensities.length;
  const variance = intensities.reduce((sum, val) => sum + Math.pow(val - avgIntensity, 2), 0) / intensities.length;
  
  // Calculate movement patterns
  const verticalMovement = accelerometer.z;
  const lateralMovement = Math.abs(accelerometer.y);
  const forwardMovement = Math.abs(accelerometer.x);
  
  // Enhanced classification logic
  const isExplosive = verticalMovement > 0.5 && intensity > 0.7 && variance > 0.2;
  const isRhythmic = lateralMovement > 0.25 && variance < 0.1 && avgIntensity > 0.3 && avgIntensity < 0.7;
  const isSustained = avgIntensity > 0.6 && variance < 0.15 && (verticalMovement > 0.3 || lateralMovement > 0.2);
  const isControlled = intensity < 0.5 && variance < 0.08 && Math.max(verticalMovement, lateralMovement, forwardMovement) < 0.3;
  
  // Pose-based validation
  const poseQuality = poseData?.summary?.highConfidenceKeypoints || 0;
  const hasGoodPose = poseQuality > 8;
  
  // Return classification with pose validation
  if (isExplosive && (hasGoodPose || poseQuality === 0)) {
    return 'explosive';
  }
  if (isRhythmic && (hasGoodPose || poseQuality === 0)) {
    return 'rhythmic';
  }
  if (isSustained && (hasGoodPose || poseQuality === 0)) {
    return 'sustained';
  }
  if (isControlled && (hasGoodPose || poseQuality === 0)) {
    return 'controlled';
  }
  
  // If intensity is very low, return none
  if (intensity < 0.15) {
    return 'none';
  }
  
  // Default fallback based on intensity
  if (intensity > 0.6) return 'explosive';
  if (intensity > 0.4) return 'sustained';
  if (intensity > 0.2) return 'controlled';
  
  return 'none';
}

function generateFallbackTip(fitnessMove, movement, poseData) {
  // Enhanced contextual tips based on pose analysis
  if (poseData && poseData.keypoints) {
    const alignment = calculatePoseAlignment(poseData);
    const confidence = poseData.summary?.highConfidenceKeypoints || 0;
    
    // Pose-specific feedback
    if (confidence < 6) {
      return 'Adjust position for better detection';
    }
    
    if (alignment.shoulder > 25) {
      return 'Keep shoulders level for stability';
    }
    if (alignment.hip > 20) {
      return 'Maintain level hips for balance';
    }
    if (alignment.knee > 35) {
      return 'Keep knees aligned and forward';
    }
    if (alignment.ankle > 30) {
      return 'Check your foot positioning';
    }
    
    if (confidence > 12) {
      return 'Excellent form! Keep it up';
    }
  }
  
  // Movement-specific tips with better context
  const contextualTips = {
    explosive: [
      'Powerful movement! Focus on controlled landing',
      'Great explosive energy! Maintain control',
      'Strong power! Land softly and prepare for next rep',
      'Excellent burst! Keep core engaged throughout'
    ],
    rhythmic: [
      'Perfect rhythm! Keep this tempo',
      'Excellent cadence! Maintain this flow',
      'Great pace! Stay in this rhythm zone',
      'Nice tempo! Focus on smooth transitions'
    ],
    sustained: [
      'Strong hold! Keep your form tight',
      'Excellent endurance! Maintain alignment',
      'Perfect stability! Control your breathing',
      'Great strength! Keep movements deliberate'
    ],
    controlled: [
      'Precise control! Move with intention',
      'Excellent form! Keep movements deliberate',
      'Perfect precision! Focus on quality over speed',
      'Great control! Maintain awareness throughout'
    ],
    active: [
      'Great intensity! Keep your core engaged',
      'Excellent power! Control your movements',
      'Strong energy! Stay balanced and focused',
      'Good intensity! Maintain proper form'
    ],
    moving: [
      'Good tempo! Keep movements smooth',
      'Nice pace! Focus on proper form',
      'Great flow! Maintain this movement quality',
      'Excellent rhythm! Keep it consistent'
    ],
    idle: [
      'Get ready! Position yourself properly',
      'Set your foundation! Core engaged',
      'Perfect setup! Focus on your breathing',
      'Good preparation! Ready to perform'
    ]
  };
  
  // Select tips based on fitness move first, then movement state
  const tipArray = contextualTips[fitnessMove] || contextualTips[movement] || contextualTips.idle;
  return tipArray[Math.floor(Math.random() * tipArray.length)];
}

// Mock LLM functions for testing without OpenAI package
async function mockLLMMovementAnalysis(intensity, accelerometer, poseData, history) {
  // Simulate LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // AI-like analysis based on patterns
  const avgIntensity = history.slice(-5).reduce((sum, r) => sum + r.intensity, 0) / 5;
  const variance = history.slice(-5).reduce((sum, r) => sum + Math.pow(r.intensity - avgIntensity, 2), 0) / 5;
  
  console.log(`🤖 Mock LLM: Intensity=${intensity.toFixed(2)}, Z=${accelerometer.z.toFixed(2)}, Variance=${variance.toFixed(2)}`);
  
  // Simulate intelligent classification
  if (accelerometer.z > 0.4 && intensity > 0.6 && variance > 0.15) {
    return 'explosive';
  }
  if (Math.abs(accelerometer.y) > 0.3 && variance < 0.08 && poseData?.summary?.highConfidenceKeypoints > 8) {
    return 'rhythmic';
  }
  if (accelerometer.z > 0.5 && avgIntensity > 0.7 && poseData?.summary?.highConfidenceKeypoints > 10) {
    return 'sustained';
  }
  if (intensity < 0.4 && variance < 0.05 && Math.abs(accelerometer.x) < 0.15) {
    return 'controlled';
  }
  
  return 'none';
}

async function mockLLMTipGeneration(fitnessMove, movement, poseData) {
  // Simulate LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  console.log(`🤖 Mock LLM: Generating tip for ${fitnessMove} movement in ${movement} state`);
  
  // Simulate intelligent, contextual tips
  const contextualTips = {
    explosive: [
      'AI Analysis: Explosive power detected! Focus on controlled landing and core engagement.',
      'LLM Insight: Great burst energy! Maintain control throughout the entire motion.',
      'Smart Coaching: Strong explosive movement! Land softly and prepare for next rep.'
    ],
    rhythmic: [
      'AI Analysis: Perfect rhythm detected! Keep this tempo and focus on smooth transitions.',
      'LLM Insight: Excellent cadence! Maintain this flow and steady breathing pattern.',
      'Smart Coaching: Great pace! Stay in this rhythm zone for optimal performance.'
    ],
    sustained: [
      'AI Analysis: Strong hold detected! Keep your form tight and control your breathing.',
      'LLM Insight: Excellent endurance! Maintain proper alignment throughout.',
      'Smart Coaching: Perfect stability! Focus on controlled, deliberate movement.'
    ],
    controlled: [
      'AI Analysis: Precise control detected! Move with intention and maintain awareness.',
      'LLM Insight: Excellent form! Keep movements deliberate and well-aligned.',
      'Smart Coaching: Perfect precision! Focus on quality over speed.'
    ],
    active: [
      'AI Analysis: High intensity detected! Keep your core engaged and finish strong.',
      'LLM Insight: Excellent power! Control your movements throughout the range.',
      'Smart Coaching: Strong energy! Stay balanced and maintain proper form.'
    ],
    moving: [
      'AI Analysis: Good tempo detected! Keep your movements smooth and controlled.',
      'LLM Insight: Nice pace! Focus on proper form and breathing rhythm.',
      'Smart Coaching: Great flow! Maintain this movement quality.'
    ],
    idle: [
      'AI Analysis: Ready position detected! Set your foundation with proper alignment.',
      'LLM Insight: Good preparation! Focus on your breathing and mental readiness.',
      'Smart Coaching: Perfect setup! Core engaged, ready to perform.'
    ]
  };
  
  const tips = contextualTips[fitnessMove] || contextualTips[movement] || contextualTips.idle;
  return tips[Math.floor(Math.random() * tips.length)];
}

async function mockLLMPoseAnalysis(poseData) {
  // Simulate LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const { keypoints, summary } = poseData;
  const confidence = summary?.highConfidenceKeypoints || 0;
  
  console.log(`🤖 Mock LLM: Analyzing pose with ${keypoints?.length || 0} keypoints, ${confidence} high confidence`);
  
  // Simulate intelligent pose analysis
  if (confidence < 8) {
    return 'AI Analysis: Adjust position for better pose detection. Ensure good lighting and full body visibility.';
  }
  
  // Simulate alignment analysis
  const alignment = calculatePoseAlignment(poseData);
  
  if (alignment.shoulder > 25) {
    return 'AI Analysis: Shoulder misalignment detected! Focus on keeping both shoulders level for better stability.';
  }
  if (alignment.hip > 20) {
    return 'AI Analysis: Hip imbalance detected! Maintain level hips to improve balance and reduce injury risk.';
  }
  if (alignment.knee > 35) {
    return 'AI Analysis: Knee alignment issue! Keep your knees aligned and pointing forward for proper form.';
  }
  if (alignment.ankle > 30) {
    return 'AI Analysis: Foot positioning needs attention! Ensure both feet are properly aligned.';
  }
  
  if (confidence > 12) {
    return 'AI Analysis: Excellent form detected! Your body alignment looks great - keep it up!';
  }
  
  return 'AI Analysis: Good posture detected! Continue focusing on maintaining proper alignment throughout your movement.';
}
