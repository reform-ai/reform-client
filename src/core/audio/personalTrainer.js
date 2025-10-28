/**
 * AI Personal Trainer Voice Feedback System
 * Provides enthusiastic, motivating feedback like a real personal trainer
 */

import * as Speech from 'expo-speech';
import { getBasketballShootingTip } from '../pose/basketballFormAnalyzer';

export class PersonalTrainer {
  constructor() {
    this.isSpeaking = false;
    this.lastSpokenTime = 0;
    this.minInterval = 3000; // Minimum 3 seconds between feedback
    this.feedbackHistory = [];
    this.maxHistory = 10;
    
    // Trainer personality settings
    this.personality = {
      enthusiasm: 'high', // high, medium, low
      style: 'motivational', // motivational, technical, casual
      volume: 0.9,
      rate: 1.1,
      pitch: 1.0
    };
  }

  async giveFeedback(poseData, techniqueScore, movementType, frameNumber) {
    // Throttle feedback to avoid overwhelming the user
    const now = Date.now();
    if (now - this.lastSpokenTime < this.minInterval) {
      return;
    }

    try {
      const feedback = await this.generateFeedback(poseData, techniqueScore, movementType, frameNumber);
      
      if (feedback && feedback.tip) {
        await this.speak(feedback.tip, feedback.priority);
        this.lastSpokenTime = now;
        this.addToHistory(feedback);
      }
    } catch (error) {
      console.error('🎤 [TRAINER] Feedback generation failed:', error);
    }
  }

  async generateFeedback(poseData, techniqueScore, movementType, frameNumber) {
    try {
      // Get AI-generated tip
      const aiResult = await getBasketballShootingTip(
        poseData,
        2.0, // High intensity for video analysis
        [],
        movementType || 'shooting'
      );

      // Enhance with trainer personality
      const enhancedTip = this.enhanceWithPersonality(aiResult.tip, techniqueScore, movementType);
      
      return {
        tip: enhancedTip,
        priority: this.getPriority(techniqueScore, movementType),
        confidence: aiResult.formScore / 100,
        techniqueScore: aiResult.formScore,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('🎤 [TRAINER] AI feedback generation failed:', error);
      return this.getFallbackFeedback(techniqueScore, movementType);
    }
  }

  enhanceWithPersonality(aiTip, techniqueScore, movementType) {
    const enthusiasm = this.personality.enthusiasm;
    const style = this.personality.style;
    
    // Add motivational prefixes based on performance
    let prefix = '';
    let suffix = '';
    
    if (techniqueScore >= 80) {
      prefix = this.getPositivePrefix(enthusiasm);
      suffix = this.getPositiveSuffix(enthusiasm);
    } else if (techniqueScore >= 60) {
      prefix = this.getEncouragingPrefix(enthusiasm);
      suffix = this.getEncouragingSuffix(enthusiasm);
    } else {
      prefix = this.getCorrectivePrefix(enthusiasm);
      suffix = this.getCorrectiveSuffix(enthusiasm);
    }

    // Style adjustments
    if (style === 'motivational') {
      return `${prefix} ${aiTip} ${suffix}`.trim();
    } else if (style === 'technical') {
      return `Technique note: ${aiTip}`;
    } else {
      return aiTip;
    }
  }

  getPositivePrefix(enthusiasm) {
    const prefixes = {
      high: ['YES!', 'PERFECT!', 'EXCELLENT!', 'BEAUTIFUL!', 'OUTSTANDING!'],
      medium: ['Great!', 'Nice!', 'Good!', 'Well done!'],
      low: ['Good.', 'Nice.', 'Well done.']
    };
    return this.getRandomItem(prefixes[enthusiasm]);
  }

  getPositiveSuffix(enthusiasm) {
    const suffixes = {
      high: ['Keep it up!', 'You\'re on fire!', 'That\'s the way!', 'Amazing work!', 'You\'re crushing it!'],
      medium: ['Keep going!', 'That\'s it!', 'Great work!'],
      low: ['Keep it up.', 'Good work.']
    };
    return this.getRandomItem(suffixes[enthusiasm]);
  }

  getEncouragingPrefix(enthusiasm) {
    const prefixes = {
      high: ['ALMOST THERE!', 'GETTING BETTER!', 'NICE TRY!', 'GOOD EFFORT!'],
      medium: ['Almost!', 'Getting there!', 'Good try!', 'Better!'],
      low: ['Almost.', 'Getting there.', 'Good try.']
    };
    return this.getRandomItem(prefixes[enthusiasm]);
  }

  getEncouragingSuffix(enthusiasm) {
    const suffixes = {
      high: ['You\'ve got this!', 'Keep pushing!', 'Don\'t give up!', 'You\'re improving!'],
      medium: ['Keep trying!', 'You\'re getting there!', 'Good effort!'],
      low: ['Keep trying.', 'You\'re improving.']
    };
    return this.getRandomItem(suffixes[enthusiasm]);
  }

  getCorrectivePrefix(enthusiasm) {
    const prefixes = {
      high: ['HEY!', 'LISTEN UP!', 'FOCUS!', 'LET\'S FIX THIS!', 'COME ON!'],
      medium: ['Let\'s fix this!', 'Focus!', 'Try this!', 'Here\'s what to do!'],
      low: ['Let\'s fix this.', 'Focus.', 'Try this.']
    };
    return this.getRandomItem(prefixes[enthusiasm]);
  }

  getCorrectiveSuffix(enthusiasm) {
    const suffixes = {
      high: ['You can do better!', 'Let\'s nail this!', 'Show me what you\'ve got!', 'Push harder!'],
      medium: ['You can do this!', 'Let\'s improve!', 'Keep working!'],
      low: ['You can do this.', 'Let\'s improve.']
    };
    return this.getRandomItem(suffixes[enthusiasm]);
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getPriority(techniqueScore, movementType) {
    if (techniqueScore < 40) return 'high';
    if (techniqueScore < 70) return 'medium';
    return 'low';
  }

  getFallbackFeedback(techniqueScore, movementType) {
    const fallbacks = [
      "Keep your form steady!",
      "Focus on your technique!",
      "You're doing great!",
      "Keep pushing!",
      "Stay focused!",
      "You've got this!",
      "Keep working hard!",
      "Stay strong!"
    ];
    
    return {
      tip: this.getRandomItem(fallbacks),
      priority: 'medium',
      confidence: 0.5,
      techniqueScore: techniqueScore || 50,
      timestamp: Date.now()
    };
  }

  async speak(text, priority = 'medium') {
    if (this.isSpeaking) {
      console.log('🎤 [TRAINER] Already speaking, skipping:', text);
      return;
    }

    try {
      this.isSpeaking = true;
      
      // Adjust speech settings based on priority
      const speechOptions = {
        language: 'en-US',
        pitch: this.personality.pitch,
        rate: priority === 'high' ? this.personality.rate * 1.1 : this.personality.rate,
        volume: priority === 'high' ? 1.0 : this.personality.volume,
        quality: Speech.VoiceQuality.Enhanced,
        onStart: () => console.log('🎤 [TRAINER] Started speaking:', text),
        onDone: () => {
          console.log('🎤 [TRAINER] Finished speaking');
          this.isSpeaking = false;
        },
        onStopped: () => {
          console.log('🎤 [TRAINER] Speech stopped');
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('🎤 [TRAINER] Speech error:', error);
          this.isSpeaking = false;
        }
      };

      await Speech.speak(text, speechOptions);
      
    } catch (error) {
      console.error('🎤 [TRAINER] Speech failed:', error);
      this.isSpeaking = false;
    }
  }

  addToHistory(feedback) {
    this.feedbackHistory.unshift(feedback);
    if (this.feedbackHistory.length > this.maxHistory) {
      this.feedbackHistory = this.feedbackHistory.slice(0, this.maxHistory);
    }
  }

  getHistory() {
    return this.feedbackHistory;
  }

  clearHistory() {
    this.feedbackHistory = [];
  }

  // Personality customization
  setPersonality(settings) {
    this.personality = { ...this.personality, ...settings };
    console.log('🎤 [TRAINER] Personality updated:', this.personality);
  }

  setEnthusiasm(level) {
    this.personality.enthusiasm = level;
  }

  setStyle(style) {
    this.personality.style = style;
  }

  setVolume(volume) {
    this.personality.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate) {
    this.personality.rate = Math.max(0.5, Math.min(2, rate));
  }

  setPitch(pitch) {
    this.personality.pitch = Math.max(0.5, Math.min(2, pitch));
  }

  // Control methods
  async stopSpeaking() {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  // Get trainer stats
  getStats() {
    const totalFeedback = this.feedbackHistory.length;
    const avgScore = totalFeedback > 0 
      ? this.feedbackHistory.reduce((sum, f) => sum + (f.techniqueScore || 0), 0) / totalFeedback
      : 0;
    
    return {
      totalFeedback,
      averageScore: Math.round(avgScore),
      isSpeaking: this.isSpeaking,
      personality: this.personality
    };
  }
}

export default PersonalTrainer;
