document.addEventListener('DOMContentLoaded', () => {
  const activitiesListDiv = document.getElementById('activities-list');
  const activitySelect = document.getElementById('activity');
  const signupForm = document.getElementById('signup-form');
  const emailInput = document.getElementById('email');
  const messageDiv = document.getElementById('message');

  let activitiesData = {};

  function renderActivities(data) {
    activitiesListDiv.innerHTML = ''; // Clear "Loading..."
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>'; // Reset dropdown

    if (Object.keys(data).length === 0) {
      activitiesListDiv.innerHTML = '<p>No activities available at the moment.</p>';
      return;
    }

    Object.entries(data).forEach(([name, info]) => {
      // Create the activity card
      const card = document.createElement('div');
      card.className = 'activity-card';

      const participantsList = info.participants.length > 0
        ? info.participants.map(p => `<li>${p}</li>`).join('')
        : '<li class="empty">No participants yet</li>';

      card.innerHTML = `
        <h4>${name}</h4>
        <p>${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Capacity:</strong> ${info.participants.length} / ${info.max_participants}</p>
        <div class="participants-section">
          <h5>Participants</h5>
          <ul class="participants-list">
            ${participantsList}
          </ul>
        </div>
      `;
      activitiesListDiv.appendChild(card);

      // Add activity to the select dropdown
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  async function fetchActivities() {
    try {
      const response = await fetch('/activities');
      if (!response.ok) throw new Error('Failed to load activities.');
      activitiesData = await response.json();
      renderActivities(activitiesData);
    } catch (error) {
      activitiesListDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const activityName = activitySelect.value;
    const email = emailInput.value;

    if (!activityName) {
      showMessage('Please select an activity.', 'error');
      return;
    }

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'An unknown error occurred.');
      }

      showMessage(result.message, 'success');
      signupForm.reset();
      fetchActivities(); // Re-fetch and render to show the new participant
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
  }

  // Initial load
  fetchActivities();
});
