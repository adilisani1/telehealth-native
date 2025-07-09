const negotiationSection = document.getElementById('section-earning-negotiation');
const negotiationTableBody = document.getElementById('negotiation-table-body');
const negotiationStatusFilter = document.getElementById('negotiation-status-filter');
const negotiationModal = document.getElementById('negotiation-modal');
const negotiationModalContent = document.getElementById('negotiation-modal-content');
const closeNegotiationModal = document.getElementById('close-negotiation-modal');
if (closeNegotiationModal) closeNegotiationModal.onclick = () => negotiationModal.classList.add('hidden');

async function fetchNegotiations(page = 1) {
  const status = negotiationStatusFilter.value;
  let url = `${API_BASE}/doctors/earning-negotiation?page=${page}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  renderNegotiations(data.data || { doctors: [], total: 0, page: 1, pages: 1 });
}

function renderNegotiations({ doctors, total, page, pages }) {
  negotiationTableBody.innerHTML = '';
  doctors.forEach(doc => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 cursor-pointer';
    tr.onclick = () => showNegotiationModal(doc._id);
    tr.innerHTML = `
      <td class="py-2 px-4">${doc.name}</td>
      <td class="py-2 px-4">${doc.email}</td>
      <td class="py-2 px-4">${doc.proposedFee} </td>
      <td class="py-2 px-4">${doc.currency}</td>
      <td class="py-2 px-4 capitalize">${doc.earningNegotiationStatus}</td>
      <td class="py-2 px-4"><button class="px-2 py-1 rounded bg-blue-600 text-white text-xs" onclick="event.stopPropagation(); showNegotiationModal('${doc._id}')">Manage</button></td>
    `;
    negotiationTableBody.appendChild(tr);
  });
  renderPagination('negotiation', page, pages, fetchNegotiations);
}

negotiationStatusFilter.addEventListener('change', () => fetchNegotiations());

window.showNegotiationModal = async function(doctorId) {
  negotiationModalContent.innerHTML = '<div class="text-center">Loading...</div>';
  negotiationModal.classList.remove('hidden');
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/earning-negotiation`, { headers: getHeaders() });
    const data = await res.json();
    const doc = data.data;
    if (!doc) throw new Error('Doctor not found');
    let historyHtml = '';
    (doc.earningNegotiationHistory || []).forEach(msg => {
      historyHtml += `<div class="mb-2"><span class="font-semibold">${msg.sender === 'admin' ? 'Admin' : 'Doctor'}:</span> ${msg.message} <span class="text-xs text-gray-400">${new Date(msg.timestamp).toLocaleString()}</span></div>`;
    });
    negotiationModalContent.innerHTML = `
      <div><b>Name:</b> ${doc.name}</div>
      <div><b>Email:</b> ${doc.email}</div>
      <div><b>Proposed Fee:</b> <input id="negotiation-proposed-fee" type="number" value="${doc.proposedFee}" class="border rounded px-2 py-1 w-24" /></div>
      <div><b>Currency:</b> <select id="negotiation-currency" class="border rounded px-2 py-1 w-24">
        <option value="USD" ${doc.currency === 'USD' ? 'selected' : ''}>USD</option>
        <option value="PKR" ${doc.currency === 'PKR' ? 'selected' : ''}>PKR</option>
      </select></div>
      <div><b>Commission (%):</b> <input id="negotiation-commission" type="number" value="${doc.commission}" class="border rounded px-2 py-1 w-16" /></div>
      <div><b>Status:</b> <span class="capitalize">${doc.earningNegotiationStatus}</span></div>
      <div class="my-4"><b>Negotiation History:</b><div class="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50">${historyHtml || '<span class="text-gray-400">No messages yet.</span>'}</div></div>
      <form id="negotiation-message-form" class="flex gap-2 mb-2">
        <input id="negotiation-message" type="text" class="flex-1 border rounded px-2 py-1" placeholder="Send a message..." />
        <button type="submit" class="bg-blue-700 text-white px-4 py-1 rounded">Send</button>
      </form>
      <button id="negotiation-update-btn" class="bg-yellow-600 text-white px-4 py-2 rounded mr-2">Update</button>
      <button id="negotiation-agree-btn" class="bg-green-700 text-white px-4 py-2 rounded">Agree</button>
      <div id="negotiation-modal-result" class="mt-2 text-center font-semibold hidden"></div>
    `;
    document.getElementById('negotiation-message-form').onsubmit = async (e) => {
      e.preventDefault();
      const message = document.getElementById('negotiation-message').value.trim();
      if (!message) return;
      await postNegotiationUpdate(doc._id, { message });
    };
    document.getElementById('negotiation-update-btn').onclick = async () => {
      const proposedFee = document.getElementById('negotiation-proposed-fee').value;
      const currency = document.getElementById('negotiation-currency').value;
      const commission = document.getElementById('negotiation-commission').value;
      await postNegotiationUpdate(doc._id, { proposedFee, currency, commission, status: 'negotiating' });
    };
    document.getElementById('negotiation-agree-btn').onclick = async () => {
      const agreedFee = document.getElementById('negotiation-proposed-fee').value;
      const commission = document.getElementById('negotiation-commission').value;
      await agreeNegotiation(doc._id, { agreedFee, commission });
    };
  } catch (err) {
    negotiationModalContent.innerHTML = `<div class="text-red-600">${err.message}</div>`;
  }
};

async function postNegotiationUpdate(doctorId, body) {
  const resultDiv = document.getElementById('negotiation-modal-result');
  resultDiv.classList.add('hidden');
  resultDiv.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/earning-negotiation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update negotiation');
    resultDiv.textContent = 'Negotiation updated!';
    resultDiv.classList.remove('text-red-600');
    resultDiv.classList.add('text-green-700');
    resultDiv.classList.remove('hidden');
    await showNegotiationModal(doctorId);
    fetchNegotiations();
  } catch (err) {
    resultDiv.textContent = err.message;
    resultDiv.classList.remove('text-green-700');
    resultDiv.classList.add('text-red-600');
    resultDiv.classList.remove('hidden');
  }
}

async function agreeNegotiation(doctorId, body) {
  const resultDiv = document.getElementById('negotiation-modal-result');
  resultDiv.classList.add('hidden');
  resultDiv.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/earning-negotiation/agree`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to agree negotiation');
    resultDiv.textContent = 'Negotiation agreed!';
    resultDiv.classList.remove('text-red-600');
    resultDiv.classList.add('text-green-700');
    resultDiv.classList.remove('hidden');
    await showNegotiationModal(doctorId);
    fetchNegotiations();
  } catch (err) {
    resultDiv.textContent = err.message;
    resultDiv.classList.remove('text-green-700');
    resultDiv.classList.add('text-red-600');
    resultDiv.classList.remove('hidden');
  }
}

// Sidebar navigation for earning negotiation
const earningNegotiationSidebarBtn = document.querySelector('[data-section="earning-negotiation"]');
if (earningNegotiationSidebarBtn) earningNegotiationSidebarBtn.addEventListener('click', () => fetchNegotiations());