async function fetchAppointments(page = 1) {
  const doctor = document.getElementById('appointment-doctor').value;
  const patient = document.getElementById('appointment-patient').value;
  const status = document.getElementById('appointment-status').value;
  let url = `${API_BASE}/appointments?page=${page}`;
  if (doctor) url += `&doctor=${doctor}`;
  if (patient) url += `&patient=${patient}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  renderAppointments(data.data || { appointments: [], total: 0, page: 1, pages: 1 });
}

document.getElementById('appointment-doctor').addEventListener('input', () => fetchAppointments());
document.getElementById('appointment-patient').addEventListener('input', () => fetchAppointments());
document.getElementById('appointment-status').addEventListener('change', () => fetchAppointments());
