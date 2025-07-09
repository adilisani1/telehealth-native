function renderPagination(section, page, pages, fetchFn) {
  const container = document.getElementById(`${section}-pagination`);
  container.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === page ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white`;
    btn.onclick = () => fetchFn(i);
    container.appendChild(btn);
  }
}
