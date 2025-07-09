export function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}
 
export function validateOTP(otp) {
  return /^\d{6}$/.test(otp);
} 