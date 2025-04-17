// Klasa do zarządzania galerią
class GalleryManager {
	constructor() {
		console.log('Inicjalizacja GalleryManager')
		this.apiUrl = window.location.pathname.includes('admin') ? 'gallery_api.php' : './gallery_api.php'
		console.log('URL API:', this.apiUrl)
		this.initializeGallery()
		this.setupEventListeners()
	}

	// Inicjalizacja galerii
	async initializeGallery() {
		console.log('Rozpoczęcie inicjalizacji galerii')
		try {
			const data = await this.getGalleryData()
			console.log('Otrzymane dane:', data)
			if (data.success) {
				this.updateGalleryDisplay(data.data)
			} else {
				console.error('Błąd podczas pobierania danych:', data.error)
				this.showError('Nie udało się załadować galerii. Spróbuj odświeżyć stronę.')
			}
		} catch (error) {
			console.error('Błąd podczas inicjalizacji galerii:', error)
			this.showError('Wystąpił błąd podczas ładowania galerii.')
		}
	}

	// Pobieranie danych z API
	async getGalleryData() {
		console.log('Pobieranie danych z:', this.apiUrl)
		try {
			const response = await fetch(`${this.apiUrl}?action=get`)
			console.log('Status odpowiedzi:', response.status)

			if (!response.ok) {
				throw new Error(`Błąd HTTP! status: ${response.status}`)
			}

			const text = await response.text()
			console.log('Surowa odpowiedź:', text)

			try {
				const data = JSON.parse(text)
				console.log('Sparsowane dane:', data)
				return data
			} catch (parseError) {
				console.error('Błąd parsowania JSON:', parseError)
				throw new Error('Nieprawidłowy format odpowiedzi z serwera')
			}
		} catch (error) {
			console.error('Szczegóły błędu:', error)
			return { success: false, error: error.message }
		}
	}

	// Tworzenie elementu galerii
	createGalleryItem(item) {
		return `
            <div class="portfolio-item ${item.category}" data-aos="fade-up">
                <div class="relative overflow-hidden rounded-lg group">
                    <img
                        src="${item.image_src}"
                        alt="${item.alt_text || item.title}"
                        class="w-full h-auto transition-all duration-500 group-hover:scale-110"
                        loading="lazy"
                        onerror="this.src='images/placeholder.jpg'; console.log('Błąd ładowania obrazu:', '${
													item.image_src
												}')"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                        <div class="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-center px-6">
                            <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
                            <p class="mb-4">${item.description || ''}</p>
                            <a href="#" class="px-4 py-2 rounded-md text-white font-medium" style="background-color: var(--brown)">
                                Zobacz więcej
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `
	}

	// Aktualizacja wyświetlania galerii
	updateGalleryDisplay(data) {
		console.log('Aktualizacja wyświetlania z danymi:', data)
		const portfolioGrid = document.getElementById('portfolio-grid')
		if (!portfolioGrid) {
			console.error('Nie znaleziono elementu portfolio-grid')
			return
		}

		if (!Array.isArray(data) || data.length === 0) {
			console.log('Brak danych do wyświetlenia')
			portfolioGrid.innerHTML = '<p class="text-center col-span-full py-8">Brak zdjęć w galerii.</p>'
			return
		}

		portfolioGrid.innerHTML = data
			.map(item => {
				console.log('Tworzenie elementu dla:', item)
				return this.createGalleryItem(item)
			})
			.join('')

		// Inicjalizacja AOS dla nowych elementów
		if (typeof AOS !== 'undefined') {
			AOS.refresh()
		}

		this.initializeFilters()
	}

	// Pokazywanie błędu
	showError(message) {
		const portfolioGrid = document.getElementById('portfolio-grid')
		if (portfolioGrid) {
			portfolioGrid.innerHTML = `
                <div class="col-span-full text-center text-red-600 py-8">
                    <i class="fas fa-exclamation-triangle text-3xl mb-4"></i>
                    <p>${message}</p>
                </div>
            `
		}
	}

	// Inicjalizacja filtrów
	initializeFilters() {
		console.log('Inicjalizacja filtrów')
		const filterButtons = document.querySelectorAll('.portfolio-filter-btn')
		if (!filterButtons.length) {
			console.log('Nie znaleziono przycisków filtrowania')
			return
		}

		filterButtons.forEach(button => {
			button.addEventListener('click', () => {
				const filter = button.getAttribute('data-filter')
				console.log('Kliknięto filtr:', filter)

				// Aktualizacja klas przycisków
				filterButtons.forEach(btn => {
					btn.style.backgroundColor = ''
					btn.style.color = 'var(--brown)'
					btn.style.border = '1px solid var(--brown)'
				})
				button.style.backgroundColor = 'var(--brown)'
				button.style.color = 'white'
				button.style.border = '1px solid var(--brown)'

				this.filterGallery(filter)
			})
		})
	}

	// Filtrowanie galerii
	filterGallery(filter) {
		console.log('Filtrowanie galerii:', filter)
		const items = document.querySelectorAll('.portfolio-item')
		items.forEach(item => {
			if (filter === 'all' || item.classList.contains(filter)) {
				item.style.display = ''
				item.style.opacity = '1'
				item.style.transform = 'scale(1)'
			} else {
				item.style.opacity = '0'
				item.style.transform = 'scale(0.8)'
				setTimeout(() => {
					item.style.display = 'none'
				}, 300)
			}
		})

		// Odśwież AOS po filtrowaniu
		if (typeof AOS !== 'undefined') {
			setTimeout(() => {
				AOS.refresh()
			}, 350)
		}
	}

	// Konfiguracja event listenerów
	setupEventListeners() {
		console.log('Konfiguracja event listenerów')
	}
}

// Inicjalizacja menedżera galerii po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM załadowany, tworzenie GalleryManager')
	const galleryManager = new GalleryManager()
})
