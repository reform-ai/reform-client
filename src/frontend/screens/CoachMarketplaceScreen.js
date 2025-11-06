import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CoachMarketplace, COACHES } from '../../core/marketplace/coachMarketplace';
import { getUserProfile } from '../../core/user/userProfile';
import styles from '../styles/appStyles';

const CoachMarketplaceScreen = ({ onBack }) => {
  const [marketplace] = useState(new CoachMarketplace());
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const specialties = ['All', 'Strength Training', 'Basketball', 'Yoga & Flexibility'];

  const handleBookSession = async (coach) => {
    try {
      const profile = getUserProfile();
      await profile.initialize();
      const user = profile.getProfile();
      
      // Check subscription
      const subscription = profile.getSubscriptionTier();
      if (subscription !== 'premium') {
        Alert.alert(
          'Premium Required',
          'Coach marketplace access requires Premium subscription. Upgrade to connect with trainers!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => {/* Navigate to subscription */} },
          ]
        );
        return;
      }

      const booking = marketplace.bookSession(
        coach.id,
        user.id,
        new Date().toISOString()
      );

      Alert.alert(
        '✅ Session Booked!',
        `You've booked a session with ${coach.name} for $${coach.price}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book session. Please try again.');
    }
  };

  const CoachCard = ({ coach }) => (
    <View style={marketplaceStyles.coachCard}>
      <View style={marketplaceStyles.coachHeader}>
        <View style={marketplaceStyles.coachInfo}>
          <Text style={marketplaceStyles.coachName}>{coach.name}</Text>
          <Text style={marketplaceStyles.coachSpecialty}>{coach.specialty}</Text>
        </View>
        <View style={marketplaceStyles.ratingContainer}>
          <Text style={marketplaceStyles.rating}>⭐ {coach.rating}</Text>
          <Text style={marketplaceStyles.reviews}>({coach.reviews} reviews)</Text>
        </View>
      </View>
      
      <Text style={marketplaceStyles.bio}>{coach.bio}</Text>
      
      <View style={marketplaceStyles.coachFooter}>
        <Text style={marketplaceStyles.price}>${coach.price}/session</Text>
        <TouchableOpacity
          style={marketplaceStyles.bookButton}
          onPress={() => handleBookSession(coach)}
        >
          <Text style={marketplaceStyles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const coaches = selectedSpecialty === 'All' || !selectedSpecialty
    ? marketplace.getAvailableCoaches()
    : marketplace.getAvailableCoaches(selectedSpecialty);

  return (
    <ScrollView style={styles.container} contentContainerStyle={marketplaceStyles.scrollContent}>
      <View style={marketplaceStyles.header}>
        <TouchableOpacity onPress={onBack} style={marketplaceStyles.backButton}>
          <Text style={marketplaceStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👥 Coach Marketplace</Text>
        <Text style={styles.subtitle}>Connect with certified trainers</Text>
      </View>

      {/* Specialty Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={marketplaceStyles.filterContainer}
      >
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              marketplaceStyles.filterButton,
              selectedSpecialty === specialty && marketplaceStyles.filterButtonActive
            ]}
            onPress={() => setSelectedSpecialty(specialty === 'All' ? null : specialty)}
          >
            <Text style={[
              marketplaceStyles.filterText,
              selectedSpecialty === specialty && marketplaceStyles.filterTextActive
            ]}>
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Coaches List */}
      <View style={marketplaceStyles.coachesContainer}>
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </View>

      {coaches.length === 0 && (
        <View style={marketplaceStyles.emptyState}>
          <Text style={marketplaceStyles.emptyText}>No coaches available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const marketplaceStyles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  coachesContainer: {
    marginBottom: 20,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  coachSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  reviews: {
    fontSize: 12,
    color: '#999',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  coachFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  bookButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CoachMarketplaceScreen;
