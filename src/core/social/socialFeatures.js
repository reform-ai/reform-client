/**
 * Social Features - Sharing & Leaderboards
 * Concise social functionality for engagement
 */

export class SocialFeatures {
  constructor() {
    this.leaderboard = [];
    this.challenges = [];
  }

  // Share workout results
  generateShareText(workoutData) {
    const { score, workoutType, duration } = workoutData;
    return `💪 Just scored ${score}/100 on ${workoutType || 'my workout'} with Reform! 
    
🎯 ${duration ? `${Math.round(duration)} minutes` : 'Check out my form!'}
    
Download Reform: [App Store Link]`;
  }

  // Leaderboard entry
  createLeaderboardEntry(userId, score, workoutType) {
    return {
      userId,
      score,
      workoutType,
      timestamp: new Date().toISOString(),
      rank: 0, // Calculated when sorted
    };
  }

  // Get top scores
  getTopScores(limit = 10) {
    return this.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }

  // Weekly challenge
  createWeeklyChallenge(name, goal, reward) {
    return {
      id: `challenge_${Date.now()}`,
      name,
      goal,
      reward,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [],
    };
  }
}

export default SocialFeatures;
