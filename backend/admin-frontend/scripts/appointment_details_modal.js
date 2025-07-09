const appointmentModal = document.getElementById('appointment-modal');
const appointmentModalContent = document.getElementById('appointment-modal-content');
const closeAppointmentModal = document.getElementById('close-appointment-modal');
if (closeAppointmentModal) closeAppointmentModal.onclick = () => appointmentModal.classList.add('hidden');

async function showAppointmentModal(appointmentId) {
  appointmentModalContent.innerHTML = '<div class="text-center">Loading...</div>';
  appointmentModal.classList.remove('hidden');
  try {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, { headers: getHeaders() });
    const data = await res.json();
    const appt = data.data;
    if (!appt) throw new Error('Appointment not found');
    appointmentModalContent.innerHTML = `
      <div><b>Doctor:</b> ${appt.doctor?.name || '-'}</div>
      <div><b>Patient:</b> ${appt.patient?.name || '-'}</div>
      <div><b>Date:</b> ${new Date(appt.date).toLocaleString()}</div>
      <div><b>Status:</b> ${appt.status}</div>
      <div><b>Timezone:</b> ${appt.timezone || '-'}</div>
      <div><b>Video Call Link:</b> ${appt.videoCallLink ? `<a href='${appt.videoCallLink}' class='text-blue-600 underline' target='_blank'>Join</a>` : '-'}</div>
      <div><b>Notes:</b> ${appt.notes || '-'}</div>
      <div><b>Prescription:</b> ${appt.prescription ? `<span class='text-green-700'>Yes</span>` : 'No'}</div>
    `;
  } catch (err) {
    appointmentModalContent.innerHTML = `<div class="text-red-600">${err.message}</div>`;
  }
}

function renderAppointments({ appointments, total, page, pages }) {
  const tbody = document.getElementById('appointments-table-body');
  tbody.innerHTML = '';
  appointments.forEach(appt => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 cursor-pointer';
    tr.onclick = () => showAppointmentModal(appt._id);
    tr.innerHTML = `
      <td class="py-2 px-4">${appt.doctor?.name || '-'}</td>
      <td class="py-2 px-4">${appt.patient?.name || '-'}</td>
      <td class="py-2 px-4">${new Date(appt.date).toLocaleString()}</td>
      <td class="py-2 px-4 capitalize">${appt.status}</td>
    `;
    tbody.appendChild(tr);
  });
  renderPagination('appointments', page, pages, fetchAppointments);
}