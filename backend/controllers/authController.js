import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail } from '../utils/validation.js';
import { validationResult } from 'express-validator';
import moment from 'moment';
import otpGenerator from 'otp-generator';
import { sendMail } from '../utils/mail.js';
import { OTP_EXPIRY_MINUTES, OTP_LENGTH, EMAIL_VERIFICATION_SUBJECT, PASSWORD_RESET_OTP_EXPIRY_MINUTES, PASSWORD_RESET_EMAIL_SUBJECT } from '../constants.js';
import { validateOTP } from '../utils/validation.js';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  try {
    if (!req.body.consent) {
      return res.status(400).json({ success: false, message: 'Consent is required to register.' });
    }
    const { name, email, phone, password, role, dob, specialization, qualifications, proposedFee, currency } = req.body;
    // Sanitize input
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (!cleanName || !cleanEmail || !cleanPhone || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    // Enforce required fields based on role
    let dobDate = undefined;
    if (role === 'patient') {
      if (!dob) {
        return res.status(400).json({ success: false, message: 'Date of birth (dob) is required for patients' });
      }
      // Accept both 'YYYY-MM-DD' and 'DD-MM-YYYY' formats
      if (moment(dob, 'YYYY-MM-DD', true).isValid()) {
        dobDate = moment(dob, 'YYYY-MM-DD').toDate();
      } else if (moment(dob, 'DD-MM-YYYY', true).isValid()) {
        dobDate = moment(dob, 'DD-MM-YYYY').toDate();
      } else {
        return res.status(400).json({ success: false, message: 'Invalid dob format. Use YYYY-MM-DD or DD-MM-YYYY.' });
      }
    }
    if (role === 'doctor' && (!specialization || !qualifications)) {
      return res.status(400).json({ success: false, message: 'Specialization and qualifications are required for doctors' });
    }
    // Earning module validation for doctors
    let cleanCurrency = currency;
    if (role === 'doctor') {
      if (typeof proposedFee === 'undefined' || isNaN(Number(proposedFee))) {
        return res.status(400).json({ success: false, message: 'Proposed fee is required for doctors' });
      }
      if (!['USD', 'PKR'].includes(currency)) {
        return res.status(400).json({ success: false, message: 'Currency must be USD or PKR' });
      }
      cleanCurrency = currency;
    }
    const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or phone already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate OTP
    const otp = otpGenerator.generate(OTP_LENGTH, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpExpiry = moment().add(OTP_EXPIRY_MINUTES, 'minutes').toDate();
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role,
      dob: dobDate,
      specialization: specialization || undefined,
      qualifications: qualifications || undefined,
      otp,
      otpExpiry,
      isVerified: false,
      // Earning module fields for doctors
      ...(role === 'doctor' ? {
        proposedFee: Number(proposedFee),
        currency: cleanCurrency,
        earningNegotiationStatus: 'pending',
        earningNegotiationHistory: [],
        commission: 0,
        agreedFee: undefined
      } : {})
    });
    // Send OTP email
    await sendMail({
      to: cleanEmail,
      subject: EMAIL_VERIFICATION_SUBJECT,
      text: `Your OTP for email verification is: ${otp}`,
      html: `<p>Your OTP for email verification is: <b>${otp}</b></p>`
    });
    res.status(201).json({ success: true, data: null, message: 'User registered successfully. Please verify your email with the OTP sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!validateOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please register again.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (moment().isAfter(user.otpExpiry)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please register again.' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  try {
    const { emailOrPhone, password } = req.body;
    // Sanitize input
    const cleanEmailOrPhone = emailOrPhone.trim().toLowerCase();
    if (!cleanEmailOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const user = await User.findOne({ $or: [{ email: cleanEmailOrPhone }, { phone: cleanEmailOrPhone }] });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email before logging in.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact support.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, do not reveal if user exists
      return res.status(200).json({ success: true, message: 'If this email is registered, a password reset OTP has been sent.' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email before resetting password.' });
    }
    // Generate OTP
    const otp = otpGenerator.generate(OTP_LENGTH, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpExpiry = moment().add(PASSWORD_RESET_OTP_EXPIRY_MINUTES, 'minutes').toDate();
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpiry = otpExpiry;
    await user.save();
    // Send OTP email
    await sendMail({
      to: user.email,
      subject: PASSWORD_RESET_EMAIL_SUBJECT,
      text: `Your OTP for password reset is: ${otp}`,
      html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`
    });
    res.status(200).json({ success: true, message: 'If this email is registered, a password reset OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!validateOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email before resetting password.' });
    }
    if (!user.passwordResetOtp || !user.passwordResetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'No password reset OTP found. Please request a new one.' });
    }
    if (user.passwordResetOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (moment().isAfter(user.passwordResetOtpExpiry)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry -passwordResetOtp -passwordResetOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Fetch related data (appointments, health records, etc.)
    // For brevity, only user data is exported here
    res.json({ success: true, data: user, message: 'User data export successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // Optionally, delete related data (appointments, health records, etc.)
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};