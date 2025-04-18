class VisitorTracker {
	constructor() {
		// Check if tracking is allowed
		if (this.isTrackingAllowed()) {
			this.trackVisit()
		}
	}

	isTrackingAllowed() {
		// Check for Do Not Track setting
		if (window.doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack) {
			if (
				window.doNotTrack === '1' ||
				navigator.doNotTrack === 'yes' ||
				navigator.doNotTrack === '1' ||
				navigator.msDoNotTrack === '1'
			) {
				return false
			}
		}

		// Check for stored consent
		const trackingConsent = localStorage.getItem('tracking_consent')
		if (trackingConsent === null) {
			// If no consent stored, ask for it
			this.showConsentBanner()
			return false
		}

		return trackingConsent === 'accepted'
	}

	showConsentBanner() {
		const banner = document.createElement('div')
		banner.className = 'tracking-consent-banner fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50'
		banner.innerHTML = `
			<div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
				<div class="mb-4 md:mb-0">
					<p class="text-sm text-gray-700">
						Ta strona używa podstawowych narzędzi analitycznych do zbierania anonimowych informacji o ruchu na stronie.
						Dane są przechowywane lokalnie i nie są udostępniane osobom trzecim.
					</p>
				</div>
				<div class="flex gap-2">
					<button id="accept-tracking" class="px-4 py-2 bg-brown text-white rounded hover:bg-opacity-90">
						Akceptuj
					</button>
					<button id="reject-tracking" class="px-4 py-2 border border-brown text-brown rounded hover:bg-gray-100">
						Odrzuć
					</button>
				</div>
			</div>
		`
		document.body.appendChild(banner)

		// Handle consent choices
		document.getElementById('accept-tracking').addEventListener('click', () => {
			localStorage.setItem('tracking_consent', 'accepted')
			banner.remove()
			this.trackVisit()
		})

		document.getElementById('reject-tracking').addEventListener('click', () => {
			localStorage.setItem('tracking_consent', 'rejected')
			banner.remove()
		})
	}

	async trackVisit() {
		try {
			// Only collect essential information
			const visitData = {
				page_url: window.location.pathname,
				referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
				user_agent: navigator.userAgent.split(' ').slice(-1)[0], // Collect minimal UA info
				screen_resolution: `${window.screen.width}x${window.screen.height}`,
				language: navigator.language,
				visit_timestamp: new Date().toISOString(),
			}

			const response = await fetch('/api/track_visit.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(visitData),
				// Ensure no credentials are sent
				credentials: 'omit',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to track visit')
			}

			console.log('Visit tracked successfully')
		} catch (error) {
			console.error('Error tracking visit:', error)
			// Don't throw the error - just log it to avoid breaking the page
		}
	}
}

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new VisitorTracker()
})
