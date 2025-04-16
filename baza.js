// Dane galerii
const galleryData = [
	{
		id: 1,
		title: 'Nowoczesne strzyżenie z grzywką',
		description: 'Strzyżenie, modelowanie',
		category: 'women',
		imageSrc: 'images/4.jpg',
		altText: 'Stylowe strzyżenie damskie z grzywką - fryzura wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 2,
		title: 'Baleyage w ciepłych odcieniach',
		description: 'Koloryzacja, pielęgnacja',
		category: 'color',
		imageSrc: 'images/5.jpg',
		altText: 'Profesjonalna koloryzacja włosów w ciepłych odcieniach - usługa wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 3,
		title: 'Klasyczny undercut',
		description: 'Strzyżenie męskie, stylizacja',
		category: 'men',
		imageSrc: 'images/6.jpg',
		altText: 'Klasyczny undercut męski - precyzyjne strzyżenie męskie wykonane w salonie Migdał w Tarnowie',
	},
	{
		id: 4,
		title: 'Eleganckie upięcie ślubne',
		description: 'Fryzury okolicznościowe, upięcia',
		category: 'special',
		imageSrc: 'images/7.jpg',
		altText: 'Eleganckie upięcie ślubne - fryzura okolicznościowa wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 5,
		title: 'Pastelowe ombre',
		description: 'Koloryzacja, trendy',
		category: 'color',
		imageSrc: 'images/8.jpg',
		altText: 'Pastelowe ombre - nowoczesna koloryzacja wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 6,
		title: 'Nowoczesny bob z asymetrią',
		description: 'Strzyżenie, stylizacja',
		category: 'women',
		imageSrc: 'images/9.jpg',
		altText: 'Nowoczesny bob z asymetrią - modna fryzura damska wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 7,
		title: 'Klasyczna fryzura męska',
		description: 'Męskie, klasyczne cięcie',
		category: 'men',
		imageSrc: 'images/6.jpg',
		altText: 'Klasyczne cięcie męskie - fryzura dla mężczyzn z salonu Migdał w Tarnowie',
	},
	{
		id: 8,
		title: 'Fryzura weselna elegancka',
		description: 'Fryzury okolicznościowe, na wesele',
		category: 'special',
		imageSrc: 'images/7.jpg',
		altText: 'Elegancka fryzura weselna - upięcie na specjalne okazje wykonane w salonie Migdał w Tarnowie',
	},
	{
		id: 9,
		title: 'Fryzura na specjalne okazje',
		description: 'Uroczystości, przyjęcia',
		category: 'special',
		imageSrc: 'images/5.jpg',
		altText: 'Fryzura na specjalne uroczystości i przyjęcia wykonana w salonie Migdał w Tarnowie',
	},
	{
		id: 10,
		title: 'Stylowe cięcie z refleksami',
		description: 'Cięcie damskie, modelowanie',
		category: 'women',
		imageSrc: 'images/4.jpg',
		altText: 'Stylowe cięcie damskie z refleksami i modelowaniem - fryzura z salonu Migdał w Tarnowie',
	},
	{
		id: 11,
		title: 'Wielowymiarowa koloryzacja',
		description: 'Nowoczesne techniki, pielęgnacja',
		category: 'color',
		imageSrc: 'images/8.jpg',
		altText: 'Wielowymiarowa koloryzacja z nowoczesnymi technikami - usługa koloryzacji z salonu Migdał w Tarnowie',
	},
]

// Eksportuj dane dla stron z JavaScript modułami
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { galleryData }
}

// Zapisz dane w zmiennej globalnej dla dostępu z innych skryptów
window.salonGalleryData = galleryData

// Funkcja do zapisywania danych galerii
function saveGalleryData(data) {
	try {
		// Aktualizuj zmienną globalną
		window.salonGalleryData = data

		// Zapisz dane w localStorage (dla panelu administracyjnego)
		localStorage.setItem('galleryData', JSON.stringify(data))

		console.log('Dane galerii zapisane pomyślnie')
		return true
	} catch (error) {
		console.error('Błąd podczas zapisywania danych galerii:', error)
		return false
	}
}

// Funkcja do pobierania danych galerii
function getGalleryData() {
	// Najpierw sprawdź localStorage (w przypadku modyfikacji z panelu admin)
	const storedData = localStorage.getItem('galleryData')

	if (storedData) {
		try {
			return JSON.parse(storedData)
		} catch (error) {
			console.error('Błąd podczas parsowania danych z localStorage:', error)
		}
	}

	// Jeśli nie ma danych w localStorage, użyj domyślnych
	return window.salonGalleryData
}
