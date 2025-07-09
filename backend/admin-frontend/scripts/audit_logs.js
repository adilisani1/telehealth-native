async function fetchAuditLogs(page = 1) {
  let url = `${API_BASE}/audit-log?page=${page}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  renderAuditLogs(data.data || { logs: [], total: 0, page: 1, pages: 1 });
}

function renderAuditLogs({ logs, total, page, pages }) {
  const tbody = document.getElementById('auditlogs-table-body');
  tbody.innerHTML = '';
  logs.forEach(log => {
    let detailsStr = '-';
    if (log.details) {
      try {
        // Try to parse as JSON if possible
        const parsed = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        if (typeof parsed === 'object' && parsed !== null) {
          // Render as a list
          detailsStr = '<ul class="list-disc pl-5 text-xs">';
          for (const [key, value] of Object.entries(parsed)) {
            detailsStr += `<li><span class='font-semibold'>${key}:</span> ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</li>`;
          }
          detailsStr += '</ul>';
        } else {
          detailsStr = String(parsed);
        }
      } catch {
        // If not JSON, just print as string
        detailsStr = String(log.details);
      }
    }
    const tr = document.createElement('tr');
    tr.className = 'border-b-2 border-gray-200 bg-white hover:bg-blue-50 transition-colors duration-150';
    tr.innerHTML = `
      <td class="py-4 px-4 align-top whitespace-nowrap text-sm text-gray-900">${log.user ? `<div class='font-semibold'>${log.user.name}</div><div class='text-xs text-gray-500'>${log.user.email}</div>` : '-'}</td>
      <td class="py-4 px-4 align-top whitespace-nowrap text-sm text-blue-900 font-bold">${log.action}</td>
      <td class="py-4 px-4 align-top whitespace-nowrap text-sm text-gray-700">${log.target || '-'}</td>
      <td class="py-4 px-4 align-top text-gray-800">${detailsStr}</td>
      <td class="py-4 px-4 align-top whitespace-nowrap text-xs text-gray-500">${new Date(log.createdAt || log.timestamp).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
  renderPagination('auditlogs', page, pages, fetchAuditLogs);
}