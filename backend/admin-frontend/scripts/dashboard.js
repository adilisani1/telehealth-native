// Sidebar navigation

const sections = ['users', 'appointments', 'stats', 'notifications', 'auditlogs', 'earning-negotiation'];
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const dashboardSections = document.querySelectorAll('.dashboard-section');

sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sections.forEach(section => {
      const el = document.getElementById(`section-${section}`);
      if (el) el.classList.add('hidden');
    });
    const currentSection = document.getElementById(`section-${link.dataset.section}`);
    if (currentSection) currentSection.classList.remove('hidden');
    sidebarLinks.forEach(l => l.classList.remove('bg-blue-800'));
    link.classList.add('bg-blue-800');
    if (link.dataset.section === 'users') fetchUsers();
    if (link.dataset.section === 'appointments') fetchAppointments();
    if (link.dataset.section === 'stats') fetchStats();
    if (link.dataset.section === 'auditlogs') fetchAuditLogs();
    if (link.dataset.section === 'earning-negotiation') fetchNegotiations();
  });
});

// Show users section by default
sidebarLinks[0].click();