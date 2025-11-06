/**
 * Workout Program Library
 * Premium workout programs for monetization
 */

export const WORKOUT_PROGRAMS = {
  BEGINNER_STRENGTH: {
    id: 'beginner_strength',
    name: 'Beginner Strength Training',
    description: 'Perfect for starting your strength journey',
    difficulty: 'beginner',
    duration: '4 weeks',
    price: 4.99,
    isPremium: false,
    exercises: [
      { name: 'Squats', sets: 3, reps: 10, rest: 60 },
      { name: 'Push-ups', sets: 3, reps: 10, rest: 60 },
      { name: 'Planks', sets: 3, duration: 30, rest: 60 },
    ],
  },
  ADVANCED_BASKETBALL: {
    id: 'advanced_basketball',
    name: 'Advanced Basketball Training',
    description: 'Elite shooting and form improvement',
    difficulty: 'advanced',
    duration: '8 weeks',
    price: 19.99,
    isPremium: true,
    exercises: [
      { name: 'Free Throw Practice', sets: 5, reps: 20, rest: 90 },
      { name: 'Three-Point Shooting', sets: 5, reps: 15, rest: 90 },
      { name: 'Form Drills', sets: 3, duration: 300, rest: 120 },
    ],
  },
  YOGA_FLOW: {
    id: 'yoga_flow',
    name: 'Yoga Flow Program',
    description: 'Improve flexibility and balance',
    difficulty: 'intermediate',
    duration: '6 weeks',
    price: 9.99,
    isPremium: true,
    exercises: [
      { name: 'Downward Dog', sets: 1, duration: 60, rest: 30 },
      { name: 'Warrior Poses', sets: 3, duration: 45, rest: 30 },
      { name: 'Tree Pose', sets: 2, duration: 60, rest: 30 },
    ],
  },
  HIIT_CARDIO: {
    id: 'hiit_cardio',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training',
    difficulty: 'intermediate',
    duration: '4 weeks',
    price: 9.99,
    isPremium: true,
    exercises: [
      { name: 'Burpees', sets: 4, reps: 15, rest: 60 },
      { name: 'Mountain Climbers', sets: 4, duration: 30, rest: 60 },
      { name: 'Jumping Jacks', sets: 4, reps: 20, rest: 60 },
    ],
  },
};

export class WorkoutProgramManager {
  constructor() {
    this.purchasedPrograms = [];
    this.activeProgram = null;
  }

  async loadPurchasedPrograms() {
    // In real app, this would load from AsyncStorage or backend
    return this.purchasedPrograms;
  }

  async purchaseProgram(programId) {
    const program = WORKOUT_PROGRAMS[programId];
    if (!program) {
      throw new Error('Program not found');
    }

    // Check if already purchased
    if (this.purchasedPrograms.includes(programId)) {
      return { success: false, message: 'Already purchased' };
    }

    // In real app, this would process payment
    this.purchasedPrograms.push(programId);
    
    return { 
      success: true, 
      message: `Purchased ${program.name} for $${program.price}`,
      program 
    };
  }

  getProgram(programId) {
    return WORKOUT_PROGRAMS[programId];
  }

  getAllPrograms() {
    return Object.values(WORKOUT_PROGRAMS);
  }

  getAvailablePrograms(subscriptionTier) {
    const allPrograms = this.getAllPrograms();
    
    if (subscriptionTier === 'premium') {
      return allPrograms; // Premium gets all programs
    }
    
    if (subscriptionTier === 'pro') {
      return allPrograms.filter(p => !p.isPremium || this.purchasedPrograms.includes(p.id));
    }
    
    // Free tier - only free programs
    return allPrograms.filter(p => !p.isPremium);
  }

  startProgram(programId) {
    const program = this.getProgram(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    this.activeProgram = {
      programId,
      program,
      startDate: new Date().toISOString(),
      currentWeek: 1,
      completedExercises: [],
    };

    return this.activeProgram;
  }

  getActiveProgram() {
    return this.activeProgram;
  }
}

export default WorkoutProgramManager;
