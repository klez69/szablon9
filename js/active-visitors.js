class ActiveVisitorTracker {
	constructor() {
		// Get base URL dynamically
		const scriptPath = document.currentScript.src
		const baseUrl = scriptPath.substring(0, scriptPath.indexOf('/js/'))
		this.apiEndpoint = `${baseUrl}/visitors_api.php`
		this.currentPage = window.location.pathname
		this.updateInterval = null

		// Debug info
		console.debug('ActiveVisitorTracker initialized with:', {
			apiEndpoint: this.apiEndpoint,
			currentPage: this.currentPage,
		})
	}

	async updateVisitorStatus() {
		try {
			console.debug('Updating visitor status...', {
				endpoint: this.apiEndpoint,
				page: this.currentPage,
			})

			const response = await fetch(`${this.apiEndpoint}?action=update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ page: this.currentPage }),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const result = await response.json()
			if (result.status === 'error') {
				throw new Error(result.message || 'Unknown error occurred')
			}

			console.debug('Visitor status updated successfully:', result)
			return result
		} catch (error) {
			console.error('Error updating visitor status:', error)
			// Emit custom event for error handling
			window.dispatchEvent(
				new CustomEvent('visitorTrackingError', {
					detail: { error: error.message },
				})
			)
			throw error
		}
	}

	startTracking() {
		console.debug('Starting visitor tracking...')

		// Update immediately
		this.updateVisitorStatus().catch(error => {
			console.error('Failed to start tracking:', error)
		})

		// Then update every 30 seconds
		this.updateInterval = setInterval(() => {
			this.updateVisitorStatus().catch(error => {
				console.error('Failed to update tracking:', error)
			})
		}, 30000)

		// Update on page visibility change
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				console.debug('Page became visible, updating visitor status...')
				this.updateVisitorStatus().catch(error => {
					console.error('Failed to update tracking on visibility change:', error)
				})
			}
		})
	}

	stopTracking() {
		console.debug('Stopping visitor tracking...')
		if (this.updateInterval) {
			clearInterval(this.updateInterval)
			this.updateInterval = null
		}
	}
}

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	console.debug('Initializing ActiveVisitorTracker...')
	const tracker = new ActiveVisitorTracker()
	tracker.startTracking()
})
