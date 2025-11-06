/**
 * Achievements System
 * Tracks and unlocks user achievements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'user_achievements';

export const ACHIEVEMENTS = {
  FIRST_WORKOUT: {
    id: 'first_workout',
    name: 'Getting Started',
    description: 'Complete your first workout',
    icon: '🎯',
    rarity: 'common',
    requirement: { type: 'workouts', count: 1 },
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'uncommon',
    requirement: { type: 'streak', count: 7 },
  },
  FORM_MASTER: {
    id: 'form_master',
    name: 'Form Master',
    description: 'Score 90+ on a workout',
    icon: '⭐',
    rarity: 'rare',
    requirement: { type: 'score', value: 90 },
  },
  VIDEO_PRO: {
    id: 'video_pro',
    name: 'Video Pro',
    description: 'Analyze 50 videos',
    icon: '📹',
    rarity: 'uncommon',
    requirement: { type: 'videos', count: 50 },
  },
  MONTH_DEDICATED: {
    id: 'month_dedicated',
    name: 'Month Dedicated',
    description: 'Complete 30 workouts in a month',
    icon: '📅',
    rarity: 'rare',
    requirement: { type: 'monthly_workouts', count: 30 },
  },
  PERFECT_FORM: {
    id: 'perfect_form',
    name: 'Perfect Form',
    description: 'Score 100 on a workout',
    icon: '💎',
    rarity: 'epic',
    requirement: { type: 'score', value: 100 },
  },
  HUNDRED_CLUB: {
    id: 'hundred_club',
    name: 'Hundred Club',
    description: 'Complete 100 total workouts',
    icon: '🏆',
    rarity: 'legendary',
    requirement: { type: 'workouts', count: 100 },
  },
};

export class AchievementsSystem {
  constructor() {
    this.unlockedAchievements = [];
  }

  async initialize() {
    await this.loadAchievements();
  }

  async loadAchievements() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      this.unlockedAchievements = data ? JSON.parse(data) : [];
      return this.unlockedAchievements;
    } catch (error) {
      console.error('🏆 [ACHIEVEMENTS] Failed to load:', error);
      this.unlockedAchievements = [];
      return [];
    }
  }

  async saveAchievements() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlockedAchievements));
      return true;
    } catch (error) {
      console.error('🏆 [ACHIEVEMENTS] Failed to save:', error);
      return false;
    }
  }

  async checkAchievements(userStats) {
    const newAchievements = [];
    
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if already unlocked
      if (this.unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      // Check requirement
      if (this.meetsRequirement(achievement.requirement, userStats)) {
        await this.unlockAchievement(achievement.id);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  meetsRequirement(requirement, stats) {
    switch (requirement.type) {
      case 'workouts':
        return stats.totalWorkouts >= requirement.count;
      case 'streak':
        return stats.streak >= requirement.count;
      case 'score':
        return stats.bestScore >= requirement.value;
      case 'videos':
        return stats.totalVideos >= requirement.count;
      case 'monthly_workouts':
        return (stats.workoutsThisMonth || 0) >= requirement.count;
      default:
        return false;
    }
  }

  async unlockAchievement(achievementId) {
    if (!this.unlockedAchievements.includes(achievementId)) {
      this.unlockedAchievements.push(achievementId);
      await this.saveAchievements();
      console.log('🏆 [ACHIEVEMENTS] Unlocked:', achievementId);
      return true;
    }
    return false;
  }

  isUnlocked(achievementId) {
    return this.unlockedAchievements.includes(achievementId);
  }

  getUnlockedAchievements() {
    return this.unlockedAchievements
      .map(id => Object.values(ACHIEVEMENTS).find(a => a.id === id))
      .filter(Boolean);
  }

  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.isUnlocked(achievement.id),
    }));
  }

  getProgress(achievementId, userStats) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return 0;

    const requirement = achievement.requirement;
    let current = 0;
    let target = 0;

    switch (requirement.type) {
      case 'workouts':
        current = userStats.totalWorkouts || 0;
        target = requirement.count;
        break;
      case 'streak':
        current = userStats.streak || 0;
        target = requirement.count;
        break;
      case 'score':
        current = userStats.bestScore || 0;
        target = requirement.value;
        break;
      case 'videos':
        current = userStats.totalVideos || 0;
        target = requirement.count;
        break;
      case 'monthly_workouts':
        current = userStats.workoutsThisMonth || 0;
        target = requirement.count;
        break;
      default:
        return 0;
    }

    return Math.min(100, Math.round((current / target) * 100));
  }
}

export default AchievementsSystem;
