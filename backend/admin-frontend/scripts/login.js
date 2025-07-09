const loginContainer = document.getElementById('login-container');
const dashboardRoot = document.getElementById('dashboard-root');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function showDashboard() {
  loginContainer.classList.add('hidden');
  dashboardRoot.classList.remove('hidden');
  sidebarLinks[0].click();
}

function showLogin() {
  dashboardRoot.classList.add('hidden');
  loginContainer.classList.remove('hidden');
}

function checkAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token) return showLogin();
  const payload = parseJwt(token);
  if (!payload || payload.role !== 'admin') {
    localStorage.removeItem('admin_token');
    return showLogin();
  }
  showDashboard();
}

checkAuth();

if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.data?.token) throw new Error(data.message || 'Login failed');
      const payload = parseJwt(data.data.token);
      if (payload.role !== 'admin') throw new Error('Not an admin account');
      localStorage.setItem('admin_token', data.data.token);
      loginForm.reset();
      showDashboard();
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.remove('hidden');
    }
  };
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem('admin_token');
    showLogin();
  };
}