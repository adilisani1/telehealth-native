const negotiationSection = document.getElementById('section-earning-negotiation');
const negotiationTableBody = document.getElementById('negotiation-table-body');
const negotiationStatusFilter = document.getElementById('negotiation-status-filter');
const negotiationModal = document.getElementById('negotiation-modal');
const negotiationModalContent = document.getElementById('negotiation-modal-content');
const closeNegotiationModal = document.getElementById('close-negotiation-modal');
if (closeNegotiationModal) closeNegotiationModal.onclick = () => {
  negotiationModal.classList.add('hidden');
  currentlyViewingDoctorId = null;
  isUserTyping = false;
  lastMessageCount = 0;
  clearTimeout(typingTimer);
};

// Auto-refresh functionality with smart polling
let autoRefreshInterval;
let currentlyViewingDoctorId = null;
let lastMessageCount = 0;
let isUserTyping = false;
let typingTimer;

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshInterval = setInterval(() => {
    fetchNegotiations();
    // Only refresh modal content if user is not typing and modal is open
    if (currentlyViewingDoctorId && !negotiationModal.classList.contains('hidden') && !isUserTyping) {
      refreshModalMessages(currentlyViewingDoctorId);
    }
  }, 5000); // Refresh every 5 seconds
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// Smart refresh that only updates messages without disrupting input fields
async function refreshModalMessages(doctorId) {
  try {
    // Add connection indicator
    const statusIndicator = document.querySelector('.connection-status') || createConnectionStatusIndicator();
    statusIndicator.textContent = '🔄 Syncing...';
    statusIndicator.className = 'connection-status text-xs text-blue-600 text-right mb-2';
    
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/earning-negotiation`, { headers: getHeaders() });
    const data = await res.json();
    const doc = data.data;
    if (!doc) return;
    
    const currentMessages = doc.earningNegotiationHistory || [];
    
    // Only update if there are new messages
    if (currentMessages.length !== lastMessageCount) {
      lastMessageCount = currentMessages.length;
      updateMessageHistory(currentMessages);
    }
    
    // Update status display if needed
    const statusElement = document.querySelector('#modal-status-display');
    if (statusElement) {
      statusElement.textContent = doc.earningNegotiationStatus?.toUpperCase() || 'PENDING';
      statusElement.className = `capitalize ${doc.earningNegotiationStatus === 'agreed' ? 'text-green-600' : 'text-orange-600'}`;
    }
    
    // Update doctor's proposed fee display (but not admin's input field)
    const doctorProposedFeeDiv = document.querySelector('.doctor-proposed-fee');
    if (doctorProposedFeeDiv) {
      doctorProposedFeeDiv.textContent = `${doc.proposedFee || 'Not set'} ${doc.currency || 'PKR'}`;
    }
    
    // Update agreed fee display if it exists
    const agreedFeeSection = document.querySelector('.agreed-fee-section');
    if (doc.earningNegotiationStatus === 'agreed' && doc.agreedFee) {
      if (agreedFeeSection) {
        agreedFeeSection.innerHTML = `
          <label class="text-sm font-medium text-green-700">Agreed Fee:</label>
          <div class="text-lg font-bold text-green-600">${doc.agreedFee} ${doc.currency}</div>
        `;
        agreedFeeSection.style.display = 'block';
      }
    } else if (agreedFeeSection) {
      agreedFeeSection.style.display = 'none';
    }
    
    // Update connection status
    statusIndicator.textContent = '🟢 Connected';
    statusIndicator.className = 'connection-status text-xs text-green-600 text-right mb-2';
    
  } catch (err) {
    console.log('Error refreshing messages:', err);
    const statusIndicator = document.querySelector('.connection-status') || createConnectionStatusIndicator();
    statusIndicator.textContent = '🔴 Connection Error';
    statusIndicator.className = 'connection-status text-xs text-red-600 text-right mb-2';
  }
}

function createConnectionStatusIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'connection-status text-xs text-gray-600 text-right mb-2';
  indicator.textContent = '⚪ Connecting...';
  
  const historySection = document.querySelector('.message-history-content')?.parentNode;
  if (historySection) {
    historySection.insertBefore(indicator, historySection.firstChild.nextSibling);
  }
  
  return indicator;
}

function updateMessageHistory(messages) {
  const historyDiv = document.querySelector('.message-history-content');
  if (historyDiv) {
    let historyHtml = '';
    messages.forEach(msg => {
      const senderLabel = msg.sender === 'admin' ? 'Admin' : 'Doctor';
      const timestamp = new Date(msg.timestamp).toLocaleString();
      
      // Show fee information if it was included in the message
      let feeInfo = '';
      if (msg.proposedFee) {
        feeInfo = ` <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${msg.proposedFee} ${msg.currency || 'PKR'}</span>`;
      }
      
      historyHtml += `<div class="mb-2">
        <span class="font-semibold">${senderLabel}:</span> ${msg.message}${feeInfo}
        <span class="text-xs text-gray-400 block">${timestamp}</span>
      </div>`;
    });
    
    // Check if we're at the bottom before updating
    const wasAtBottom = historyDiv.scrollTop + historyDiv.clientHeight >= historyDiv.scrollHeight - 5;
    
    historyDiv.innerHTML = historyHtml || '<span class="text-gray-400">No messages yet.</span>';
    
    // Auto-scroll to bottom only if user was already at bottom
    if (wasAtBottom) {
      historyDiv.scrollTop = historyDiv.scrollHeight;
    } else {
      // Show a subtle indicator that new messages are available
      const existingIndicator = document.querySelector('.new-message-indicator');
      if (!existingIndicator) {
        const indicator = document.createElement('div');
        indicator.className = 'new-message-indicator text-xs text-blue-600 text-center py-1 cursor-pointer bg-blue-50 border border-blue-200 rounded mt-1';
        indicator.textContent = '↓ New messages ↓';
        indicator.onclick = () => {
          historyDiv.scrollTop = historyDiv.scrollHeight;
          indicator.remove();
        };
        historyDiv.parentNode.insertBefore(indicator, historyDiv.nextSibling);
        
        // Auto-remove indicator after 5 seconds
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.remove();
          }
        }, 5000);
      }
    }
  }
}

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
    
    // Determine fee displays
    const currentAgreedFee = doc.agreedFee || 'Not set';
    const doctorProposedFee = doc.proposedFee || 'Not set';
    
    tr.innerHTML = `
      <td class="py-2 px-4">${doc.name}</td>
      <td class="py-2 px-4">${doc.email}</td>
      <td class="py-2 px-4">
        <div class="text-sm">
          <div><span class="font-medium text-blue-600">Proposed:</span> ${doctorProposedFee} ${doc.currency || 'PKR'}</div>
          <div class="text-gray-600"><span class="font-medium text-green-600">Agreed:</span> ${currentAgreedFee} ${doc.currency || 'PKR'}</div>
        </div>
      </td>
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
  currentlyViewingDoctorId = doctorId;
  isUserTyping = false;
  negotiationModalContent.innerHTML = '<div class="text-center">Loading...</div>';
  negotiationModal.classList.remove('hidden');
  
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/earning-negotiation`, { headers: getHeaders() });
    const data = await res.json();
    const doc = data.data;
    if (!doc) throw new Error('Doctor not found');
    
    // Initialize message count for smart updates
    lastMessageCount = (doc.earningNegotiationHistory || []).length;
    
    let historyHtml = '';
    (doc.earningNegotiationHistory || []).forEach(msg => {
      historyHtml += `<div class="mb-2"><span class="font-semibold">${msg.sender === 'admin' ? 'Admin' : 'Doctor'}:</span> ${msg.message} <span class="text-xs text-gray-400">${new Date(msg.timestamp).toLocaleString()}</span></div>`;
    });
    
    // Show fees: displayFee is for admin input, proposedFee is what doctor proposed
    const displayFee = doc.earningNegotiationStatus === 'agreed' ? doc.agreedFee : doc.proposedFee;
    
    negotiationModalContent.innerHTML = `
      <div><b>Name:</b> ${doc.name}</div>
      <div><b>Email:</b> ${doc.email}</div>
      
      <div class="bg-blue-50 p-3 rounded my-3 border-l-4 border-blue-500">
        <h4 class="font-semibold text-blue-800 mb-2">Fee Information</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Doctor's Latest Proposed Fee:</label>
            <div class="text-lg font-bold text-blue-600 doctor-proposed-fee">${doc.proposedFee || 'Not set'} ${doc.currency || 'PKR'}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Set New Fee (Admin):</label>
            <input id="negotiation-proposed-fee" type="number" value="${displayFee || ''}" class="border rounded px-2 py-1 w-full mt-1" />
          </div>
        </div>
        <div class="mt-2 agreed-fee-section" style="display: ${doc.earningNegotiationStatus === 'agreed' && doc.agreedFee ? 'block' : 'none'}">
          <label class="text-sm font-medium text-green-700">Currently Agreed Fee:</label>
          <div class="text-lg font-bold text-green-600">${doc.agreedFee || ''} ${doc.currency || ''}</div>
        </div>
      </div>
      
      <div><b>Currency:</b> <select id="negotiation-currency" class="border rounded px-2 py-1 w-24">
        <option value="USD" ${doc.currency === 'USD' ? 'selected' : ''}>USD</option>
        <option value="PKR" ${doc.currency === 'PKR' ? 'selected' : ''}>PKR</option>
      </select></div>
      <div><b>Commission (%):</b> <input id="negotiation-commission" type="number" value="${doc.commission || ''}" class="border rounded px-2 py-1 w-16" /></div>
      <div><b>Status:</b> <span id="modal-status-display" class="capitalize ${doc.earningNegotiationStatus === 'agreed' ? 'text-green-600' : 'text-orange-600'}">${doc.earningNegotiationStatus}</span></div>
      <div class="my-4">
        <b>Negotiation History:</b>
        <div class="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50 message-history-content">${historyHtml || '<span class="text-gray-400">No messages yet.</span>'}</div>
      </div>
      <form id="negotiation-message-form" class="flex gap-2 mb-2">
        <input id="negotiation-message" type="text" class="flex-1 border rounded px-2 py-1" placeholder="Send a message..." />
        <button type="submit" class="bg-blue-700 text-white px-4 py-1 rounded">Send</button>
      </form>
      <button id="negotiation-update-btn" class="bg-yellow-600 text-white px-4 py-2 rounded mr-2">Update ${doc.earningNegotiationStatus === 'agreed' ? 'Terms' : 'Proposal'}</button>
      <button id="negotiation-agree-btn" class="bg-green-700 text-white px-4 py-2 rounded ${doc.earningNegotiationStatus === 'agreed' ? 'opacity-50 cursor-not-allowed' : ''}" ${doc.earningNegotiationStatus === 'agreed' ? 'disabled' : ''}>Agree</button>
      <div id="negotiation-modal-result" class="mt-2 text-center font-semibold hidden"></div>
    `;

    // Add typing detection to prevent disrupting user input
    const messageInput = document.getElementById('negotiation-message');
    const feeInput = document.getElementById('negotiation-proposed-fee');
    const commissionInput = document.getElementById('negotiation-commission');
    
    [messageInput, feeInput, commissionInput].forEach(input => {
      if (input) {
        input.addEventListener('focus', () => {
          isUserTyping = true;
        });
        
        input.addEventListener('blur', () => {
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            isUserTyping = false;
          }, 1000); // Wait 1 second after blur before allowing updates
        });
        
        input.addEventListener('input', () => {
          isUserTyping = true;
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            isUserTyping = false;
          }, 2000); // Stop considering as typing after 2 seconds of inactivity
        });
      }
    });

    // Auto-scroll message history to bottom
    const historyDiv = document.querySelector('.message-history-content');
    if (historyDiv) {
      historyDiv.scrollTop = historyDiv.scrollHeight;
    }

    document.getElementById('negotiation-message-form').onsubmit = async (e) => {
      e.preventDefault();
      const message = document.getElementById('negotiation-message').value.trim();
      if (!message) return;
      
      // Clear the input immediately for better UX
      document.getElementById('negotiation-message').value = '';
      
      await postNegotiationUpdate(doc._id, { message });
    };
    document.getElementById('negotiation-update-btn').onclick = async () => {
      const proposedFee = document.getElementById('negotiation-proposed-fee').value;
      const currency = document.getElementById('negotiation-currency').value;
      const commission = document.getElementById('negotiation-commission').value;
      
      // Only change status to 'negotiating' if the current status is not 'agreed'
      // If status is 'agreed', we're just updating the agreed terms
      let updateData = { proposedFee, currency, commission };
      if (doc.earningNegotiationStatus !== 'agreed') {
        updateData.status = 'negotiating';
      }
      
      await postNegotiationUpdate(doc._id, updateData);
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
    
    resultDiv.textContent = body.message ? 'Message sent!' : 'Negotiation updated!';
    resultDiv.classList.remove('text-red-600');
    resultDiv.classList.add('text-green-700');
    resultDiv.classList.remove('hidden');
    
    // Use smart refresh instead of reloading entire modal
    setTimeout(() => {
      resultDiv.classList.add('hidden');
    }, 3000);
    
    // Immediately refresh messages to show the new message
    await refreshModalMessages(doctorId);
    
    // Update the table in background
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
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      resultDiv.classList.add('hidden');
    }, 3000);
    
    // Use smart refresh to update status and messages
    await refreshModalMessages(doctorId);
    
    // Update button states since status changed to 'agreed'
    const agreeBtn = document.getElementById('negotiation-agree-btn');
    const updateBtn = document.getElementById('negotiation-update-btn');
    if (agreeBtn) {
      agreeBtn.disabled = true;
      agreeBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    if (updateBtn) {
      updateBtn.textContent = 'Update Terms';
    }
    
    // Update the table in background
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
if (earningNegotiationSidebarBtn) earningNegotiationSidebarBtn.addEventListener('click', () => {
  fetchNegotiations();
  startAutoRefresh();
});

// Stop auto-refresh when leaving the section
document.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-section') && e.target.getAttribute('data-section') !== 'earning-negotiation') {
    stopAutoRefresh();
  }
});