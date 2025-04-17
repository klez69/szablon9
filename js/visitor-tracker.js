class VisitorTracker {
	constructor() {
		this.trackVisit()
	}

	async trackVisit() {
		try {
			const visitData = {
				page: window.location.pathname,
				referrer: document.referrer || 'direct',
				userAgent: navigator.userAgent,
				screenResolution: `${window.screen.width}x${window.screen.height}`,
				language: navigator.language,
				timestamp: new Date().toISOString(),
			}

			const response = await fetch('../api/track_visit.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(visitData),
			})

			if (!response.ok) {
				throw new Error('Failed to track visit')
			}

			console.log('Visit tracked successfully')
		} catch (error) {
			console.error('Error tracking visit:', error)
		}
	}
}

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new VisitorTracker()
})
