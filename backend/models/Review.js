import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Optional, in case review is given independently
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return v >= 1 && v <= 5 && Number.isInteger(v);
      },
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
    minlength: [10, 'Review must be at least 10 characters long']
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve reviews, admin can moderate later
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove the problematic unique index and use application-level validation instead
// This allows the backend controller to handle duplicate review logic properly

// Virtual for populating patient info
reviewSchema.virtual('patientInfo', {
  ref: 'User',
  localField: 'patient',
  foreignField: '_id',
  justOne: true
});

// Virtual for populating doctor info
reviewSchema.virtual('doctorInfo', {
  ref: 'User',
  localField: 'doctor',
  foreignField: '_id',
  justOne: true
});

// Static method to calculate average rating for a doctor
reviewSchema.statics.calculateAverageRating = async function(doctorId) {
  const result = await this.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId), isApproved: true } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const stats = result[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    return {
      averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats.totalReviews,
      distribution
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

// Instance method to check if review can be edited
reviewSchema.methods.canBeEditedBy = function(userId) {
  return this.patient.toString() === userId.toString();
};

// Pre-save middleware to update doctor's rating stats
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const stats = await Review.calculateAverageRating(this.doctor);
  
  // Update doctor's rating in User model
  await mongoose.model('User').findByIdAndUpdate(this.doctor, {
    'doctorProfile.averageRating': stats.averageRating,
    'doctorProfile.totalReviews': stats.totalReviews,
    'doctorProfile.ratingDistribution': stats.distribution
  });
});

// Pre-remove middleware to update doctor's rating stats
reviewSchema.post('findOneAndDelete', async function() {
  if (this.doctor) {
    const Review = mongoose.model('Review');
    const stats = await Review.calculateAverageRating(this.doctor);
    
    // Update doctor's rating in User model
    await mongoose.model('User').findByIdAndUpdate(this.doctor, {
      'doctorProfile.averageRating': stats.averageRating,
      'doctorProfile.totalReviews': stats.totalReviews,
      'doctorProfile.ratingDistribution': stats.distribution
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
