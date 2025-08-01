import Stripe from 'stripe';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import moment from 'moment-timezone';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent for appointment booking
 * @route POST /api/stripe/create-payment-intent
 * @access Private (Patient only)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'USD', doctorId, appointmentData = {} } = req.body;
    
    // Validate required fields
    if (!amount || !doctorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: amount, doctorId' 
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Validate doctor exists
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doctor ID' 
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Get patient information
    const patient = await User.findById(req.user._id);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Convert amount to cents for Stripe (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent with comprehensive metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        doctorId: doctorId,
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        doctorSpecialization: doctor.specialization || '',
        patientId: req.user._id.toString(),
        patientName: patient.name,
        patientEmail: patient.email,
        appointmentDate: appointmentData?.date || '',
        appointmentSlot: appointmentData?.slot || '',
        appointmentProblem: appointmentData?.problem || '',
        appointmentPatientName: appointmentData?.patientName || patient.name,
        appointmentAgeGroup: appointmentData?.ageGroup || '',
        appointmentGender: appointmentData?.gender || '',
        originalAmount: amount.toString(),
        originalCurrency: currency,
        bookingTimestamp: new Date().toISOString(),
      },
      description: `Telehealth Consultation - Dr. ${doctor.name} with ${patient.name}`,
    });

    // Log payment intent creation
    try {
      await AuditLog.create({
        user: req.user._id,
        action: 'payment_intent_created',
        target: 'Payment',
        details: JSON.stringify({
          amount,
          currency,
          doctorId,
          paymentIntentId: paymentIntent.id,
          appointmentDate: appointmentData?.date || '',
          appointmentSlot: appointmentData?.slot || ''
        })
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the payment creation if audit logging fails
    }

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization
        }
      },
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    
    // Check for Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: 'Card error: ' + error.message
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: ' + error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent. Please try again.' 
    });
  }
};

/**
 * Confirm payment and create appointment
 * @route POST /api/stripe/confirm-payment
 * @access Private (Patient only)
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, appointmentData } = req.body;

    if (!paymentIntentId || !appointmentData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentIntentId, appointmentData'
      });
    }

    // Retrieve and verify payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found'
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }

    // Verify the payment belongs to this user
    if (paymentIntent.metadata.patientId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Payment intent does not belong to this user'
      });
    }

    // Get doctor information
    const doctorId = paymentIntent.metadata.doctorId;
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.timezone) {
      return res.status(400).json({
        success: false,
        message: 'Doctor timezone is not configured'
      });
    }

    // Validate appointment slot availability (final check)
    const dayOfWeek = moment.tz(appointmentData.date, doctor.timezone).format('dddd');
    const availableDay = doctor.availability.find(a => a.day === dayOfWeek);
    
    if (!availableDay || !availableDay.slots.includes(appointmentData.slot)) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is no longer available'
      });
    }

    // Calculate slot times in doctor's timezone
    const slotStart = moment.tz(appointmentData.date + ' ' + appointmentData.slot.split('-')[0], doctor.timezone);
    const slotEnd = moment.tz(appointmentData.date + ' ' + appointmentData.slot.split('-')[1], doctor.timezone);

    // Check for conflicts one more time
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: slotStart.toDate(), $lt: slotEnd.toDate() },
      status: { $in: ['requested', 'accepted'] }
    });

    if (conflict) {
      // Refund the payment if slot is no longer available
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer'
        });
      } catch (refundError) {
        console.error('Refund error:', refundError);
      }

      return res.status(409).json({
        success: false,
        message: 'Slot is no longer available. Payment has been refunded.'
      });
    }

    // Create appointment with payment information
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: slotStart.toDate(),
      timezone: doctor.timezone,
      status: 'requested',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntentId,
      paymentMethod: 'stripe',
      patientName: appointmentData.patientName,
      ageGroup: appointmentData.ageGroup,
      gender: appointmentData.gender,
      problem: appointmentData.problem,
      fee: parseFloat(paymentIntent.metadata.originalAmount),
      currency: paymentIntent.metadata.originalCurrency,
      stripeChargeId: paymentIntent.latest_charge,
      paymentTimestamp: new Date()
    });

    // Log successful appointment creation
    try {
      await AuditLog.create({
        user: req.user._id,
        action: 'appointment_booked_with_payment',
        target: 'Appointment',
        targetId: appointment._id,
        details: JSON.stringify({
          doctorId,
          paymentIntentId,
          amount: paymentIntent.metadata.originalAmount,
          currency: paymentIntent.metadata.originalCurrency,
          date: appointmentData.date,
          slot: appointmentData.slot
        })
      });
    } catch (auditError) {
      console.error('Failed to create appointment booking audit log:', auditError);
      // Don't fail the appointment creation if audit logging fails
    }

    // Send notification to doctor
    await Notification.create({
      user: doctorId,
      type: 'alert',
      message: `New paid appointment booked by ${appointmentData.patientName} for ${appointmentData.date} at ${appointmentData.slot}`,
      appointment: appointment._id
    });

    // Populate appointment data for response
    await appointment.populate('doctor', 'name email specialization avatar');
    await appointment.populate('patient', 'name email');

    res.json({
      success: true,
      data: appointment,
      message: 'Payment confirmed and appointment booked successfully'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    
    // Handle Stripe errors
    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: ' + error.message
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment and create appointment' 
    });
  }
};

/**
 * Get payment history for the logged-in patient
 * @route GET /api/stripe/payment-history
 * @access Private (Patient only)
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Appointment.countDocuments({ 
      patient: req.user._id,
      paymentStatus: 'paid'
    });

    const appointments = await Appointment.find({ 
      patient: req.user._id,
      paymentStatus: 'paid'
    })
    .populate('doctor', 'name specialization avatar')
    .sort({ paymentTimestamp: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      message: 'Payment history retrieved successfully'
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve payment history' 
    });
  }
};

/**
 * Webhook endpoint for Stripe events
 * @route POST /api/stripe/webhook
 * @access Public (Stripe webhook)
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update appointment payment status if needed
      await Appointment.updateOne(
        { paymentIntentId: paymentIntent.id },
        { 
          paymentStatus: 'paid',
          stripeChargeId: paymentIntent.latest_charge,
          paymentTimestamp: new Date()
        }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update appointment payment status
      await Appointment.updateOne(
        { paymentIntentId: failedPayment.id },
        { paymentStatus: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Refund a payment
 * @route POST /api/stripe/refund
 * @access Private (Admin only)
 */
export const refundPayment = async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this appointment'
      });
    }

    if (appointment.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been refunded'
      });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: appointment.paymentIntentId,
      reason: reason || 'requested_by_customer'
    });

    // Update appointment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      refundId: refund.id,
      refundTimestamp: new Date(),
      refundReason: reason
    });

    // Log refund
    try {
      await AuditLog.create({
        user: req.user._id,
        action: 'payment_refunded',
        target: 'Appointment',
        targetId: appointmentId,
        details: JSON.stringify({
          refundId: refund.id,
          amount: refund.amount / 100,
          reason: reason
        })
      });
    } catch (auditError) {
      console.error('Failed to create refund audit log:', auditError);
      // Don't fail the refund process if audit logging fails
    }

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency
      },
      message: 'Payment refunded successfully'
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process refund' 
    });
  }
};
