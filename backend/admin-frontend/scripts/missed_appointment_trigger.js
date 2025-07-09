const triggerMissedBtn = document.getElementById('trigger-missed-btn');
const missedResult = document.getElementById('missed-result');
if (triggerMissedBtn) {
  triggerMissedBtn.onclick = async () => {
    missedResult.classList.add('hidden');
    missedResult.textContent = '';
    try {
      const res = await fetch(TRIGGER_MISSED, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        missedResult.textContent = 'Missed appointments updated successfully!';
        missedResult.classList.remove('hidden');
        missedResult.classList.remove('text-red-700');
        missedResult.classList.add('text-green-700');
      } else {
        throw new Error(data.message || 'Failed to update missed appointments');
      }
    } catch (err) {
      missedResult.textContent = err.message;
      missedResult.classList.remove('hidden');
      missedResult.classList.remove('text-green-700');
      missedResult.classList.add('text-red-700');
    }
  };
}