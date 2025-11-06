/**
 * User Profile Management System
 * Handles user data, subscriptions, and progress tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  SUBSCRIPTION: 'user_subscription',
  WORKOUT_HISTORY: 'workout_history',
  ACHIEVEMENTS: 'user_achievements',
  STATS: 'user_stats',
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
};

export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    videosPerMonth: 5,
    aiFeedbackPerDay: 10,
    workoutPlans: 0,
    coachAccess: false,
    analytics: false,
    customPrograms: false,
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    videosPerMonth: -1, // Unlimited
    aiFeedbackPerDay: -1,
    workoutPlans: 3,
    coachAccess: false,
    analytics: true,
    customPrograms: false,
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    videosPerMonth: -1,
    aiFeedbackPerDay: -1,
    workoutPlans: -1,
    coachAccess: true,
    analytics: true,
    customPrograms: true,
  },
};

export class UserProfile {
  constructor() {
    this.profile = null;
    this.subscription = null;
  }

  async initialize() {
    try {
      await this.loadProfile();
      await this.loadSubscription();
      return true;
    } catch (error) {
      console.error('👤 [USER] Failed to initialize profile:', error);
      return false;
    }
  }

  async loadProfile() {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileData) {
        this.profile = JSON.parse(profileData);
      } else {
        // Create default profile
        this.profile = this.createDefaultProfile();
        await this.saveProfile();
      }
      return this.profile;
    } catch (error) {
      console.error('👤 [USER] Failed to load profile:', error);
      this.profile = this.createDefaultProfile();
      return this.profile;
    }
  }

  createDefaultProfile() {
    return {
      id: this.generateUserId(),
      name: 'User',
      email: null,
      createdAt: new Date().toISOString(),
      avatar: null,
      preferences: {
        units: 'metric', // metric or imperial
        notifications: true,
        autoSave: true,
        theme: 'dark',
      },
      stats: {
        totalWorkouts: 0,
        totalVideos: 0,
        totalMinutes: 0,
        averageScore: 0,
        bestScore: 0,
        streak: 0,
        lastWorkoutDate: null,
      },
    };
  }

  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async saveProfile() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
      return true;
    } catch (error) {
      console.error('👤 [USER] Failed to save profile:', error);
      return false;
    }
  }

  async loadSubscription() {
    try {
      const subData = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (subData) {
        this.subscription = JSON.parse(subData);
      } else {
        // Default to free tier
        this.subscription = {
          tier: SUBSCRIPTION_TIERS.FREE,
          startDate: new Date().toISOString(),
          endDate: null,
          isActive: true,
          paymentMethod: null,
        };
        await this.saveSubscription();
      }
      return this.subscription;
    } catch (error) {
      console.error('👤 [USER] Failed to load subscription:', error);
      this.subscription = {
        tier: SUBSCRIPTION_TIERS.FREE,
        startDate: new Date().toISOString(),
        endDate: null,
        isActive: true,
      };
      return this.subscription;
    }
  }

  async saveSubscription() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(this.subscription));
      return true;
    } catch (error) {
      console.error('👤 [USER] Failed to save subscription:', error);
      return false;
    }
  }

  async upgradeSubscription(tier) {
    if (!Object.values(SUBSCRIPTION_TIERS).includes(tier)) {
      throw new Error('Invalid subscription tier');
    }

    this.subscription = {
      tier,
      startDate: new Date().toISOString(),
      endDate: null, // Set based on billing cycle
      isActive: true,
      paymentMethod: 'in_app', // Would be set by payment system
    };

    await this.saveSubscription();
    console.log(`👤 [USER] Upgraded to ${tier} tier`);
    return this.subscription;
  }

  getSubscriptionTier() {
    return this.subscription?.tier || SUBSCRIPTION_TIERS.FREE;
  }

  getSubscriptionLimits() {
    const tier = this.getSubscriptionTier();
    return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS[SUBSCRIPTION_TIERS.FREE];
  }

  canUploadVideo() {
    const limits = this.getSubscriptionLimits();
    if (limits.videosPerMonth === -1) return true; // Unlimited

    // Check monthly usage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const videosThisMonth = this.profile?.stats?.videosThisMonth || 0;
    
    return videosThisMonth < limits.videosPerMonth;
  }

  async recordVideoUpload() {
    if (!this.profile) await this.loadProfile();
    
    this.profile.stats.totalVideos += 1;
    this.profile.stats.videosThisMonth = (this.profile.stats.videosThisMonth || 0) + 1;
    
    await this.saveProfile();
  }

  async recordWorkout(workoutData) {
    if (!this.profile) await this.loadProfile();

    const { duration, score, workoutType } = workoutData;
    
    this.profile.stats.totalWorkouts += 1;
    this.profile.stats.totalMinutes += duration || 0;
    
    if (score) {
      const currentAvg = this.profile.stats.averageScore;
      const totalWorkouts = this.profile.stats.totalWorkouts;
      this.profile.stats.averageScore = ((currentAvg * (totalWorkouts - 1)) + score) / totalWorkouts;
      
      if (score > this.profile.stats.bestScore) {
        this.profile.stats.bestScore = score;
      }
    }

    // Update streak
    const lastDate = this.profile.stats.lastWorkoutDate;
    const today = new Date().toDateString();
    if (lastDate === today) {
      // Same day, no streak change
    } else if (lastDate && this.isConsecutiveDay(lastDate, today)) {
      this.profile.stats.streak += 1;
    } else {
      this.profile.stats.streak = 1;
    }
    
    this.profile.stats.lastWorkoutDate = today;
    
    await this.saveProfile();
    await this.saveWorkoutHistory(workoutData);
  }

  isConsecutiveDay(lastDate, today) {
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffTime = Math.abs(current - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  async saveWorkoutHistory(workoutData) {
    try {
      const history = await this.getWorkoutHistory();
      history.unshift({
        ...workoutData,
        timestamp: new Date().toISOString(),
        id: `workout_${Date.now()}`,
      });
      
      // Keep only last 100 workouts
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('👤 [USER] Failed to save workout history:', error);
    }
  }

  async getWorkoutHistory() {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('👤 [USER] Failed to load workout history:', error);
      return [];
    }
  }

  getProfile() {
    return this.profile;
  }

  getStats() {
    return this.profile?.stats || {};
  }

  async updateProfile(updates) {
    if (!this.profile) await this.loadProfile();
    
    this.profile = { ...this.profile, ...updates };
    await this.saveProfile();
    return this.profile;
  }

  async resetMonthlyStats() {
    if (!this.profile) await this.loadProfile();
    
    this.profile.stats.videosThisMonth = 0;
    await this.saveProfile();
  }
}

// Singleton instance
let userProfileInstance = null;

export const getUserProfile = () => {
  if (!userProfileInstance) {
    userProfileInstance = new UserProfile();
  }
  return userProfileInstance;
};

export default UserProfile;
