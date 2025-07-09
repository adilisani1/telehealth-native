const API_BASE = 'http://localhost:5000/api/admin';
const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const TRIGGER_MISSED = 'http://localhost:5000/api/appointment-management/trigger-missed';
const NOTIFICATION = 'http://localhost:5000/api/notifications/admin-notice';

function getToken() { return localStorage.getItem('admin_token') || ''; }
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}