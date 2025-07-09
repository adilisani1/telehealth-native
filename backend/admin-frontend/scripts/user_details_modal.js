// --- User Details Modal Logic ---
const userModal = document.getElementById('user-modal');
const userModalContent = document.getElementById('user-modal-content');
const closeUserModal = document.getElementById('close-user-modal');
if (closeUserModal) closeUserModal.onclick = () => userModal.classList.add('hidden');

async function showUserModal(userId) {
  userModalContent.innerHTML = '<div class="text-center">Loading...</div>';
  userModal.classList.remove('hidden');
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, { headers: getHeaders() });
    const data = await res.json();
    const user = data.data;
    if (!user) throw new Error('User not found');
    userModalContent.innerHTML = `
      <div><b>Name:</b> ${user.name}</div>
      <div><b>Email:</b> ${user.email}</div>
      <div><b>Phone:</b> ${user.phone || '-'}</div>
      <div><b>Role:</b> ${user.role}</div>
      <div><b>Status:</b> ${user.status}</div>
      <div><b>Specialization:</b> ${user.specialization || '-'}</div>
      <div><b>Qualifications:</b> ${user.qualifications || '-'}</div>
      <div><b>Created:</b> ${new Date(user.createdAt).toLocaleString()}</div>
    `;
  } catch (err) {
    userModalContent.innerHTML = `<div class="text-red-600">${err.message}</div>`;
  }
}