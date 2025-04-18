class GaleriaPortfolio {
	constructor() {
		this.elementyNaStrone = 8
		this.aktualnaStrona = 1
		this.aktualnyFiltr = 'all'
		this.elementy = []
		this.ladowanie = true

		// Uproszczone określanie baseUrl
		this.baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/'

		// Aktualizacja selektorów zgodnie z HTML
		this.kontenerSiatki = document.getElementById('portfolio-grid')
		this.elementLadowania = document.querySelector('.loading')
		this.kontenerPaginacji = document.querySelector('.pagination-numbers')

		this.inicjalizujPrzyciski()
		this.wczytajElementy()
	}

	inicjalizujPrzyciski() {
		// Aktualizacja selektora zgodnie z HTML
		const przyciski = document.querySelectorAll('.portfolio-filter-btn')
		przyciski.forEach(przycisk => {
			przycisk.addEventListener('click', () => {
				const filtr = przycisk.getAttribute('data-filter')
				this.ustawAktywnyFiltr(filtr)
				this.aktualnaStrona = 1
				this.aktualizujWyswietlanie()
			})
		})

		// Dodanie obsługi przycisków paginacji
		const prevButton = document.getElementById('prev-page')
		const nextButton = document.getElementById('next-page')

		if (prevButton) {
			prevButton.addEventListener('click', () => {
				if (this.aktualnaStrona > 1) {
					this.aktualnaStrona--
					this.aktualizujWyswietlanie()
				}
			})
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => {
				const przefiltrowaneElementy = this.filtrujElementy()
				const maxStrona = Math.ceil(przefiltrowaneElementy.length / this.elementyNaStrone)
				if (this.aktualnaStrona < maxStrona) {
					this.aktualnaStrona++
					this.aktualizujWyswietlanie()
				}
			})
		}
	}

	ustawAktywnyFiltr(filtr) {
		const przyciski = document.querySelectorAll('.portfolio-filter-btn')
		przyciski.forEach(przycisk => {
			if (przycisk.getAttribute('data-filter') === filtr) {
				przycisk.style.backgroundColor = 'var(--brown)'
				przycisk.style.color = 'white'
			} else {
				przycisk.style.backgroundColor = ''
				przycisk.style.color = 'var(--brown)'
			}
		})
		this.aktualnyFiltr = filtr
	}

	async wczytajElementy() {
		try {
			console.log('Próba pobrania elementów portfolio...')
			const odpowiedz = await fetch('api/get-portfolio-items.php')

			if (!odpowiedz.ok) {
				throw new Error(`Błąd połączenia z serwerem (${odpowiedz.status})`)
			}

			const dane = await odpowiedz.json()
			console.log('Otrzymane dane:', dane)

			if (!dane.success) {
				throw new Error(dane.error || 'Wystąpił błąd podczas pobierania danych z serwera')
			}

			if (!Array.isArray(dane.items)) {
				throw new Error('Otrzymano nieprawidłowy format danych z serwera')
			}

			this.elementy = dane.items.map(item => ({
				...item,
				image_url: item.image_url.startsWith('http') ? item.image_url : this.baseUrl + item.image_url,
			}))

			this.ladowanie = false
			this.aktualizujWyswietlanie()
		} catch (blad) {
			console.error('Błąd podczas ładowania elementów portfolio:', blad)
			this.pokazBlad(`
				<div class="text-center">
					<p class="text-xl mb-4">Nie udało się załadować galerii</p>
					<p class="mb-4">Przepraszamy, wystąpił problem podczas ładowania galerii. ${blad.message}</p>
					<p class="mb-4">Możliwe przyczyny:</p>
					<ul class="mb-4 list-disc list-inside">
						<li>Problem z połączeniem internetowym</li>
						<li>Tymczasowa niedostępność serwera</li>
						<li>Błąd w przetwarzaniu danych</li>
					</ul>
					<button onclick="location.reload()" class="px-4 py-2 bg-brown text-white rounded hover:bg-brown-dark">
						Odśwież stronę
					</button>
				</div>
			`)
		}
	}

	filtrujElementy() {
		if (this.aktualnyFiltr === 'all') return this.elementy
		return this.elementy.filter(element => element.category === this.aktualnyFiltr)
	}

	aktualizujWyswietlanie() {
		if (!this.kontenerSiatki) {
			console.error('Nie znaleziono kontenera siatki portfolio')
			return
		}

		const przefiltrowaneElementy = this.filtrujElementy()
		const poczatek = (this.aktualnaStrona - 1) * this.elementyNaStrone
		const elementyDoWyswietlenia = przefiltrowaneElementy.slice(poczatek, poczatek + this.elementyNaStrone)

		// Wyczyść i zaktualizuj siatkę
		this.kontenerSiatki.innerHTML = ''

		if (elementyDoWyswietlenia.length === 0) {
			this.kontenerSiatki.innerHTML = `
				<div class="col-span-full text-center py-8">
					<p class="text-lg">Brak elementów do wyświetlenia</p>
				</div>
			`
			return
		}

		elementyDoWyswietlenia.forEach(element => {
			const elementHTML = this.stworzElementPortfolio(element)
			this.kontenerSiatki.insertAdjacentHTML('beforeend', elementHTML)
		})

		// Animuj elementy
		const elementy = this.kontenerSiatki.querySelectorAll('.portfolio-item')
		elementy.forEach((element, indeks) => {
			element.style.opacity = '0'
			setTimeout(() => {
				element.style.opacity = '1'
				element.style.transition = 'opacity 0.3s ease'
			}, indeks * 100)
		})

		this.aktualizujPaginacje(przefiltrowaneElementy.length)
	}

	stworzElementPortfolio(element) {
		return `
			<div class="portfolio-item ${element.category}" data-aos="fade-up">
				<div class="relative overflow-hidden rounded-lg group">
					<img 
						src="${element.image_url}" 
						alt="${element.title}"
						class="w-full h-auto transition-all duration-500 group-hover:scale-110"
						loading="lazy"
						onerror="this.src='images/placeholder.jpg'; this.onerror=null;"
					/>
					<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
						<div class="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-center px-6">
							<h3 class="text-xl font-semibold mb-2">${element.title}</h3>
							<p class="mb-4">${element.description || ''}</p>
							<a href="#" class="px-4 py-2 rounded-md text-white font-medium" style="background-color: var(--brown)">
								Zobacz więcej
							</a>
						</div>
					</div>
				</div>
			</div>
		`
	}

	aktualizujPaginacje(calkowitaIloscElementow) {
		const calkowitaIloscStron = Math.ceil(calkowitaIloscElementow / this.elementyNaStrone)

		// Aktualizacja stanu przycisków prev/next
		const prevButton = document.getElementById('prev-page')
		const nextButton = document.getElementById('next-page')

		if (prevButton) {
			prevButton.disabled = this.aktualnaStrona <= 1
			prevButton.style.opacity = prevButton.disabled ? '0.5' : '1'
			prevButton.style.cursor = prevButton.disabled ? 'not-allowed' : 'pointer'
		}

		if (nextButton) {
			nextButton.disabled = this.aktualnaStrona >= calkowitaIloscStron
			nextButton.style.opacity = nextButton.disabled ? '0.5' : '1'
			nextButton.style.cursor = nextButton.disabled ? 'not-allowed' : 'pointer'
		}

		// Aktualizacja numerów stron
		if (this.kontenerPaginacji) {
			this.kontenerPaginacji.innerHTML = ''

			for (let i = 1; i <= calkowitaIloscStron; i++) {
				const przycisk = document.createElement('button')
				przycisk.innerText = i
				przycisk.classList.add('w-8', 'h-8', 'rounded-full', 'flex', 'items-center', 'justify-center', 'transition-all')

				if (i === this.aktualnaStrona) {
					przycisk.classList.add('bg-brown', 'text-white')
				} else {
					przycisk.classList.add('border', 'border-brown', 'text-brown', 'hover:bg-brown', 'hover:text-white')
				}

				przycisk.addEventListener('click', () => {
					this.aktualnaStrona = i
					this.aktualizujWyswietlanie()
				})

				this.kontenerPaginacji.appendChild(przycisk)
			}
		}
	}

	pokazBlad(wiadomosc) {
		if (this.kontenerSiatki) {
			this.kontenerSiatki.innerHTML = `
				<div class="col-span-full text-center py-8">
					${wiadomosc}
				</div>
			`
		}

		// Ukryj paginację w przypadku błędu
		if (this.kontenerPaginacji) {
			this.kontenerPaginacji.style.display = 'none'
		}

		const prevButton = document.getElementById('prev-page')
		const nextButton = document.getElementById('next-page')
		if (prevButton) prevButton.style.display = 'none'
		if (nextButton) nextButton.style.display = 'none'
	}
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('portfolio-grid')) {
		new GaleriaPortfolio()
	}
})
