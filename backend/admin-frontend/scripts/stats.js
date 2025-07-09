let statsChart;

async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
  const data = await res.json();
  renderStats(data.data || {});
}

function renderStats(stats) {
  // metrics calculations
  const activeUsers = (stats.totalUsers ?? 0) - (stats.suspendedUsers ?? 0);
  const missedRate = stats.totalAppointments ? Math.round(((stats.missedAppointments ?? 0) / stats.totalAppointments) * 100) : 0;
  const doctorPatientRatio = stats.totalPatients ? (stats.totalDoctors / stats.totalPatients).toFixed(2) : 'N/A';

  // Card data with icons
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500', icon: 'user-group' },
    { label: 'Active Users', value: activeUsers, color: 'bg-green-500', icon: 'user-check' },
    { label: 'Doctors', value: stats.totalDoctors, color: 'bg-cyan-600', icon: 'user-doctor' },
    { label: 'Patients', value: stats.totalPatients, color: 'bg-purple-500', icon: 'user' },
    { label: 'Doctor/Patient Ratio', value: doctorPatientRatio, color: 'bg-indigo-500', icon: 'scale' },
    { label: 'Appointments', value: stats.totalAppointments, color: 'bg-yellow-500', icon: 'calendar-days' },
    { label: 'Completed', value: stats.completedAppointments, color: 'bg-teal-500', icon: 'check-circle' },
    { label: 'Upcoming', value: stats.upcomingAppointments, color: 'bg-pink-500', icon: 'clock' },
    { label: 'Missed', value: stats.missedAppointments, color: 'bg-red-500', icon: 'exclamation-triangle' },
    { label: 'Missed Rate', value: missedRate + '%', color: 'bg-red-400', icon: 'arrow-trending-down', progress: missedRate },
  ];
  const container = document.getElementById('stats-cards');
  container.innerHTML = '';
  cards.forEach(card => {
    container.innerHTML += `
      <div class="rounded-2xl shadow-xl p-6 text-white ${card.color} flex flex-col items-center relative overflow-hidden animate-fade-in">
        <div class="absolute right-4 top-4 opacity-20 text-6xl pointer-events-none">
          <svg class="w-12 h-12"><use href="https://unpkg.com/heroicons@2.0.16/dist/24/outline.svg#${card.icon}" /></svg>
        </div>
        <div class="text-3xl font-extrabold mb-2 animate-count" data-value="${card.value}">${card.value ?? 0}</div>
        <div class="mt-1 text-lg font-semibold">${card.label}</div>
        ${card.progress !== undefined ? `<div class='w-full mt-3'><div class='h-2 rounded bg-white/30'><div class='h-2 rounded bg-white' style='width:${card.progress}%; transition:width 1s;'></div></div><div class='text-xs mt-1 text-white/80'>${card.progress}% Missed</div></div>` : ''}
      </div>
    `;
  });
  // Animate numbers
  setTimeout(() => {
    document.querySelectorAll('.animate-count').forEach(el => {
      const end = parseInt(el.dataset.value) || 0;
      let cur = 0;
      const step = Math.ceil(end / 30) || 1;
      const interval = setInterval(() => {
        cur += step;
        if (cur >= end) { el.textContent = end; clearInterval(interval); }
        else el.textContent = cur;
      }, 20);
    });
  }, 100);

  // --- Chart.js Bar Chart ---
  const ctx = document.getElementById('stats-chart').getContext('2d');
  const chartData = {
    labels: ['Users', 'Doctors', 'Patients', 'Appointments', 'Completed', 'Upcoming', 'Missed'],
    datasets: [{
      label: 'Count',
      data: [stats.totalUsers, stats.totalDoctors, stats.totalPatients, stats.totalAppointments, stats.completedAppointments, stats.upcomingAppointments, stats.missedAppointments],
      backgroundColor: [
        '#3b82f6', '#06b6d4', '#a21caf', '#f59e42', '#14b8a6', '#ec4899', '#ef4444'
      ],
      borderRadius: 8,
      borderWidth: 1
    }]
  };
  if (statsChart) statsChart.destroy();
  statsChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Platform Metrics', color: '#1e293b', font: { size: 18, weight: 'bold' } }
      },
      scales: {
        x: { ticks: { color: '#1e293b', font: { weight: 'bold' } } },
        y: { beginAtZero: true, ticks: { color: '#1e293b' } }
      },
      animation: { duration: 1200 }
    }
  });

  // --- Export to CSV ---
  const exportBtn = document.getElementById('export-stats-btn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const rows = [
        ['Metric', 'Value'],
        ['Total Users', stats.totalUsers],
        ['Active Users', activeUsers],
        ['Doctors', stats.totalDoctors],
        ['Patients', stats.totalPatients],
        ['Doctor/Patient Ratio', doctorPatientRatio],
        ['Appointments', stats.totalAppointments],
        ['Completed', stats.completedAppointments],
        ['Upcoming', stats.upcomingAppointments],
        ['Missed', stats.missedAppointments],
        ['Missed Rate', missedRate + '%'],
        ['Suspended Users', stats.suspendedUsers]
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'telehealth-stats.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }
}