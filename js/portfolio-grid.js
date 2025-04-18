class PortfolioGrid {
	constructor() {
		this.itemsPerPage = 8
		this.currentPage = 1
		this.currentFilter = 'all'
		this.items = []
		this.loading = true

		this.gridContainer = document.querySelector('.portfolio-grid')
		this.loadingElement = document.querySelector('.portfolio-grid .loading')
		this.paginationContainer = document.querySelector('.pagination')

		this.initializeFilterButtons()
		this.loadItems()
	}

	initializeFilterButtons() {
		const filterButtons = document.querySelectorAll('.filter-button')
		filterButtons.forEach(button => {
			button.addEventListener('click', () => {
				const filter = button.dataset.filter
				this.setActiveFilter(filter)
				this.currentPage = 1
				this.updateDisplay()
			})
		})
	}

	setActiveFilter(filter) {
		const buttons = document.querySelectorAll('.filter-button')
		buttons.forEach(button => {
			button.classList.toggle('active', button.dataset.filter === filter)
		})
		this.currentFilter = filter
	}

	async loadItems() {
		try {
			const response = await fetch('api/get-portfolio-items.php')
			if (!response.ok) throw new Error('Failed to load portfolio items')

			this.items = await response.json()
			this.loading = false
			this.updateDisplay()
		} catch (error) {
			console.error('Error loading portfolio items:', error)
			this.loadingElement.textContent = 'Wystąpił błąd podczas ładowania.'
		}
	}

	getFilteredItems() {
		if (this.currentFilter === 'all') return this.items
		return this.items.filter(item => item.category === this.currentFilter)
	}

	updateDisplay() {
		const filteredItems = this.getFilteredItems()
		const totalPages = Math.ceil(filteredItems.length / this.itemsPerPage)

		// Update pagination
		this.updatePagination(totalPages)

		// Calculate items for current page
		const startIndex = (this.currentPage - 1) * this.itemsPerPage
		const itemsToShow = filteredItems.slice(startIndex, startIndex + this.itemsPerPage)

		// Clear and update grid
		this.gridContainer.innerHTML = ''
		itemsToShow.forEach(item => this.renderItem(item))

		// Show/hide loading state
		this.loadingElement.style.display = this.loading ? 'block' : 'none'
	}

	renderItem(item) {
		const itemElement = document.createElement('div')
		itemElement.className = 'portfolio-item'
		itemElement.innerHTML = `
			<img src="${item.imageUrl}" alt="${item.title}" />
			<div class="portfolio-item-content">
				<h3>${item.title}</h3>
				<p>${item.description}</p>
				<a href="${item.detailUrl}" class="btn">Zobacz więcej</a>
			</div>
		`
		this.gridContainer.appendChild(itemElement)
	}

	updatePagination(totalPages) {
		this.paginationContainer.innerHTML = ''

		if (totalPages <= 1) return

		// Previous button
		if (this.currentPage > 1) {
			const prevButton = this.createPaginationButton('«', this.currentPage - 1)
			this.paginationContainer.appendChild(prevButton)
		}

		// Page buttons
		for (let i = 1; i <= totalPages; i++) {
			const pageButton = this.createPaginationButton(i, i)
			if (i === this.currentPage) pageButton.classList.add('active')
			this.paginationContainer.appendChild(pageButton)
		}

		// Next button
		if (this.currentPage < totalPages) {
			const nextButton = this.createPaginationButton('»', this.currentPage + 1)
			this.paginationContainer.appendChild(nextButton)
		}
	}

	createPaginationButton(text, page) {
		const button = document.createElement('button')
		button.className = 'pagination-button'
		button.textContent = text
		button.addEventListener('click', () => {
			this.currentPage = page
			this.updateDisplay()
			// Scroll to portfolio section
			document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' })
		})
		return button
	}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new PortfolioGrid()
})
