import Review from '../models/Review.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Patient only)
export const createReview = async (req, res) => {
  try {
    const { doctorId, rating, review, appointmentId, isAnonymous = false } = req.body;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const patientId = req.user._id;

    // Validate required fields
    if (!doctorId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, rating, and review are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Validate review length
    if (review.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review must be at least 10 characters long'
      });
    }

    if (review.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Review cannot exceed 500 characters'
      });
    }

    // Validate patient role
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can create reviews'
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    if (appointmentId && !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if patient has already reviewed this doctor for this specific appointment
    let existingReviewQuery = {
      doctor: doctorId,
      patient: patientId
    };

    // If appointment ID is provided, check for review on this specific appointment
    // If no appointment ID, check if patient has already reviewed this doctor (general review)
    if (appointmentId) {
      existingReviewQuery.appointment = appointmentId;
    } else {
      existingReviewQuery.appointment = { $exists: false };
    }

    const existingReview = await Review.findOne(existingReviewQuery);

    if (existingReview) {
      const message = appointmentId 
        ? 'You have already reviewed this appointment'
        : 'You have already given a general review for this doctor';
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Validate appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || 
          appointment.patient.toString() !== patientId.toString() || 
          appointment.doctor.toString() !== doctorId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment for this review'
        });
      }

      // Check if appointment is eligible for review
      // Only completed appointments or appointments cancelled by doctor are eligible
      if (appointment.status === 'cancelled') {
        if (!appointment.cancelledBy || appointment.cancelledBy.toString() !== doctorId.toString()) {
          return res.status(400).json({
            success: false,
            message: 'You can only review appointments that were cancelled by the doctor'
          });
        }
      } else if (appointment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'You can only review completed appointments or appointments cancelled by the doctor'
        });
      }
    } else {
      // If no appointment ID is provided, we need to verify the patient has at least one eligible appointment with this doctor
      const eligibleAppointment = await Appointment.findOne({
        patient: patientId,
        doctor: doctorId,
        $or: [
          { status: 'completed' },
          { 
            status: 'cancelled',
            cancelledBy: doctorId
          }
        ]
      });

      if (!eligibleAppointment) {
        return res.status(400).json({
          success: false,
          message: 'You can only review doctors after completing an appointment or if the doctor cancelled your appointment'
        });
      }
    }

    // Create the review
    const newReview = new Review({
      doctor: doctorId,
      patient: patientId,
      appointment: appointmentId || undefined,
      rating,
      review: review.trim(),
      isAnonymous
    });

    await newReview.save();

    // Populate the review with patient info (if not anonymous)
    await newReview.populate([
      {
        path: 'patient',
        select: 'name avatar',
        transform: function(doc) {
          if (newReview.isAnonymous) {
            return { name: 'Anonymous', avatar: null };
          }
          return doc;
        }
      },
      {
        path: 'doctor',
        select: 'name specialization'
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this doctor for this appointment'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format provided'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const reviews = await Review.find({
      doctor: doctorId,
      isApproved: true
    })
    .populate({
      path: 'patient',
      select: 'name avatar',
      transform: function(doc, ret) {
        if (ret && this.isAnonymous) {
          return { name: 'Anonymous', avatar: null };
        }
        return doc;
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count
    const totalReviews = await Review.countDocuments({
      doctor: doctorId,
      isApproved: true
    });

    // Get rating statistics
    const ratingStats = await Review.calculateAverageRating(doctorId);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        ratingStats
      }
    });

  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews by a patient
// @route   GET /api/reviews/patient
// @access  Private (Patient only)
export const getPatientReviews = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access this endpoint'
      });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ patient: patientId })
      .populate({
        path: 'doctor',
        select: 'name specialization avatar'
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ patient: patientId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get patient reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Patient who created the review)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review, isAnonymous } = req.body;
    const userId = req.user._id;

    const existingReview = await Review.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user can edit this review
    if (!existingReview.canBeEditedBy(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) existingReview.rating = rating;
    if (review !== undefined) existingReview.review = review.trim();
    if (isAnonymous !== undefined) existingReview.isAnonymous = isAnonymous;

    await existingReview.save();

    await existingReview.populate([
      {
        path: 'patient',
        select: 'name avatar',
        transform: function(doc) {
          if (existingReview.isAnonymous) {
            return { name: 'Anonymous', avatar: null };
          }
          return doc;
        }
      },
      {
        path: 'doctor',
        select: 'name specialization'
      }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: existingReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Patient who created the review or Admin)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions
    const canDelete = userRole === 'admin' || review.canBeEditedBy(userId);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      sort = '-createdAt',
      isApproved,
      doctorId,
      rating
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (doctorId) query.doctor = doctorId;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate([
        {
          path: 'patient',
          select: 'name email avatar'
        },
        {
          path: 'doctor',
          select: 'name email specialization avatar'
        }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(query);

    // Get some statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          approvedReviews: {
            $sum: { $cond: ['$isApproved', 1, 0] }
          },
          pendingReviews: {
            $sum: { $cond: ['$isApproved', 0, 1] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        stats: stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          approvedReviews: 0,
          pendingReviews: 0
        }
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve/Disapprove a review (Admin only)
// @route   PATCH /api/reviews/:reviewId/approve
// @access  Private (Admin only)
export const moderateReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { reviewId } = req.params;
    const { isApproved, adminNotes } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isApproved = isApproved;
    if (adminNotes) {
      review.adminNotes = adminNotes;
    }

    await review.save();

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
      data: review
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get doctor's own reviews and stats
// @route   GET /api/reviews/doctor/my-reviews
// @access  Private (Doctor only)
export const getDoctorOwnReviews = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Doctor access required'
      });
    }

    const doctorId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get reviews for this doctor
    const reviews = await Review.find({
      doctor: doctorId,
      isApproved: true
    })
    .populate({
      path: 'patient',
      select: 'name avatar',
      transform: function(doc, ret) {
        if (ret && this.isAnonymous) {
          return { name: 'Anonymous', avatar: null };
        }
        return doc;
      }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({
      doctor: doctorId,
      isApproved: true
    });

    // Get rating statistics
    const ratingStats = await Review.calculateAverageRating(doctorId);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        ratingStats
      }
    });

  } catch (error) {
    console.error('Get doctor own reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get eligible appointments for review (Patient only)
// @route   GET /api/reviews/eligible-appointments/:doctorId
// @access  Private (Patient only)
export const getEligibleAppointmentsForReview = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access this endpoint'
      });
    }

    const { doctorId } = req.params;
    const patientId = req.user._id;

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get all eligible appointments (completed or cancelled by doctor)
    const eligibleAppointments = await Appointment.find({
      patient: patientId,
      doctor: doctorId,
      $or: [
        { status: 'completed' },
        { 
          status: 'cancelled',
          cancelledBy: doctorId
        }
      ]
    }).sort('-createdAt');

    // Get appointments that have already been reviewed
    const reviewedAppointmentIds = await Review.find({
      patient: patientId,
      doctor: doctorId,
      appointment: { $exists: true }
    }).distinct('appointment');

    // Filter out already reviewed appointments
    const unreviewed = eligibleAppointments.filter(
      appointment => !reviewedAppointmentIds.some(
        reviewedId => reviewedId.toString() === appointment._id.toString()
      )
    );

    // Check if patient has given a general review (without specific appointment)
    const hasGeneralReview = await Review.findOne({
      patient: patientId,
      doctor: doctorId,
      appointment: { $exists: false }
    });

    res.json({
      success: true,
      data: {
        eligibleAppointments: unreviewed,
        hasGeneralReview: !!hasGeneralReview,
        canGiveGeneralReview: unreviewed.length > 0 && !hasGeneralReview
      }
    });

  } catch (error) {
    console.error('Get eligible appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
