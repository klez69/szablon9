class VisitorTracker {
	constructor() {
		this.apiEndpoint = '/api/track_visit.php'
	}

	async trackVisit() {
		try {
			const visitorData = {
				page_url: window.location.href,
				referrer: document.referrer || null,
				user_agent: navigator.userAgent,
				screen_resolution: `${window.screen.width}x${window.screen.height}`,
				language: navigator.language || navigator.userLanguage,
				visit_timestamp: new Date().toISOString(),
				ip_address: '', // Will be set by the server
			}

			const response = await fetch(this.apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(visitorData),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const result = await response.json()
			console.debug('Visit tracked successfully:', result)
		} catch (error) {
			console.error('Error tracking visit:', error)
		}
	}
}

// Initialize and track visit when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const tracker = new VisitorTracker()
	tracker.trackVisit()
})
