class ActiveVisitorTracker {
	constructor(containerId, options = {}) {
		this.containerId = containerId
		this.container = document.getElementById(containerId)
		this.options = {
			refreshInterval: options.refreshInterval || 30000, // 30 seconds default
			apiEndpoint: options.apiEndpoint || '../visitors_api.php',
			onError: options.onError || console.error,
		}
		this.isLoading = false
		this.timer = null
		this.init()
	}

	init() {
		if (!this.container) {
			throw new Error(`Container with id "${this.containerId}" not found`)
		}
		this.createStructure()
		this.startTracking()
	}

	createStructure() {
		this.container.innerHTML = `
            <div class="visitors-stats">
                <div class="visitors-header">
                    <h3 class="visitors-title">Aktywni odwiedzający</h3>
                    <div class="visitors-refresh">
                        <span class="last-update"></span>
                        <button class="refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="visitors-content">
                    <div class="visitors-summary">
                        <div class="stat-item">
                            <span class="stat-label">Łącznie aktywnych</span>
                            <span class="stat-value total-visitors">-</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Wyświetlenia stron</span>
                            <span class="stat-value total-views">-</span>
                        </div>
                    </div>
                    <div class="visitors-list"></div>
                </div>
            </div>
        `

		// Add styles
		const style = document.createElement('style')
		style.textContent = `
            .visitors-stats {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                padding: 20px;
            }
            .visitors-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .visitors-title {
                font-size: 1.2em;
                color: #8b6d5c;
                margin: 0;
            }
            .visitors-refresh {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .last-update {
                color: #666;
                font-size: 0.9em;
            }
            .refresh-btn {
                background: none;
                border: none;
                color: #8b6d5c;
                cursor: pointer;
                padding: 5px;
                transition: transform 0.2s;
            }
            .refresh-btn:hover {
                transform: rotate(180deg);
            }
            .refresh-btn.loading {
                animation: spin 1s linear infinite;
            }
            .visitors-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 6px;
            }
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .stat-label {
                color: #666;
                font-size: 0.9em;
                margin-bottom: 5px;
            }
            .stat-value {
                font-size: 1.5em;
                font-weight: 600;
                color: #8b6d5c;
            }
            .visitors-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .visitor-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                transition: background-color 0.2s;
            }
            .visitor-item:hover {
                background: #f0f0f0;
            }
            .visitor-page {
                font-weight: 500;
                color: #333;
            }
            .visitor-count {
                background: #8b6d5c;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.9em;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `
		document.head.appendChild(style)

		// Add event listeners
		this.container.querySelector('.refresh-btn').addEventListener('click', () => {
			this.fetchData()
		})
	}

	startTracking() {
		this.fetchData()
		this.timer = setInterval(() => this.fetchData(), this.options.refreshInterval)
	}

	stopTracking() {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
	}

	async fetchData() {
		if (this.isLoading) return

		const refreshBtn = this.container.querySelector('.refresh-btn i')
		refreshBtn.classList.add('loading')
		this.isLoading = true

		try {
			const response = await fetch(`${this.options.apiEndpoint}?action=get`)
			const data = await response.json()

			if (data.success) {
				this.updateDisplay(data)
			} else {
				throw new Error(data.error || 'Failed to fetch visitor data')
			}
		} catch (error) {
			this.options.onError('Error fetching visitor data:', error)
			this.showError('Nie udało się pobrać danych o odwiedzających')
		} finally {
			refreshBtn.classList.remove('loading')
			this.isLoading = false
			this.updateLastRefreshTime()
		}
	}

	updateDisplay(data) {
		// Update summary statistics
		this.container.querySelector('.total-visitors').textContent = data.totals?.total_active_visitors || '0'
		this.container.querySelector('.total-views').textContent = data.totals?.total_page_views || '0'

		// Update visitors list
		const listContainer = this.container.querySelector('.visitors-list')
		listContainer.innerHTML = ''

		if (!data.visitors || data.visitors.length === 0) {
			listContainer.innerHTML = `
                <div class="text-center p-4 text-gray-500">
                    Brak aktywnych odwiedzających
                </div>
            `
			return
		}

		data.visitors.forEach(visitor => {
			const item = document.createElement('div')
			item.className = 'visitor-item'
			item.innerHTML = `
                <span class="visitor-page">${this.formatPageUrl(visitor.page)}</span>
                <span class="visitor-count">${visitor.count}</span>
            `
			listContainer.appendChild(item)
		})
	}

	formatPageUrl(url) {
		try {
			const path = new URL(url).pathname
			return path === '/' ? 'Strona główna' : path.replace(/^\/|\/$/g, '').replace(/\//g, ' / ')
		} catch {
			return url
		}
	}

	updateLastRefreshTime() {
		const lastUpdate = this.container.querySelector('.last-update')
		const now = new Date()
		const time = now.toLocaleTimeString('pl-PL', {
			hour: '2-digit',
			minute: '2-digit',
		})
		lastUpdate.textContent = `Ostatnia aktualizacja: ${time}`
	}

	showError(message) {
		const listContainer = this.container.querySelector('.visitors-list')
		listContainer.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `
	}

	destroy() {
		this.stopTracking()
		if (this.container) {
			this.container.innerHTML = ''
		}
	}
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ActiveVisitorTracker
}
