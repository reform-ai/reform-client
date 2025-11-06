import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SocialFeatures } from '../../core/social/socialFeatures';
import { getUserProfile } from '../../core/user/userProfile';
import styles from '../styles/appStyles';

const ShareScreen = ({ onBack, workoutData = null }) => {
  const [social] = useState(new SocialFeatures());
  const [shareText, setShareText] = useState('');

  React.useEffect(() => {
    if (workoutData) {
      const text = social.generateShareText(workoutData);
      setShareText(text);
    }
  }, [workoutData]);

  const handleShare = async (platform) => {
    try {
      // In real app, use expo-sharing or react-native-share
      Alert.alert(
        'Share to ' + platform,
        shareText,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: () => {
            // Actual sharing implementation
            Alert.alert('Shared!', `Shared to ${platform}`);
          }},
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const ShareButton = ({ platform, icon, color }) => (
    <TouchableOpacity
      style={[shareStyles.shareButton, { borderColor: color }]}
      onPress={() => handleShare(platform)}
    >
      <Text style={shareStyles.shareIcon}>{icon}</Text>
      <Text style={[shareStyles.shareText, { color }]}>{platform}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={shareStyles.scrollContent}>
      <View style={shareStyles.header}>
        <TouchableOpacity onPress={onBack} style={shareStyles.backButton}>
          <Text style={shareStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📤 Share Your Progress</Text>
        <Text style={styles.subtitle}>Show off your achievements!</Text>
      </View>

      {/* Share Preview */}
      <View style={shareStyles.previewCard}>
        <Text style={shareStyles.previewTitle}>Share Preview</Text>
        <Text style={shareStyles.previewText}>{shareText || 'No workout data to share'}</Text>
      </View>

      {/* Share Options */}
      <View style={shareStyles.shareSection}>
        <Text style={shareStyles.sectionTitle}>Share To</Text>
        <View style={shareStyles.shareGrid}>
          <ShareButton platform="Instagram" icon="📷" color="#E4405F" />
          <ShareButton platform="Twitter" icon="🐦" color="#1DA1F2" />
          <ShareButton platform="Facebook" icon="👥" color="#1877F2" />
          <ShareButton platform="Messages" icon="💬" color="#34C759" />
          <ShareButton platform="Email" icon="📧" color="#FF6B35" />
          <ShareButton platform="Copy Link" icon="🔗" color="#8b5cf6" />
        </View>
      </View>

      {/* Leaderboard */}
      <View style={shareStyles.leaderboardSection}>
        <Text style={shareStyles.sectionTitle}>🏆 Top Scores</Text>
        <View style={shareStyles.leaderboard}>
          {social.getTopScores(5).map((entry, index) => (
            <View key={index} style={shareStyles.leaderboardItem}>
              <Text style={shareStyles.rank}>#{entry.rank}</Text>
              <Text style={shareStyles.score}>{entry.score}/100</Text>
              <Text style={shareStyles.workoutType}>{entry.workoutType || 'Workout'}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const shareStyles = StyleSheet.create({
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
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  shareSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shareIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
  },
  leaderboard: {
    marginTop: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    width: 40,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 80,
  },
  workoutType: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default ShareScreen;
