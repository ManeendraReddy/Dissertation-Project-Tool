function updateSessionList() {
  fetch('/sessions')
    .then(response => response.json())
    .then(sessions => {
      const sessionList = document.getElementById('session-list');
      sessionList.innerHTML = '';
      sessions.forEach(session => {
        if (session.user_email === '{{ session.get("email") }}') {
          const sessionItem = document.createElement('div');
          sessionItem.className = 'session-item';
          sessionItem.id = `session-${session.session_id}`;
          sessionItem.innerHTML = `
            <div class="session-details">
              <p>Title:
                <a href="/session/${session.session_id}/${session.user_email}">
                    ${session.title}
                </a>
              </p>
              <p>Session ID: ${session.session_id}</p>
            </div>
            <form method="POST" action="/delete_session/${session.session_id}" class="delete-form">
              <button type="submit" class="delete-button">Delete</button>
            </form>
                    `;
            sessionList.appendChild(sessionItem);
        }
      });
    });
}

document.addEventListener('submit', function(event) {
  if (event.target.classList.contains('delete-form')) {
    event.preventDefault();
    const form = event.target;
    fetch(form.action, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        document.getElementById(`session-${form.action.split('/').pop()}`).remove();
      } else {
        alert('Error deleting session.');
      }
    });
  }
});

setInterval(updateSessionList, 10000);

document.getElementById('clear-title').addEventListener('click', function() {
  document.getElementById('title').value = '';
  document.getElementById('title').dispatchEvent(new Event('input'));
});

document.getElementById('title').addEventListener('input', function() {
  const clearIcon = document.getElementById('clear-title');
  clearIcon.style.display = 'block';
});
