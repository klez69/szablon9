class PortfolioManager {
	constructor() {
		this.items = []
		this.currentFilter = 'all'
		this.itemsPerPage = 8
		this.currentPage = 1
		this.container = document.querySelector('.portfolio-container')
		this.filterButtons = document.querySelectorAll('.portfolio-filter button')
		this.loadingElement = document.createElement('div')
		this.loadingElement.className = 'loading-spinner'
		this.loadingElement.innerHTML = '<div class="spinner"></div>'

		this.init()
	}

	async init() {
		this.setupEventListeners()
		await this.fetchItems()
		this.displayItems()
	}

	setupEventListeners() {
		this.filterButtons.forEach(button => {
			button.addEventListener('click', () => {
				const filter = button.getAttribute('data-filter')
				this.filterItems(filter)

				// Update active button state
				this.filterButtons.forEach(btn => btn.classList.remove('active'))
				button.classList.add('active')
			})
		})
	}

	async fetchItems() {
		try {
			this.showLoading()
			const response = await fetch('/api/get-portfolio-items.php')
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			if (data.success) {
				this.items = data.items
			} else {
				console.error('Failed to fetch portfolio items:', data.message)
			}
		} catch (error) {
			console.error('Error fetching portfolio items:', error)
			this.showError('Nie udało się załadować galerii. Spróbuj odświeżyć stronę.')
		} finally {
			this.hideLoading()
		}
	}

	filterItems(filter) {
		this.currentFilter = filter
		this.currentPage = 1
		this.displayItems()
	}

	getFilteredItems() {
		return this.items.filter(item => this.currentFilter === 'all' || item.category === this.currentFilter)
	}

	getCurrentPageItems() {
		const filteredItems = this.getFilteredItems()
		const start = (this.currentPage - 1) * this.itemsPerPage
		return filteredItems.slice(start, start + this.itemsPerPage)
	}

	displayItems() {
		const items = this.getCurrentPageItems()
		const itemsHtml = items
			.map(
				item => `
            <div class="portfolio-item" data-category="${item.category}">
                <div class="portfolio-img">
                    <img src="${item.image_url}" alt="${item.title}">
                </div>
                <div class="portfolio-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    ${item.detail_url ? `<a href="${item.detail_url}" class="details-link">Zobacz więcej</a>` : ''}
                </div>
            </div>
        `
			)
			.join('')

		this.container.innerHTML = itemsHtml
		this.updatePagination()
	}

	updatePagination() {
		const filteredItems = this.getFilteredItems()
		const totalPages = Math.ceil(filteredItems.length / this.itemsPerPage)

		if (totalPages <= 1) {
			document.querySelector('.portfolio-pagination')?.remove()
			return
		}

		let paginationHtml = `
            <div class="portfolio-pagination">
                <button class="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                    &laquo; Poprzednia
                </button>
                <span class="page-info">${this.currentPage} z ${totalPages}</span>
                <button class="next-page" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    Następna &raquo;
                </button>
            </div>
        `

		let paginationElement = document.querySelector('.portfolio-pagination')
		if (!paginationElement) {
			paginationElement = document.createElement('div')
			this.container.after(paginationElement)
		}
		paginationElement.outerHTML = paginationHtml

		// Setup pagination event listeners
		document.querySelector('.prev-page')?.addEventListener('click', () => {
			if (this.currentPage > 1) {
				this.currentPage--
				this.displayItems()
			}
		})

		document.querySelector('.next-page')?.addEventListener('click', () => {
			if (this.currentPage < totalPages) {
				this.currentPage++
				this.displayItems()
			}
		})
	}

	showLoading() {
		this.container.appendChild(this.loadingElement)
	}

	hideLoading() {
		this.loadingElement.remove()
	}

	showError(message) {
		const errorElement = document.createElement('div')
		errorElement.className = 'portfolio-error'
		errorElement.textContent = message
		this.container.appendChild(errorElement)
	}
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new PortfolioManager()
})
