/**
 * Coach Marketplace - Connect Users with Trainers
 * Simplified marketplace for trainer connections
 */

export const COACHES = [
  {
    id: 'coach_1',
    name: 'Sarah Johnson',
    specialty: 'Strength Training',
    rating: 4.9,
    reviews: 127,
    price: 49.99,
    image: null,
    bio: 'Certified personal trainer with 10+ years experience',
    available: true,
  },
  {
    id: 'coach_2',
    name: 'Mike Chen',
    specialty: 'Basketball',
    rating: 4.8,
    reviews: 89,
    price: 59.99,
    image: null,
    bio: 'Former college basketball coach, form specialist',
    available: true,
  },
  {
    id: 'coach_3',
    name: 'Emma Davis',
    specialty: 'Yoga & Flexibility',
    rating: 5.0,
    reviews: 203,
    price: 39.99,
    image: null,
    bio: 'Yoga instructor and movement therapist',
    available: true,
  },
];

export class CoachMarketplace {
  constructor() {
    this.bookings = [];
  }

  // Get available coaches
  getAvailableCoaches(specialty = null) {
    let coaches = COACHES.filter(c => c.available);
    
    if (specialty) {
      coaches = coaches.filter(c => 
        c.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    
    return coaches.sort((a, b) => b.rating - a.rating);
  }

  // Book a session
  bookSession(coachId, userId, date, duration = 60) {
    const coach = COACHES.find(c => c.id === coachId);
    if (!coach) {
      throw new Error('Coach not found');
    }

    const booking = {
      id: `booking_${Date.now()}`,
      coachId,
      coachName: coach.name,
      userId,
      date,
      duration,
      price: coach.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(booking);
    return booking;
  }

  // Get user bookings
  getUserBookings(userId) {
    return this.bookings.filter(b => b.userId === userId);
  }
}

export default CoachMarketplace;
