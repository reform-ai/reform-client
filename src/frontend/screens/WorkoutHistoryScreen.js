import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getUserProfile } from '../../core/user/userProfile';
import { AchievementsSystem, ACHIEVEMENTS } from '../../core/achievements/achievementsSystem';
import styles from '../styles/appStyles';

const WorkoutHistoryScreen = ({ onBack }) => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievementsSystem] = useState(new AchievementsSystem());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = getUserProfile();
      await profile.initialize();
      await achievementsSystem.initialize();

      const history = await profile.getWorkoutHistory();
      const stats = profile.getStats();
      const allAchievements = achievementsSystem.getAllAchievements();

      // Check for new achievements
      const newAchievements = await achievementsSystem.checkAchievements(stats);

      setWorkoutHistory(history);
      setUserStats(stats);
      setAchievements(allAchievements);

      if (newAchievements.length > 0) {
        // Show achievement notification
        console.log('🏆 New achievements unlocked:', newAchievements);
      }
    } catch (error) {
      console.error('📜 [HISTORY] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#ef4444';
    return '#999';
  };

  const WorkoutItem = ({ workout }) => (
    <View style={historyStyles.workoutCard}>
      <View style={historyStyles.workoutHeader}>
        <View style={historyStyles.workoutDateContainer}>
          <Text style={historyStyles.workoutDate}>{formatDate(workout.timestamp)}</Text>
          {workout.workoutType && (
            <Text style={historyStyles.workoutType}>{workout.workoutType}</Text>
          )}
        </View>
        {workout.score && (
          <View style={[historyStyles.scoreBadge, { backgroundColor: getScoreColor(workout.score) }]}>
            <Text style={historyStyles.scoreText}>{workout.score}/100</Text>
          </View>
        )}
      </View>
      
      {workout.duration && (
        <Text style={historyStyles.workoutDuration}>
          Duration: {Math.round(workout.duration)} minutes
        </Text>
      )}
    </View>
  );

  const AchievementCard = ({ achievement }) => {
    const progress = achievementsSystem.getProgress(achievement.id, userStats || {});
    const isUnlocked = achievement.unlocked;

    return (
      <View style={[
        historyStyles.achievementCard,
        isUnlocked && historyStyles.achievementUnlocked
      ]}>
        <Text style={historyStyles.achievementIcon}>
          {isUnlocked ? achievement.icon : '🔒'}
        </Text>
        <View style={historyStyles.achievementInfo}>
          <Text style={[
            historyStyles.achievementName,
            isUnlocked && historyStyles.achievementNameUnlocked
          ]}>
            {achievement.name}
          </Text>
          <Text style={historyStyles.achievementDescription}>
            {achievement.description}
          </Text>
          {!isUnlocked && (
            <View style={historyStyles.progressBar}>
              <View 
                style={[
                  historyStyles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={historyStyles.progressText}>{progress}%</Text>
          )}
        </View>
        {isUnlocked && (
          <View style={historyStyles.unlockedBadge}>
            <Text style={historyStyles.unlockedText}>✓</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={historyStyles.scrollContent}>
      <View style={historyStyles.header}>
        <TouchableOpacity onPress={onBack} style={historyStyles.backButton}>
          <Text style={historyStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📜 Workout History</Text>
        <Text style={styles.subtitle}>
          {workoutHistory.length} workouts completed
        </Text>
      </View>

      {/* Achievements Section */}
      <View style={historyStyles.section}>
        <View style={historyStyles.sectionHeader}>
          <Text style={historyStyles.sectionTitle}>🏆 Achievements</Text>
          <Text style={historyStyles.achievementCount}>
            {unlockedCount}/{totalCount}
          </Text>
        </View>
        
        <View style={historyStyles.achievementsGrid}>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      </View>

      {/* Workout History */}
      <View style={historyStyles.section}>
        <Text style={historyStyles.sectionTitle}>Recent Workouts</Text>
        
        {workoutHistory.length === 0 ? (
          <View style={historyStyles.emptyState}>
            <Text style={historyStyles.emptyText}>No workouts yet</Text>
            <Text style={historyStyles.emptySubtext}>
              Start analyzing to build your history!
            </Text>
          </View>
        ) : (
          <View style={historyStyles.workoutsList}>
            {workoutHistory.map((workout, index) => (
              <WorkoutItem key={workout.id || index} workout={workout} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const historyStyles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  achievementsGrid: {
    gap: 10,
  },
  achievementCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  achievementUnlocked: {
    backgroundColor: '#e8f5e8',
    opacity: 1,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  achievementNameUnlocked: {
    color: '#22c55e',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
  },
  unlockedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutsList: {
    gap: 10,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutDateContainer: {
    flex: 1,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 12,
    color: '#666',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutDuration: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default WorkoutHistoryScreen;
