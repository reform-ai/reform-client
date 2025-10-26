// Simple OpenAI HTTP Client (no package required)
// Makes direct API calls to OpenAI's REST API

import { LLM_CONFIG } from './config.js';

// Simple HTTP client for OpenAI API calls
class SimpleOpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.log('OpenAI API request failed:', error.message);
      throw error;
    }
  }

  async chatCompletion(messages, options = {}) {
    const data = {
      model: options.model || LLM_CONFIG.MODEL,
      messages,
      max_tokens: options.max_tokens || LLM_CONFIG.MAX_TOKENS,
      temperature: options.temperature || LLM_CONFIG.TEMPERATURE,
    };

    return await this.makeRequest('/chat/completions', data);
  }
}

// Initialize OpenAI client
let openaiClient = null;
let isOpenAIAvailable = false;

// Check if we have a valid API key
if (LLM_CONFIG.OPENAI_API_KEY && LLM_CONFIG.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openaiClient = new SimpleOpenAIClient(LLM_CONFIG.OPENAI_API_KEY);
  isOpenAIAvailable = true;
  console.log('✅ OpenAI client initialized with direct API calls');
} else {
  console.log('⚠️ OpenAI API key not set. Set it in llm/config.js');
  console.log('🔄 Using mock LLM responses for testing...');
}

// Real LLM-powered movement analysis using direct API calls
export async function analyzeMovementWithLLM(intensity, accelerometer, poseData, history) {
  if (!isOpenAIAvailable) {
    console.log('🤖 Mock LLM: Analyzing movement pattern...');
    return mockLLMMovementAnalysis(intensity, accelerometer, poseData, history);
  }

  try {
    // Create context for LLM analysis
    const context = createMovementContext(intensity, accelerometer, poseData, history);
    
    const prompt = `You are a fitness AI coach analyzing movement patterns. Based on this data, classify the movement type:

Movement Data:
- Current Intensity: ${intensity.toFixed(2)}
- Accelerometer: X=${accelerometer.x.toFixed(2)}, Y=${accelerometer.y.toFixed(2)}, Z=${accelerometer.z.toFixed(2)}
- Recent History: ${JSON.stringify(history.slice(-5).map(h => ({ intensity: h.intensity.toFixed(2), timestamp: h.timestamp })))}
- Pose Quality: ${poseData ? `Keypoints: ${poseData.keypoints?.length || 0}, Confidence: ${poseData.summary?.highConfidenceKeypoints || 0}` : 'No pose data'}

Classify this movement as one of: explosive, rhythmic, sustained, controlled, or none.

Respond with ONLY the movement type, no explanation.`;

    const response = await openaiClient.chatCompletion([
      { role: "user", content: prompt }
    ], {
      max_tokens: 10,
      temperature: 0.3,
    });

    const movementType = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate response
    const validTypes = ['explosive', 'rhythmic', 'sustained', 'controlled', 'none'];
    return validTypes.includes(movementType) ? movementType : 'none';
    
  } catch (error) {
    console.log('LLM analysis error:', error);
    return mockLLMMovementAnalysis(intensity, accelerometer, poseData, history);
  }
}

// Real LLM-powered fitness tip generation using direct API calls
export async function generateLLMTip(fitnessMove, movement, poseData) {
  if (!isOpenAIAvailable) {
    console.log('🤖 Mock LLM: Generating coaching tip...');
    return mockLLMTipGeneration(fitnessMove, movement, poseData);
  }

  try {
    // Create comprehensive context for LLM
    const context = createTipContext(fitnessMove, movement, poseData);
    
    const prompt = `You are an expert fitness coach providing real-time form feedback. Analyze this data and provide a helpful, encouraging tip:

Fitness Context:
- Movement Type: ${fitnessMove}
- Current State: ${movement}
- Pose Data: ${poseData ? JSON.stringify({
    keypoints: poseData.keypoints?.length || 0,
    confidence: poseData.summary?.highConfidenceKeypoints || 0,
    alignment: calculatePoseAlignment(poseData)
  }) : 'No pose data available'}

Provide a specific, actionable tip (max 80 characters) that helps improve form or encourages good technique. Be encouraging and specific.

Examples:
- "Keep shoulders level for better stability"
- "Great rhythm! Maintain this tempo"
- "Focus on controlled landing"

Respond with ONLY the tip, no quotes or extra text.`;

    const response = await openaiClient.chatCompletion([
      { role: "user", content: prompt }
    ], {
      max_tokens: LLM_CONFIG.MAX_TOKENS,
      temperature: LLM_CONFIG.TEMPERATURE,
    });

    return response.choices[0].message.content.trim();
    
  } catch (error) {
    console.log('LLM tip generation error:', error);
    return mockLLMTipGeneration(fitnessMove, movement, poseData);
  }
}

// Advanced LLM pose analysis using direct API calls
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

    const response = await openaiClient.chatCompletion([
      { role: "user", content: prompt }
    ], {
      max_tokens: LLM_CONFIG.MAX_TOKENS,
      temperature: 0.6,
    });

    return response.choices[0].message.content.trim();
    
  } catch (error) {
    console.log('LLM pose analysis error:', error);
    return mockLLMPoseAnalysis(poseData);
  }
}

// Helper functions (same as before)
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

// Mock LLM functions (same as before)
async function mockLLMMovementAnalysis(intensity, accelerometer, poseData, history) {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const avgIntensity = history.slice(-5).reduce((sum, r) => sum + r.intensity, 0) / 5;
  const variance = history.slice(-5).reduce((sum, r) => sum + Math.pow(r.intensity - avgIntensity, 2), 0) / 5;
  
  console.log(`🤖 Mock LLM: Intensity=${intensity.toFixed(2)}, Z=${accelerometer.z.toFixed(2)}, Variance=${variance.toFixed(2)}`);
  
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
  await new Promise(resolve => setTimeout(resolve, 150));
  
  console.log(`🤖 Mock LLM: Generating tip for ${fitnessMove} movement in ${movement} state`);
  
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
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const { keypoints, summary } = poseData;
  const confidence = summary?.highConfidenceKeypoints || 0;
  
  console.log(`🤖 Mock LLM: Analyzing pose with ${keypoints?.length || 0} keypoints, ${confidence} high confidence`);
  
  if (confidence < 8) {
    return 'AI Analysis: Adjust position for better pose detection. Ensure good lighting and full body visibility.';
  }
  
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
