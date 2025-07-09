const adminNoticeForm = document.getElementById('admin-notice-form');
const adminNoticeTarget = document.getElementById('admin-notice-target');
const adminNoticeCustomUserGroup = document.getElementById('admin-notice-custom-user-group');
const adminNoticeResult = document.getElementById('admin-notice-result');

if (adminNoticeTarget) {
  adminNoticeTarget.addEventListener('change', () => {
    if (adminNoticeTarget.value === 'custom') {
      adminNoticeCustomUserGroup.classList.remove('hidden');
    } else {
      adminNoticeCustomUserGroup.classList.add('hidden');
    }
  });
}

if (adminNoticeForm) {
  adminNoticeForm.onsubmit = async (e) => {
    e.preventDefault();
    adminNoticeResult.classList.add('hidden');
    adminNoticeResult.textContent = '';
    const message = document.getElementById('admin-notice-message').value.trim();
    const target = adminNoticeTarget.value;
    let role = undefined;
    let user = undefined;
    if (target === 'doctor' || target === 'patient') role = target;
    if (target === 'custom') user = document.getElementById('admin-notice-custom-user').value.trim();
    try {
      const res = await fetch(NOTIFICATION, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, role, user })
      });
      const data = await res.json();
      if (res.ok) {
        adminNoticeResult.textContent = 'Notification sent successfully!';
        adminNoticeResult.classList.remove('text-red-600');
        adminNoticeResult.classList.add('text-green-700');
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (err) {
      adminNoticeResult.textContent = err.message;
      adminNoticeResult.classList.remove('text-green-700');
      adminNoticeResult.classList.add('text-red-600');
    }
    adminNoticeResult.classList.remove('hidden');
  };
}