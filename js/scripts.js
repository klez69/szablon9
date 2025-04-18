function updateVisitorStatus() {
	const visitorData = {
		page_url: window.location.pathname,
		referrer: document.referrer,
		user_agent: navigator.userAgent,
		screen_resolution: `${window.screen.width}x${window.screen.height}`,
		language: navigator.language,
		ip_address: '', // IP będzie ustawione po stronie serwera
	}

	fetch('track_visit.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(visitorData),
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				console.error('Błąd śledzenia:', data.error)
			}
		})
		.catch(error => {
			console.error('Błąd podczas aktualizacji statusu:', error)
		})
}

// Aktualizuj status co 30 sekund
setInterval(updateVisitorStatus, 30000)

// Wywołaj od razu przy załadowaniu strony
document.addEventListener('DOMContentLoaded', updateVisitorStatus)
