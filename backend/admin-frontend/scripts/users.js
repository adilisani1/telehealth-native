// --- Users ---

async function fetchUsers(page = 1) {
  const search = document.getElementById('user-search').value;
  const role = document.getElementById('user-role-filter').value;
  let url = `${API_BASE}/users?page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (role) url += `&role=${role}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  renderUsers(data.data || { users: [], total: 0, page: 1, pages: 1 });
}

function renderUsers({ users, total, page, pages }) {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 cursor-pointer';
    tr.onclick = () => showUserModal(user._id);
    tr.innerHTML = `
      <td class="py-2 px-4">${user.name}</td>
      <td class="py-2 px-4">${user.email}</td>
      <td class="py-2 px-4 capitalize">${user.role}</td>
      <td class="py-2 px-4">
        <span class="inline-block px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${user.status}</span>
      </td>
      <td class="py-2 px-4">
        <button class="px-2 py-1 rounded bg-yellow-500 text-white text-xs mr-2" onclick="event.stopPropagation(); updateUserStatus('${user._id}', '${user.status === 'active' ? 'suspended' : 'active'}')">${user.status === 'active' ? 'Suspend' : 'Activate'}</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  renderPagination('users', page, pages, fetchUsers);
}

window.updateUserStatus = async function(id, status) {
  if (!confirm(`Are you sure you want to set this user as ${status}?`)) return;
  await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  fetchUsers();
};

document.getElementById('user-search').addEventListener('input', () => fetchUsers());
document.getElementById('user-role-filter').addEventListener('change', () => fetchUsers());