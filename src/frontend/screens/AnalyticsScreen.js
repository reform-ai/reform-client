import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { getUserProfile } from '../../core/user/userProfile';
import styles from '../styles/appStyles';

const AnalyticsScreen = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const profile = getUserProfile();
      await profile.initialize();
      const userData = profile.getProfile();
      const history = await profile.getWorkoutHistory();
      
      setUserProfile(userData);
      setWorkoutHistory(history);
    } catch (error) {
      console.error('📊 [ANALYTICS] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressData = () => {
    if (!workoutHistory.length) return null;

    const last7Days = workoutHistory.slice(0, 7);
    const last30Days = workoutHistory.slice(0, 30);

    return {
      workoutsLast7Days: last7Days.length,
      workoutsLast30Days: last30Days.length,
      averageScoreLast7Days: last7Days.reduce((sum, w) => sum + (w.score || 0), 0) / last7Days.length,
      averageScoreLast30Days: last30Days.reduce((sum, w) => sum + (w.score || 0), 0) / last30Days.length,
      totalMinutes: workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0),
    };
  };

  const StatCard = ({ title, value, subtitle, color = '#FF6B35' }) => (
    <View style={[analyticsStyles.statCard, { borderLeftColor: color }]}>
      <Text style={analyticsStyles.statValue}>{value}</Text>
      <Text style={analyticsStyles.statTitle}>{title}</Text>
      {subtitle && <Text style={analyticsStyles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading analytics...</Text>
      </View>
    );
  }

  const stats = userProfile?.stats || {};
  const progress = getProgressData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={analyticsStyles.scrollContent}>
      <View style={analyticsStyles.header}>
        <Text style={styles.title}>📊 Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      {/* Key Stats */}
      <View style={analyticsStyles.section}>
        <Text style={analyticsStyles.sectionTitle}>Overview</Text>
        <View style={analyticsStyles.statsGrid}>
          <StatCard
            title="Total Workouts"
            value={stats.totalWorkouts || 0}
            subtitle="All time"
            color="#22c55e"
          />
          <StatCard
            title="Total Videos"
            value={stats.totalVideos || 0}
            subtitle="Analyzed"
            color="#4ECDC4"
          />
          <StatCard
            title="Current Streak"
            value={`${stats.streak || 0} days`}
            subtitle="Keep it up!"
            color="#FF6B35"
          />
          <StatCard
            title="Average Score"
            value={Math.round(stats.averageScore || 0)}
            subtitle="Out of 100"
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Progress Tracking */}
      {progress && (
        <View style={analyticsStyles.section}>
          <Text style={analyticsStyles.sectionTitle}>Recent Progress</Text>
          <View style={analyticsStyles.progressCard}>
            <View style={analyticsStyles.progressRow}>
              <Text style={analyticsStyles.progressLabel}>Workouts (Last 7 days)</Text>
              <Text style={analyticsStyles.progressValue}>{progress.workoutsLast7Days}</Text>
            </View>
            <View style={analyticsStyles.progressRow}>
              <Text style={analyticsStyles.progressLabel}>Workouts (Last 30 days)</Text>
              <Text style={analyticsStyles.progressValue}>{progress.workoutsLast30Days}</Text>
            </View>
            <View style={analyticsStyles.progressRow}>
              <Text style={analyticsStyles.progressLabel}>Avg Score (Last 7 days)</Text>
              <Text style={analyticsStyles.progressValue}>
                {Math.round(progress.averageScoreLast7Days)}/100
              </Text>
            </View>
            <View style={analyticsStyles.progressRow}>
              <Text style={analyticsStyles.progressLabel}>Total Minutes</Text>
              <Text style={analyticsStyles.progressValue}>{Math.round(progress.totalMinutes)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View style={analyticsStyles.section}>
        <Text style={analyticsStyles.sectionTitle}>Achievements</Text>
        <View style={analyticsStyles.achievementsGrid}>
          <AchievementBadge
            unlocked={stats.totalWorkouts >= 10}
            title="Getting Started"
            description="Complete 10 workouts"
          />
          <AchievementBadge
            unlocked={stats.streak >= 7}
            title="Week Warrior"
            description="7 day streak"
          />
          <AchievementBadge
            unlocked={stats.bestScore >= 90}
            title="Form Master"
            description="Score 90+ on a workout"
          />
          <AchievementBadge
            unlocked={stats.totalVideos >= 50}
            title="Video Pro"
            description="Analyze 50 videos"
          />
        </View>
      </View>

      {/* Recent Workouts */}
      {workoutHistory.length > 0 && (
        <View style={analyticsStyles.section}>
          <Text style={analyticsStyles.sectionTitle}>Recent Workouts</Text>
          {workoutHistory.slice(0, 5).map((workout, index) => (
            <View key={index} style={analyticsStyles.workoutItem}>
              <View style={analyticsStyles.workoutHeader}>
                <Text style={analyticsStyles.workoutDate}>
                  {new Date(workout.timestamp).toLocaleDateString()}
                </Text>
                <Text style={analyticsStyles.workoutScore}>
                  Score: {workout.score || 'N/A'}/100
                </Text>
              </View>
              {workout.workoutType && (
                <Text style={analyticsStyles.workoutType}>{workout.workoutType}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const AchievementBadge = ({ unlocked, title, description }) => (
  <View style={[analyticsStyles.achievementBadge, unlocked && analyticsStyles.achievementUnlocked]}>
    <Text style={[analyticsStyles.achievementIcon, unlocked && analyticsStyles.achievementIconUnlocked]}>
      {unlocked ? '🏆' : '🔒'}
    </Text>
    <Text style={[analyticsStyles.achievementTitle, unlocked && analyticsStyles.achievementTitleUnlocked]}>
      {title}
    </Text>
    <Text style={analyticsStyles.achievementDescription}>{description}</Text>
  </View>
);

const analyticsStyles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    opacity: 0.6,
  },
  achievementUnlocked: {
    backgroundColor: '#e8f5e8',
    opacity: 1,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  achievementIconUnlocked: {
    // Icon stays the same
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  achievementTitleUnlocked: {
    color: '#22c55e',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  workoutItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  workoutScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  workoutType: {
    fontSize: 12,
    color: '#999',
  },
});

export default AnalyticsScreen;
