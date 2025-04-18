// Czekaj na załadowanie dokumentu
document.addEventListener('DOMContentLoaded', function () {
	// Inicjalizacja AOS (Animate on Scroll)
	AOS.init({
		duration: 800,
		once: false,
		mirror: true,
	})

	// Sprawdź czy są dane galerii w baza.js i aktualizuj portfolio
	updatePortfolioFromData()

	// Inicjalizacja filtrów portfolio na początku
	initializePortfolioFilters()

	// Inicjalizacja lightbox dla wszystkich zdjęć na początku
	initializeLightbox()

	// Mobile menu toggle
	const mobileMenuButton = document.getElementById('mobile-menu-button')
	const mobileMenu = document.getElementById('mobile-menu')

	if (mobileMenuButton && mobileMenu) {
		mobileMenuButton.addEventListener('click', function () {
			mobileMenu.classList.toggle('hidden')
		})
	}

	// Navbar scroll effect
	const navbar = document.getElementById('navbar')

	function handleScroll() {
		if (window.scrollY > 50) {
			navbar.classList.add('py-2', 'shadow-md', 'bg-opacity-98')
		} else {
			navbar.classList.remove('py-2', 'shadow-md', 'bg-opacity-98')
		}
	}

	window.addEventListener('scroll', handleScroll)
	handleScroll() // Sprawdź na starcie

	// Portfolio filtering
	const filterButtons = document.querySelectorAll('.portfolio-filter-btn')
	const portfolioItems = document.querySelectorAll('.portfolio-item')
	const portfolioContainer = document.querySelector('.portfolio-grid-container')

	// Ustaw wysokość kontenera na początku
	if (portfolioContainer && portfolioItems.length > 0) {
		// Usuwamy ustawianie stałej wysokości dla kontenera, aby umożliwić automatyczne dostosowanie
		portfolioContainer.style.minHeight = 'auto'
	}

	// Resetowanie wszystkich elementów - pokazanie ich wszystkich na początku
	function resetAllItems() {
		portfolioItems.forEach(item => {
			item.style.position = 'relative'
			item.style.display = 'flex'
			item.classList.remove('portfolio-item-fade-out')
			item.classList.add('portfolio-item-fade-in')
		})
	}

	// Wywołaj raz na początku, aby upewnić się, że wszystkie elementy są widoczne
	resetAllItems()

	// Policz i wyświetl elementy z kategorii "special" (okolicznościowe)
	const specialItems = document.querySelectorAll('.portfolio-item.special, .portfolio-item.okolicznosciowe')
	console.log('Liczba elementów okolicznościowych (special/okolicznosciowe):', specialItems.length)
	console.log(
		'Elementy okolicznościowe:',
		Array.from(specialItems).map(item => item.className)
	)

	filterButtons.forEach(button => {
		button.addEventListener('click', function () {
			// Usuń klasę active ze wszystkich przycisków
			filterButtons.forEach(btn => {
				btn.classList.remove('active')
				btn.style.backgroundColor = ''
				btn.style.color = 'var(--brown)'
			})

			// Dodaj klasę active do klikniętego przycisku
			this.classList.add('active')
			this.style.backgroundColor = 'var(--brown)'
			this.style.color = 'white'

			const filter = this.getAttribute('data-filter')
			console.log('Filtrowanie według kategorii:', filter)

			// Specjalne logowanie dla filtra "special" (okolicznościowe)
			if (filter === 'special') {
				console.log('Filtrujemy według kategorii OKOLICZNOŚCIOWE (special)')
				console.log(
					'Liczba elementów special:',
					document.querySelectorAll('.portfolio-item.special, .portfolio-item.okolicznosciowe').length
				)
				console.log(
					'Elementy special:',
					Array.from(document.querySelectorAll('.portfolio-item.special, .portfolio-item.okolicznosciowe')).map(
						item => item.className
					)
				)
			}

			// Sprawdź, ile elementów jest w każdej kategorii
			const counts = {
				all: portfolioItems.length,
				women: document.querySelectorAll('.portfolio-item.women').length,
				men: document.querySelectorAll('.portfolio-item.men').length,
				color: document.querySelectorAll('.portfolio-item.color').length,
				special: document.querySelectorAll('.portfolio-item.special, .portfolio-item.okolicznosciowe').length,
			}
			console.log('Liczba elementów w kategoriach:', counts)

			// Przetwórz każdy element portfolio
			portfolioItems.forEach(item => {
				console.log('Przetwarzanie elementu:', item.className, 'porównywane z filtrem:', filter)

				if (filter === 'all') {
					// Pokaż wszystkie elementy
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję wszystkie')
				} else if (
					filter === 'special' &&
					(item.classList.contains('special') ||
						item.classList.contains('okolicznosciowe') ||
						item.getAttribute('data-category') === 'special')
				) {
					// Specjalny przypadek dla filtra "special" (okolicznościowe)
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element okolicznościowy:', item.className)
				} else if (item.classList.contains(filter)) {
					// Standardowy przypadek dla innych filtrów
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element:', item.className)
				} else {
					// Ukryj elementy bez wybranej klasy
					item.classList.add('portfolio-item-fade-out')
					item.classList.remove('portfolio-item-fade-in')

					// Opóźnij zmianę na display:none, aby animacja zadziałała
					setTimeout(() => {
						if (filter === 'special') {
							// Dodatkowe sprawdzenie dla kategorii okolicznościowe
							if (
								!item.classList.contains('special') &&
								!item.classList.contains('okolicznosciowe') &&
								item.getAttribute('data-category') !== 'special'
							) {
								item.style.display = 'none'
								item.style.position = 'absolute'
								console.log('Ukrywam element (nie jest okolicznościowy):', item.className)
							}
						} else if (!item.classList.contains(filter)) {
							item.style.display = 'none'
							item.style.position = 'absolute'
							console.log('Ukrywam element:', item.className)
						}
					}, 500)
				}
			})

			// Zaktualizuj wysokość kontenera portfolio po filtrowaniu
			setTimeout(() => {
				let visibleItems
				if (filter === 'all') {
					visibleItems = portfolioItems
				} else if (filter === 'special') {
					visibleItems = document.querySelectorAll(
						".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
					)
				} else {
					visibleItems = document.querySelectorAll(`.portfolio-item.${filter}`)
				}

				if (visibleItems.length > 0) {
					console.log('Widoczne elementy po filtrowaniu:', visibleItems.length)

					const grid = document.querySelector('.grid')
					// Usuwamy ustawianie stałej wysokości - pozwalamy, aby grid automatycznie się rozciągał
					portfolioContainer.style.minHeight = 'auto'

					// Dodaj obowiązkowe ponowne przeliczenie układu po małym opóźnieniu
					setTimeout(() => {
						// Wymuś ponowne obliczenie układu strony
						window.dispatchEvent(new Event('resize'))
					}, 100)
				}
			}, 550)
		})
	})

	// Testimonial slider
	const testimonialsContainer = document.getElementById('testimonial-container')
	const testimonialSlides = document.querySelectorAll('.testimonial-slide')
	const prevButton = document.getElementById('prev-testimonial')
	const nextButton = document.getElementById('next-testimonial')

	// Utworzenie nieskończonego slidera przez klonowanie elementów
	if (testimonialsContainer && testimonialSlides.length > 0) {
		// Sklonuj pierwsze i ostatnie elementy do nieskończonego przewijania
		const cloneFirst = testimonialSlides[0].cloneNode(true)
		const cloneLast = testimonialSlides[testimonialSlides.length - 1].cloneNode(true)

		// Dodaj klasy dla identyfikacji klonów
		cloneFirst.classList.add('clone')
		cloneLast.classList.add('clone')

		// Dodaj klony na początku i końcu
		testimonialsContainer.appendChild(cloneFirst)
		testimonialsContainer.insertBefore(cloneLast, testimonialsContainer.firstChild)
	}

	// Pobierz wszystkie slajdy łącznie z klonami
	const allSlides = document.querySelectorAll('.testimonial-slide')

	let currentSlide = 1 // Zaczynamy od indeksu 1 (pierwszy prawdziwy slajd)
	const slideWidth = 100 // percentage
	let isTransitioning = false

	// Ustaw początkową pozycję kontenera (przesunięty o 1 slajd)
	testimonialsContainer.style.transform = `translateX(-${slideWidth / (window.innerWidth >= 1024 ? 3 : 1)}%)`

	function goToSlide(slideIndex, instant = false) {
		if (isTransitioning && !instant) return
		isTransitioning = true

		// Dodaj animację przejścia, chyba że chcemy natychmiastowej zmiany
		if (!instant) {
			testimonialsContainer.classList.add('testimonial-transition')
		} else {
			testimonialsContainer.classList.remove('testimonial-transition')
		}

		currentSlide = slideIndex
		const translateValue = (-currentSlide * slideWidth) / (window.innerWidth >= 1024 ? 3 : 1)

		testimonialsContainer.style.transform = `translateX(${translateValue}%)`

		// Sprawdź czy jesteśmy na klonie i przeskocz do oryginalnego slajdu po zakończeniu animacji
		setTimeout(() => {
			isTransitioning = false
			testimonialsContainer.classList.remove('testimonial-transition')

			// Jeśli jesteśmy na ostatnim klonie, przeskocz do pierwszego prawdziwego slajdu
			if (currentSlide >= allSlides.length - 1) {
				currentSlide = 1
				testimonialsContainer.style.transform = `translateX(-${slideWidth / (window.innerWidth >= 1024 ? 3 : 1)}%)`
			}
			// Jeśli jesteśmy na pierwszym klonie, przeskocz do ostatniego prawdziwego slajdu
			else if (currentSlide <= 0) {
				currentSlide = allSlides.length - 2
				const newTranslateValue = (-currentSlide * slideWidth) / (window.innerWidth >= 1024 ? 3 : 1)
				testimonialsContainer.style.transform = `translateX(${newTranslateValue}%)`
			}
		}, 500)
	}

	// Auto-play dla testimoniali
	let testimonialInterval = setInterval(() => {
		goToSlide(currentSlide + 1)
	}, 5000)

	if (prevButton && nextButton) {
		prevButton.addEventListener('click', () => {
			clearInterval(testimonialInterval)
			goToSlide(currentSlide - 1)
			// Restart auto-play
			testimonialInterval = setInterval(() => {
				goToSlide(currentSlide + 1)
			}, 5000)
		})

		nextButton.addEventListener('click', () => {
			clearInterval(testimonialInterval)
			goToSlide(currentSlide + 1)
			// Restart auto-play
			testimonialInterval = setInterval(() => {
				goToSlide(currentSlide + 1)
			}, 5000)
		})
	}

	// Obsługa resize dla slidera testimoniali
	window.addEventListener('resize', () => {
		// Natychmiastowa zmiana położenia bez animacji
		goToSlide(currentSlide, true)
	})

	// Liczniki statystyk - animacja liczenia
	const counters = document.querySelectorAll('.counter-value')
	let hasAnimated = false

	function animateCounter() {
		if (hasAnimated) return

		counters.forEach(counter => {
			const target = +counter.getAttribute('data-target')
			const duration = 2000 // czas trwania animacji w ms
			const step = Math.ceil(target / (duration / 30)) // aktualizuj co 30ms
			let current = 0

			const updateCounter = () => {
				current += step
				if (current >= target) {
					current = target
					clearInterval(timer)
				}
				counter.textContent = current + (counter.getAttribute('data-suffix') || '')
			}

			const timer = setInterval(updateCounter, 30)
		})

		hasAnimated = true
	}

	// Uruchom animację liczników, gdy przewiniemy do sekcji statystyk
	const statsSection = document.getElementById('stats-section')

	if (statsSection) {
		window.addEventListener('scroll', () => {
			const rect = statsSection.getBoundingClientRect()
			const isVisible = rect.top < window.innerHeight && rect.bottom >= 0

			if (isVisible) {
				animateCounter()
			}
		})
	}

	// Efekt paralaksy dla sekcji hero
	const heroSection = document.querySelector('.hero-section')

	window.addEventListener('scroll', () => {
		if (heroSection) {
			const scrollPosition = window.scrollY
			heroSection.style.backgroundPositionY = `calc(50% + ${scrollPosition * 0.5}px)`
		}
	})

	// Płynne przewijanie dla linków nawigacyjnych
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault()

			const targetId = this.getAttribute('href')
			if (targetId === '#') return

			const targetElement = document.querySelector(targetId)

			if (targetElement) {
				// Zamknij menu mobilne, jeśli otwarte
				if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
					mobileMenu.classList.add('hidden')
				}

				// Przewiń z animacją
				window.scrollTo({
					top: targetElement.offsetTop - navbar.offsetHeight,
					behavior: 'smooth',
				})
			}
		})
	})

	// Efekt hover z podświetleniem dla kart usług
	const serviceCards = document.querySelectorAll('.service-card')

	serviceCards.forEach(card => {
		card.addEventListener('mouseenter', () => {
			card.classList.add('service-card-hover')
		})

		card.addEventListener('mouseleave', () => {
			card.classList.remove('service-card-hover')
		})
	})

	// Preloader
	const preloader = document.getElementById('preloader')

	if (preloader) {
		window.addEventListener('load', () => {
			preloader.classList.add('preloader-fade-out')
			setTimeout(() => {
				preloader.style.display = 'none'
			}, 500)
		})
	}

	// Przycisk "Powrót do góry" - pokaż/ukryj podczas przewijania
	const backToTopButton = document.querySelector('.back-to-top')

	if (backToTopButton) {
		backToTopButton.style.opacity = '0'
		backToTopButton.style.visibility = 'hidden'

		window.addEventListener('scroll', () => {
			if (window.scrollY > 300) {
				backToTopButton.style.opacity = '1'
				backToTopButton.style.visibility = 'visible'
			} else {
				backToTopButton.style.opacity = '0'
				backToTopButton.style.visibility = 'hidden'
			}
		})
	}

	// Aktywna nawigacja podczas przewijania
	const sections = document.querySelectorAll('section[id]')
	const navLinks = document.querySelectorAll('nav a[href^="#"]')

	window.addEventListener('scroll', () => {
		let current = ''

		sections.forEach(section => {
			const sectionTop = section.offsetTop - navbar.offsetHeight - 100
			const sectionHeight = section.offsetHeight

			if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
				current = '#' + section.getAttribute('id')
			}
		})

		navLinks.forEach(link => {
			link.classList.remove('nav-active')
			if (link.getAttribute('href') === current) {
				link.classList.add('nav-active')
			}
		})
	})

	// Enhanced Google Maps handling
	function initializeGoogleMaps() {
		const mapContainer = document.getElementById('map-container')
		const mapIframe = mapContainer.querySelector('.google-maps-iframe')
		const mapPlaceholder = document.getElementById('map-placeholder')
		const cookieConsent = localStorage.getItem('cookieConsent')

		if (!cookieConsent || cookieConsent === 'rejected') {
			// Hide map and show placeholder if no consent
			if (mapIframe) mapIframe.classList.add('hidden')
			if (mapPlaceholder) mapPlaceholder.classList.remove('hidden')
		} else {
			// Show map and hide placeholder if consent given
			if (mapIframe) mapIframe.classList.remove('hidden')
			if (mapPlaceholder) mapPlaceholder.classList.add('hidden')
		}
	}

	function enableGoogleMaps() {
		const mapContainer = document.getElementById('map-container')
		const mapIframe = mapContainer.querySelector('.google-maps-iframe')
		const mapPlaceholder = document.getElementById('map-placeholder')

		// Set cookie consent
		localStorage.setItem('cookieConsent', 'accepted')

		// Show map
		if (mapIframe) {
			mapIframe.classList.remove('hidden')
			// Reload iframe to ensure fresh load with new cookie settings
			const currentSrc = mapIframe.src
			mapIframe.src = ''
			setTimeout(() => {
				mapIframe.src = currentSrc
			}, 50)
		}

		// Hide placeholder
		if (mapPlaceholder) {
			mapPlaceholder.classList.add('hidden')
		}
	}

	// Enhanced Cookie and Maps Privacy Management
	function initializePrivacyControls() {
		const mapContainer = document.getElementById('map-container')
		const mapIframe = mapContainer?.querySelector('.google-maps-iframe')
		const mapPlaceholder = document.getElementById('map-placeholder')
		const cookieConsent = document.getElementById('cookie-consent')
		const acceptButton = document.getElementById('accept-cookies')
		const rejectButton = document.getElementById('reject-cookies')

		// Function to handle map visibility
		function updateMapVisibility(showMap) {
			if (!mapContainer || !mapIframe || !mapPlaceholder) return

			if (showMap) {
				mapPlaceholder.classList.add('hidden')
				mapIframe.classList.remove('hidden')
			} else {
				mapPlaceholder.classList.remove('hidden')
				mapIframe.classList.add('hidden')
			}
		}

		// Check existing consent
		const existingConsent = localStorage.getItem('cookieConsent')

		// Show cookie banner if no choice made
		if (!existingConsent) {
			if (cookieConsent) cookieConsent.style.display = 'block'
			updateMapVisibility(false)
		} else {
			updateMapVisibility(existingConsent === 'accepted')
		}

		// Handle accept button click
		if (acceptButton) {
			acceptButton.addEventListener('click', () => {
				localStorage.setItem('cookieConsent', 'accepted')
				if (cookieConsent) cookieConsent.style.display = 'none'
				updateMapVisibility(true)

				// Reload iframe to ensure fresh state
				if (mapIframe) {
					const currentSrc = mapIframe.src
					mapIframe.src = 'about:blank'
					setTimeout(() => {
						mapIframe.src = currentSrc
					}, 50)
				}
			})
		}

		// Handle reject button click
		if (rejectButton) {
			rejectButton.addEventListener('click', () => {
				localStorage.setItem('cookieConsent', 'rejected')
				if (cookieConsent) cookieConsent.style.display = 'none'
				updateMapVisibility(false)
			})
		}
	}

	// Initialize privacy controls when DOM is ready
	document.addEventListener('DOMContentLoaded', () => {
		initializePrivacyControls()
	})

	// Function to enable maps (can be called from HTML)
	function enableGoogleMaps() {
		localStorage.setItem('cookieConsent', 'accepted')
		const mapContainer = document.getElementById('map-container')
		const mapIframe = mapContainer?.querySelector('.google-maps-iframe')
		const mapPlaceholder = document.getElementById('map-placeholder')

		if (mapPlaceholder) mapPlaceholder.classList.add('hidden')
		if (mapIframe) {
			mapIframe.classList.remove('hidden')
			// Ensure fresh load
			const currentSrc = mapIframe.src
			mapIframe.src = 'about:blank'
			setTimeout(() => {
				mapIframe.src = currentSrc
			}, 50)
		}
	}
})

// Funkcja aktualizująca galerię portfolio na stronie głównej z pliku baza.js
function updatePortfolioFromData() {
	// Sprawdź czy jesteśmy na stronie głównej i czy istnieje sekcja portfolio
	const portfolioGrid = document.querySelector('#portfolio .grid')
	if (!portfolioGrid) return

	try {
		// Pobierz dane z baza.js za pomocą funkcji getGalleryData
		const items = typeof getGalleryData === 'function' ? getGalleryData() : null

		// Jeśli nie ma baza.js, spróbuj pobrać dane bezpośrednio z localStorage
		if (!items) {
			const galleryData = localStorage.getItem('galleryData')
			if (!galleryData) return

			try {
				items = JSON.parse(galleryData)
			} catch (error) {
				console.error('Błąd podczas parsowania danych galerii:', error)
				return
			}
		}

		// Sprawdź czy są dane
		if (!items || !items.length) {
			console.log('Brak danych galerii do wyświetlenia')
			return
		}

		console.log('Znaleziono zdjęć w galerii:', items.length)

		// Wyczyść istniejące portfolio
		portfolioGrid.innerHTML = ''

		// Wyświetl wszystkie zdjęcia, jeśli jest ich mniej niż 9
		const showAll = items.length <= 9

		// Pokaż wszystkie lub tylko pierwsze 9 zdjęć początkowo
		const visibleItems = showAll ? items : items.slice(0, 9)
		const remainingItems = showAll ? [] : items.slice(9)

		console.log('Wyświetlam początkowe zdjęcia:', visibleItems.length)
		console.log('Pozostałe zdjęcia:', remainingItems.length)

		// Dodaj widoczne elementy
		visibleItems.forEach((item, index) => {
			addPortfolioItem(portfolioGrid, item, index)
		})

		// Obsługa przycisku "Zobacz więcej"
		const showMoreButton = document.querySelector('#portfolio .text-center button')

		if (showMoreButton) {
			// Usuń wszystkie istniejące listenery
			const newButton = showMoreButton.cloneNode(true)
			showMoreButton.parentNode.replaceChild(newButton, showMoreButton)

			// Ukryj przycisk jeśli nie ma więcej zdjęć
			if (remainingItems.length === 0) {
				newButton.style.display = 'none'
			} else {
				newButton.style.display = 'inline-block'

				// Dodaj nowy listener
				newButton.addEventListener('click', function () {
					console.log("Kliknięto 'Zobacz więcej'")
					// Dodaj wszystkie pozostałe zdjęcia
					remainingItems.forEach((item, index) => {
						addPortfolioItem(portfolioGrid, item, index + visibleItems.length)
					})

					// Ukryj przycisk po pokazaniu wszystkich zdjęć
					this.style.display = 'none'

					// Aktualizuj filtry dla nowych elementów
					updatePortfolioFilters()
				})
			}
		}

		// Aktualizuj filtry
		updatePortfolioFilters()
	} catch (error) {
		console.error('Błąd podczas aktualizacji galerii:', error)
	}
}

// Funkcja pomocnicza do dodawania elementów portfolio - uwzględnia teraz altText z baza.js
function addPortfolioItem(container, item, index) {
	// Opóźnienie animacji
	const delay = (index % 6) * 100 + 100

	// Przygotowanie danych z ograniczeniem długości tekstu
	const title = item.title || 'Bez tytułu'
	const description = item.description || 'Brak opisu'
	const category = getCategoryLabel(item.category)
	const altText = item.altText || title // Nowe pole z baza.js

	// Przygotuj klasę CSS dla elementu
	let itemClass = `portfolio-item ${item.category}`

	// Dodaj dodatkową klasę dla elementów okolicznościowych
	if (item.category === 'special') {
		itemClass += ' okolicznosciowe'
	}

	// Stwórz element portfolio
	const portfolioItem = document.createElement('div')
	portfolioItem.className = itemClass
	portfolioItem.setAttribute('data-aos', 'fade-up')
	portfolioItem.setAttribute('data-aos-delay', delay)

	// Dodaj atrybut data-category dla lepszego filtrowania
	portfolioItem.setAttribute('data-category', item.category)

	// Dodaj ID z baza.js
	if (item.id) {
		portfolioItem.setAttribute('data-id', item.id)
	}

	portfolioItem.innerHTML = `
    <div class="relative overflow-hidden rounded-lg group">
      <img
        src="${item.imageSrc}"
        alt="${altText}"
        class="w-full h-auto transition-all duration-500 group-hover:scale-110"
      />
      <div
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center"
      >
        <div
          class="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-center px-6"
        >
          <h3 class="text-xl font-semibold mb-2">${title}</h3>
          <p class="mb-4">${description}</p>
          <div class="flex justify-center">
            <span class="px-3 py-1 rounded-full text-xs bg-opacity-30 bg-white mb-3">${category}</span>
          </div>
          <a
            href="#"
            class="px-4 py-2 rounded-md text-white font-medium inline-block"
            style="background-color: var(--brown)"
          >
            Zobacz więcej
          </a>
        </div>
      </div>
    </div>
  `

	// Dodaj do siatki
	container.appendChild(portfolioItem)
}

// Funkcja pomocnicza do wyświetlania nazwy kategorii
function getCategoryLabel(category) {
	const categories = {
		women: 'Damskie',
		men: 'Męskie',
		color: 'Koloryzacja',
		special: 'Okolicznościowe',
	}

	return categories[category] || 'Inne'
}

// Funkcja aktualizująca filtry po wygenerowaniu nowych elementów galerii
function updatePortfolioFilters() {
	// Pobierz nowe elementy
	const portfolioItems = document.querySelectorAll('.portfolio-item')
	const filterButtons = document.querySelectorAll('.portfolio-filter-btn')
	const portfolioContainer = document.querySelector('.portfolio-grid-container')

	console.log('Aktualizacja filtrów dla', portfolioItems.length, 'elementów')

	// Ustaw wszystkie elementy jako widoczne na początku
	portfolioItems.forEach(item => {
		item.style.position = 'relative'
		item.style.display = 'flex'
		item.classList.remove('portfolio-item-fade-out')
		item.classList.add('portfolio-item-fade-in')
	})

	// Ustaw wysokość kontenera na początku
	if (portfolioContainer && portfolioItems.length > 0) {
		// Usuwamy ustawianie stałej wysokości dla kontenera
		portfolioContainer.style.minHeight = 'auto'
	}

	// Usuń wszystkie istniejące listenery z przycisków filtrów
	filterButtons.forEach(button => {
		const newButton = button.cloneNode(true)
		button.parentNode.replaceChild(newButton, button)
	})

	// Pobierz zaktualizowane przyciski
	const updatedFilterButtons = document.querySelectorAll('.portfolio-filter-btn')

	// Domyślnie aktywuj przycisk "Wszystkie"
	const allButton = document.querySelector('.portfolio-filter-btn[data-filter="all"]')
	if (allButton) {
		allButton.classList.add('active')
		allButton.style.backgroundColor = 'var(--brown)'
		allButton.style.color = 'white'
	}

	// Policz i wyświetl elementy z kategorii "special" (okolicznościowe)
	const specialItems = document.querySelectorAll(
		".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
	)
	console.log('Liczba elementów okolicznościowych (special/okolicznosciowe):', specialItems.length)
	console.log(
		'Elementy okolicznościowe:',
		Array.from(specialItems).map(item => item.className)
	)

	updatedFilterButtons.forEach(button => {
		button.addEventListener('click', function () {
			// Remove active class from all buttons
			updatedFilterButtons.forEach(btn => {
				btn.classList.remove('active')
				btn.style.backgroundColor = ''
				btn.style.color = 'var(--brown)'
			})

			// Add active class to clicked button
			this.classList.add('active')
			this.style.backgroundColor = 'var(--brown)'
			this.style.color = 'white'

			const filter = this.getAttribute('data-filter')
			console.log('Filtrowanie według kategorii:', filter)

			// Specjalne logowanie dla filtra "special" (okolicznościowe)
			if (filter === 'special') {
				console.log('Filtrujemy według kategorii OKOLICZNOŚCIOWE (special)')
				console.log(
					'Liczba elementów special:',
					document.querySelectorAll(
						".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
					).length
				)
				console.log(
					'Elementy special:',
					Array.from(
						document.querySelectorAll(
							".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
						)
					).map(item => item.className)
				)
			}

			// Sprawdź, ile elementów jest w każdej kategorii
			const counts = {
				all: portfolioItems.length,
				women: document.querySelectorAll('.portfolio-item.women').length,
				men: document.querySelectorAll('.portfolio-item.men').length,
				color: document.querySelectorAll('.portfolio-item.color').length,
				special: document.querySelectorAll(
					".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
				).length,
			}
			console.log('Liczba elementów w kategoriach:', counts)

			// Przetwórz każdy element portfolio
			portfolioItems.forEach(item => {
				console.log('Przetwarzanie elementu:', item.className, 'porównywane z filtrem:', filter)

				if (filter === 'all') {
					// Pokaż wszystkie elementy
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję wszystkie')
				} else if (
					filter === 'special' &&
					(item.classList.contains('special') ||
						item.classList.contains('okolicznosciowe') ||
						item.getAttribute('data-category') === 'special')
				) {
					// Specjalny przypadek dla filtra "special" (okolicznościowe)
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element okolicznościowy:', item.className)
				} else if (item.classList.contains(filter)) {
					// Standardowy przypadek dla innych filtrów
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element:', item.className)
				} else {
					// Ukryj elementy bez wybranej klasy
					item.classList.add('portfolio-item-fade-out')
					item.classList.remove('portfolio-item-fade-in')

					// Opóźnij zmianę na display:none, aby animacja zadziałała
					setTimeout(() => {
						if (filter === 'special') {
							// Dodatkowe sprawdzenie dla kategorii okolicznościowe
							if (
								!item.classList.contains('special') &&
								!item.classList.contains('okolicznosciowe') &&
								item.getAttribute('data-category') !== 'special'
							) {
								item.style.display = 'none'
								item.style.position = 'absolute'
								console.log('Ukrywam element (nie jest okolicznościowy):', item.className)
							}
						} else if (!item.classList.contains(filter)) {
							item.style.display = 'none'
							item.style.position = 'absolute'
							console.log('Ukrywam element:', item.className)
						}
					}, 500)
				}
			})

			// Zaktualizuj wysokość kontenera portfolio po filtrowaniu
			setTimeout(() => {
				let visibleItems
				if (filter === 'all') {
					visibleItems = portfolioItems
				} else if (filter === 'special') {
					visibleItems = document.querySelectorAll(
						".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
					)
				} else {
					visibleItems = document.querySelectorAll(`.portfolio-item.${filter}`)
				}

				if (visibleItems.length > 0) {
					console.log('Widoczne elementy po filtrowaniu:', visibleItems.length)

					const grid = document.querySelector('.grid')
					// Usuwamy ustawianie stałej wysokości - pozwalamy, aby grid automatycznie się rozciągał
					portfolioContainer.style.minHeight = 'auto'

					// Dodaj obowiązkowe ponowne przeliczenie układu po małym opóźnieniu
					setTimeout(() => {
						// Wymuś ponowne obliczenie układu strony
						window.dispatchEvent(new Event('resize'))
					}, 100)
				}
			}, 550)
		})
	})

	// Inicjalizuj lightbox dla nowo dodanych zdjęć
	initializeLightbox()
}

// Funkcja inicjalizująca lightbox dla wszystkich zdjęć w galerii
function initializeLightbox() {
	console.log('Inicjalizacja lightbox dla galerii...')

	// Inicjalizacja Lightbox dla wszystkich zdjęć w galerii
	const galleryItems = document.querySelectorAll('.portfolio-item img')
	console.log('Znaleziono', galleryItems.length, 'zdjęć do inicjalizacji lightbox')

	if (galleryItems.length === 0) {
		console.log('Brak zdjęć do inicjalizacji lightbox')
		// Spróbuj ponownie za chwilę, jeśli zdjęcia nie są jeszcze załadowane
		setTimeout(initializeLightbox, 500)
		return
	}

	galleryItems.forEach((item, index) => {
		// Usuń istniejące listenery, aby zapobiec duplikacji
		const newItem = item.cloneNode(true)
		if (item.parentNode) {
			item.parentNode.replaceChild(newItem, item)
		}

		// Dodaj nowe zdarzenie kliknięcia
		newItem.addEventListener('click', e => {
			console.log('Kliknięto zdjęcie indeks:', index)
			e.preventDefault()
			e.stopPropagation() // Zatrzymaj propagację zdarzenia

			const overlay = document.createElement('div')
			overlay.className = 'lightbox-overlay'

			const img = document.createElement('img')
			img.src = newItem.src
			img.className = 'lightbox-image'

			const closeButton = document.createElement('button')
			closeButton.className = 'lightbox-close'
			closeButton.innerHTML = '&times;'

			overlay.appendChild(img)
			overlay.appendChild(closeButton)
			document.body.appendChild(overlay)

			// Zapobiegaj przewijaniu strony
			document.body.style.overflow = 'hidden'

			// Dodaj animację
			setTimeout(() => {
				overlay.classList.add('lightbox-visible')
			}, 10)

			// Zamknij lightbox po kliknięciu
			overlay.addEventListener('click', () => {
				overlay.classList.remove('lightbox-visible')
				setTimeout(() => {
					if (document.body.contains(overlay)) {
						document.body.removeChild(overlay)
					}
					document.body.style.overflow = ''
				}, 300)
			})
		})
	})

	console.log('Lightbox zainicjalizowany pomyślnie')
}

// Inicjalizacja filtrów portfolio
function initializePortfolioFilters() {
	const filterButtons = document.querySelectorAll('.portfolio-filter-btn')
	const portfolioItems = document.querySelectorAll('.portfolio-item')
	const portfolioContainer = document.querySelector('.portfolio-grid-container')

	console.log('Inicjalizacja filtrów portfolio...')
	console.log('Liczba przycisków filtrów:', filterButtons.length)
	console.log('Liczba elementów portfolio:', portfolioItems.length)

	// Ustaw wysokość kontenera na początku
	if (portfolioContainer && portfolioItems.length > 0) {
		// Usuwamy ustawianie stałej wysokości dla kontenera
		portfolioContainer.style.minHeight = 'auto'
	}

	// Resetowanie wszystkich elementów - pokazanie ich wszystkich na początku
	function resetAllItems() {
		portfolioItems.forEach(item => {
			item.style.position = 'relative'
			item.style.display = 'flex'
			item.classList.remove('portfolio-item-fade-out')
			item.classList.add('portfolio-item-fade-in')
		})
	}

	// Wywołaj raz na początku, aby upewnić się, że wszystkie elementy są widoczne
	resetAllItems()

	// Policz i wyświetl elementy z kategorii "special" (okolicznościowe)
	const specialItems = document.querySelectorAll(
		".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
	)
	console.log('Liczba elementów okolicznościowych (special/okolicznosciowe):', specialItems.length)
	console.log(
		'Elementy okolicznościowe:',
		Array.from(specialItems).map(item => item.className)
	)

	filterButtons.forEach(button => {
		// Usuń istniejące listenery zdarzeń
		const newButton = button.cloneNode(true)
		button.parentNode.replaceChild(newButton, button)

		newButton.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()

			console.log('Kliknięto przycisk filtru:', this.getAttribute('data-filter'))

			// Usuń klasę active ze wszystkich przycisków
			filterButtons.forEach(btn => {
				btn.classList.remove('active')
				btn.style.backgroundColor = ''
				btn.style.color = 'var(--brown)'
			})

			// Dodaj klasę active do klikniętego przycisku
			this.classList.add('active')
			this.style.backgroundColor = 'var(--brown)'
			this.style.color = 'white'

			const filter = this.getAttribute('data-filter')
			console.log('Filtrowanie według kategorii:', filter)

			// Specjalne logowanie dla filtra "special" (okolicznościowe)
			if (filter === 'special') {
				console.log('Filtrujemy według kategorii OKOLICZNOŚCIOWE (special)')
				console.log(
					'Liczba elementów special:',
					document.querySelectorAll(
						".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
					).length
				)
				console.log(
					'Elementy special:',
					Array.from(
						document.querySelectorAll(
							".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
						)
					).map(item => item.className)
				)
			}

			// Sprawdź, ile elementów jest w każdej kategorii
			const counts = {
				all: portfolioItems.length,
				women: document.querySelectorAll('.portfolio-item.women').length,
				men: document.querySelectorAll('.portfolio-item.men').length,
				color: document.querySelectorAll('.portfolio-item.color').length,
				special: document.querySelectorAll(
					".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
				).length,
			}
			console.log('Liczba elementów w kategoriach:', counts)

			// Przetwórz każdy element portfolio
			portfolioItems.forEach(item => {
				console.log('Przetwarzanie elementu:', item.className, 'porównywane z filtrem:', filter)

				if (filter === 'all') {
					// Pokaż wszystkie elementy
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję wszystkie')
				} else if (
					filter === 'special' &&
					(item.classList.contains('special') ||
						item.classList.contains('okolicznosciowe') ||
						item.getAttribute('data-category') === 'special')
				) {
					// Specjalny przypadek dla filtra "special" (okolicznościowe)
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element okolicznościowy:', item.className)
				} else if (item.classList.contains(filter)) {
					// Standardowy przypadek dla innych filtrów
					item.style.display = 'flex'
					item.style.position = 'relative'
					item.classList.remove('portfolio-item-fade-out')
					item.classList.add('portfolio-item-fade-in')
					console.log('Pokazuję element:', item.className)
				} else {
					// Ukryj elementy bez wybranej klasy
					item.classList.add('portfolio-item-fade-out')
					item.classList.remove('portfolio-item-fade-in')

					// Natychmiast ukryj elementy niewłaściwej kategorii
					item.style.display = 'none'
					item.style.position = 'absolute'
					console.log('Ukrywam element:', item.className)
				}
			})

			// Zaktualizuj wysokość kontenera portfolio po filtrowaniu
			setTimeout(() => {
				let visibleItems
				if (filter === 'all') {
					visibleItems = portfolioItems
				} else if (filter === 'special') {
					visibleItems = document.querySelectorAll(
						".portfolio-item.special, .portfolio-item.okolicznosciowe, .portfolio-item[data-category='special']"
					)
				} else {
					visibleItems = document.querySelectorAll(`.portfolio-item.${filter}`)
				}

				if (visibleItems.length > 0) {
					console.log('Widoczne elementy po filtrowaniu:', visibleItems.length)

					const grid = document.querySelector('.grid')
					// Usuwamy ustawianie stałej wysokości - pozwalamy, aby grid automatycznie się rozciągał
					portfolioContainer.style.minHeight = 'auto'

					// Dodaj obowiązkowe ponowne przeliczenie układu po małym opóźnieniu
					setTimeout(() => {
						// Wymuś ponowne obliczenie układu strony
						window.dispatchEvent(new Event('resize'))
					}, 100)
				}
			}, 100) // Zmniejszono opóźnienie z 550ms do 100ms dla szybszego efektu
		})
	})

	// Ręcznie aktywuj przycisk "Wszystkie" na początku
	const allButton = document.querySelector('.portfolio-filter-btn[data-filter="all"]')
	if (allButton) {
		allButton.click()
	}
}
