import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getUserProfile, SUBSCRIPTION_TIERS, SUBSCRIPTION_LIMITS } from '../../core/user/userProfile';
import styles from '../styles/appStyles';

const SubscriptionScreen = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = getUserProfile();
      await profile.initialize();
      const userData = profile.getProfile();
      const subData = profile.getSubscriptionTier();
      
      setUserProfile(userData);
      setSubscription(subData);
    } catch (error) {
      console.error('💳 [SUBSCRIPTION] Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    try {
      const profile = getUserProfile();
      await profile.upgradeSubscription(tier);
      
      Alert.alert(
        '🎉 Upgrade Successful!',
        `You've upgraded to ${tier.toUpperCase()} tier!`,
        [{ text: 'OK', onPress: () => loadUserData() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
    }
  };

  const SubscriptionCard = ({ tier, price, features, isCurrent, isPremium }) => {
    const limits = SUBSCRIPTION_LIMITS[tier];
    
    return (
      <View style={[subscriptionStyles.card, isCurrent && subscriptionStyles.currentCard, isPremium && subscriptionStyles.premiumCard]}>
        {isPremium && (
          <View style={subscriptionStyles.badge}>
            <Text style={subscriptionStyles.badgeText}>POPULAR</Text>
          </View>
        )}
        
        <Text style={subscriptionStyles.tierName}>{tier.toUpperCase()}</Text>
        <Text style={subscriptionStyles.price}>
          {price === 0 ? 'FREE' : `$${price}/month`}
        </Text>
        
        <View style={subscriptionStyles.features}>
          <FeatureItem 
            text={limits.videosPerMonth === -1 ? 'Unlimited videos' : `${limits.videosPerMonth} videos/month`}
            included={true}
          />
          <FeatureItem 
            text={limits.aiFeedbackPerDay === -1 ? 'Unlimited AI feedback' : `${limits.aiFeedbackPerDay} feedback/day`}
            included={true}
          />
          <FeatureItem 
            text={limits.workoutPlans === -1 ? 'All workout plans' : `${limits.workoutPlans} workout plans`}
            included={limits.workoutPlans > 0}
          />
          <FeatureItem 
            text="Advanced analytics"
            included={limits.analytics}
          />
          <FeatureItem 
            text="Coach marketplace access"
            included={limits.coachAccess}
          />
          <FeatureItem 
            text="Custom workout programs"
            included={limits.customPrograms}
          />
        </View>
        
        {isCurrent ? (
          <View style={subscriptionStyles.currentButton}>
            <Text style={subscriptionStyles.currentButtonText}>Current Plan</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[subscriptionStyles.upgradeButton, isPremium && subscriptionStyles.premiumButton]}
            onPress={() => handleUpgrade(tier)}
          >
            <Text style={[subscriptionStyles.upgradeButtonText, isPremium && subscriptionStyles.premiumButtonText]}>
              {tier === SUBSCRIPTION_TIERS.FREE ? 'Get Started' : 'Upgrade Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const FeatureItem = ({ text, included }) => (
    <View style={subscriptionStyles.featureItem}>
      <Text style={subscriptionStyles.featureIcon}>{included ? '✓' : '✗'}</Text>
      <Text style={[subscriptionStyles.featureText, !included && subscriptionStyles.featureTextDisabled]}>
        {text}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={subscriptionStyles.scrollContent}>
      <View style={subscriptionStyles.header}>
        <TouchableOpacity onPress={onBack} style={subscriptionStyles.backButton}>
          <Text style={subscriptionStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💳 Subscription Plans</Text>
        <Text style={styles.subtitle}>
          Choose the plan that's right for you
        </Text>
      </View>

      <View style={subscriptionStyles.plansContainer}>
        <SubscriptionCard
          tier={SUBSCRIPTION_TIERS.FREE}
          price={0}
          isCurrent={subscription === SUBSCRIPTION_TIERS.FREE}
          isPremium={false}
        />
        
        <SubscriptionCard
          tier={SUBSCRIPTION_TIERS.PRO}
          price={9.99}
          isCurrent={subscription === SUBSCRIPTION_TIERS.PRO}
          isPremium={false}
        />
        
        <SubscriptionCard
          tier={SUBSCRIPTION_TIERS.PREMIUM}
          price={19.99}
          isCurrent={subscription === SUBSCRIPTION_TIERS.PREMIUM}
          isPremium={true}
        />
      </View>

      <View style={subscriptionStyles.infoSection}>
        <Text style={subscriptionStyles.infoTitle}>Why Upgrade?</Text>
        <Text style={subscriptionStyles.infoText}>
          • Unlimited video analysis and AI feedback{'\n'}
          • Access to premium workout programs{'\n'}
          • Advanced analytics and progress tracking{'\n'}
          • Connect with certified personal trainers{'\n'}
          • Custom workout programs tailored to you{'\n'}
          • Priority support and early access to features
        </Text>
      </View>

      <View style={subscriptionStyles.statsSection}>
        <Text style={subscriptionStyles.statsTitle}>Your Stats</Text>
        {userProfile && (
          <View style={subscriptionStyles.statsGrid}>
            <View style={subscriptionStyles.statItem}>
              <Text style={subscriptionStyles.statValue}>{userProfile.stats.totalWorkouts}</Text>
              <Text style={subscriptionStyles.statLabel}>Workouts</Text>
            </View>
            <View style={subscriptionStyles.statItem}>
              <Text style={subscriptionStyles.statValue}>{userProfile.stats.totalVideos}</Text>
              <Text style={subscriptionStyles.statLabel}>Videos</Text>
            </View>
            <View style={subscriptionStyles.statItem}>
              <Text style={subscriptionStyles.statValue}>{userProfile.stats.streak}</Text>
              <Text style={subscriptionStyles.statLabel}>Day Streak</Text>
            </View>
            <View style={subscriptionStyles.statItem}>
              <Text style={subscriptionStyles.statValue}>{Math.round(userProfile.stats.averageScore)}</Text>
              <Text style={subscriptionStyles.statLabel}>Avg Score</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const subscriptionStyles = StyleSheet.create({
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
  plansContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  currentCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  featureTextDisabled: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  upgradeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#FF6B35',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumButtonText: {
    color: '#fff',
  },
  currentButton: {
    backgroundColor: '#e5e5e5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 15,
    minWidth: '45%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default SubscriptionScreen;
