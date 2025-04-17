class GalleryAdmin {
	constructor() {
		this.apiUrl = '../gallery_api.php'
		this.uploadUrl = 'upload.php'
	}

	// Pobieranie danych galerii
	async getGalleryData() {
		try {
			const response = await fetch(`${this.apiUrl}?action=get`)
			if (!response.ok) throw new Error('Network response was not ok')
			return await response.json()
		} catch (error) {
			console.error('Błąd podczas pobierania danych:', error)
			throw error
		}
	}

	// Dodawanie nowego zdjęcia
	async uploadImage(formData) {
		try {
			console.log('Rozpoczęcie uploadu...', formData)

			const response = await fetch(this.uploadUrl, {
				method: 'POST',
				body: formData,
			})

			console.log('Status odpowiedzi:', response.status)
			console.log('Headers:', [...response.headers.entries()])

			let responseData
			const responseText = await response.text()
			console.log('Surowa odpowiedź:', responseText)

			try {
				responseData = JSON.parse(responseText)
			} catch (e) {
				console.error('Błąd parsowania JSON:', e)
				throw new Error('Nieprawidłowa odpowiedź serwera: ' + responseText)
			}

			if (!response.ok) {
				throw new Error(responseData.message || `Błąd HTTP: ${response.status}`)
			}

			if (!responseData.success) {
				throw new Error(responseData.message || 'Nieznany błąd podczas przesyłania')
			}

			console.log('Upload zakończony:', responseData)
			return responseData
		} catch (error) {
			console.error('Szczegóły błędu podczas przesyłania:', error)
			throw error
		}
	}

	// Dodawanie nowego elementu galerii
	async addGalleryItem(item) {
		try {
			console.log('Dodawanie elementu galerii:', item)

			const response = await fetch(`${this.apiUrl}?action=add`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(item),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Błąd podczas dodawania elementu')
			}

			const data = await response.json()
			console.log('Element dodany:', data)
			return data
		} catch (error) {
			console.error('Błąd podczas dodawania elementu:', error)
			throw error
		}
	}

	// Aktualizacja elementu galerii
	async updateGalleryItem(id, item) {
		try {
			console.log('Aktualizacja elementu:', id, item)

			const response = await fetch(`${this.apiUrl}?action=update&id=${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(item),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Błąd podczas aktualizacji elementu')
			}

			const data = await response.json()
			console.log('Element zaktualizowany:', data)
			return data
		} catch (error) {
			console.error('Błąd podczas aktualizacji elementu:', error)
			throw error
		}
	}

	// Usuwanie elementu galerii
	async deleteGalleryItem(id) {
		try {
			console.log('Usuwanie elementu:', id)

			const response = await fetch(`${this.apiUrl}?action=delete&id=${id}`, {
				method: 'POST',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Błąd podczas usuwania elementu')
			}

			const data = await response.json()
			console.log('Element usunięty:', data)
			return data
		} catch (error) {
			console.error('Błąd podczas usuwania elementu:', error)
			throw error
		}
	}
}

// Inicjalizacja menedżera galerii
const galleryAdmin = new GalleryAdmin()

// Obsługa przesyłania plików
document.addEventListener('DOMContentLoaded', () => {
	const uploadForm = document.getElementById('uploadForm')
	const fileInput = document.getElementById('fileInput')
	const dropZone = document.getElementById('dropZone')
	const previewContainer = document.getElementById('previewContainer')
	const imagePreview = document.getElementById('imagePreview')
	const fileInfo = document.getElementById('fileInfo')
	const submitUpload = document.getElementById('submitUpload')
	const progressBar = document.getElementById('progressBar')
	const progressPercentage = document.getElementById('progressPercentage')

	if (!uploadForm) {
		console.error('Nie znaleziono formularza upload')
		return
	}

	// Obsługa przeciągania i upuszczania
	dropZone.addEventListener('dragover', e => {
		e.preventDefault()
		dropZone.classList.add('bg-gray-100')
	})

	dropZone.addEventListener('dragleave', () => {
		dropZone.classList.remove('bg-gray-100')
	})

	dropZone.addEventListener('drop', e => {
		e.preventDefault()
		dropZone.classList.remove('bg-gray-100')
		const files = e.dataTransfer.files
		if (files.length > 0) {
			handleFile(files[0])
		}
	})

	// Obsługa wyboru pliku
	fileInput.addEventListener('change', e => {
		if (e.target.files.length > 0) {
			handleFile(e.target.files[0])
		}
	})

	// Obsługa przycisku "Wybierz plik"
	document.getElementById('browseButton').addEventListener('click', () => {
		fileInput.click()
	})

	// Funkcja obsługująca wybrany plik
	function handleFile(file) {
		console.log('Wybrano plik:', file)

		if (!file.type.startsWith('image/')) {
			alert('Proszę wybrać plik obrazu')
			return
		}

		// Pokaż podgląd
		const reader = new FileReader()
		reader.onload = e => {
			imagePreview.src = e.target.result
			previewContainer.classList.remove('hidden')
			fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`
			submitUpload.disabled = false
		}
		reader.readAsDataURL(file)
	}

	// Obsługa formularza
	uploadForm.addEventListener('submit', async e => {
		e.preventDefault()
		const file = fileInput.files[0]
		if (!file) {
			alert('Proszę wybrać plik')
			return
		}

		const formData = new FormData()
		formData.append('image', file)

		try {
			console.log('Rozpoczynam upload pliku...')

			// Pokaż pasek postępu
			progressBar.classList.remove('hidden')
			progressBar.value = 0
			progressPercentage.textContent = '0%'

			const response = await galleryAdmin.uploadImage(formData)
			console.log('Odpowiedź z serwera:', response)

			if (response.success) {
				alert('Plik został przesłany pomyślnie!')
				location.reload()
			} else {
				throw new Error(response.message || 'Błąd podczas przesyłania')
			}
		} catch (error) {
			console.error('Błąd:', error)
			alert('Wystąpił błąd podczas przesyłania: ' + error.message)
		} finally {
			// Ukryj pasek postępu
			progressBar.classList.add('hidden')
		}
	})

	// Funkcja formatująca rozmiar pliku
	function formatFileSize(bytes) {
		if (bytes === 0) return '0 B'
		const k = 1024
		const sizes = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}
})
