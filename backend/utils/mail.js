import '../loadEnv.js'; // must be the first import
import nodemailer from 'nodemailer';
import { EMAIL_FROM } from '../constants.js';

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  throw new Error('GMAIL_USER and GMAIL_PASS must be set in your environment variables (.env file) for email sending to work.');
}


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

export async function sendNotificationEmail({ to, subject, message }) {
  return sendMail({
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`
  });
} 