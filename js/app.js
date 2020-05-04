// INPUTS
const API_KEY = '5b2df9a01c179a66af55f96a1e8cb829';
const API_IMAGE_URL = 'https://image.tmdb.org/t/p/w500/';
const API_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const API_DISCOVER_URL = 'https://api.themoviedb.org/3/discover/movie';
const API_DISCOVER_GENRE_URL = 'https://api.themoviedb.org/3/genre/movie/list';

// ELEMENTS
const pagginationWrapper = document.querySelector('.pag');
const pagination = document.querySelector('#pagination');
const container = document.querySelector('#movies');
const loader = document.querySelector('#loader');
const header = document.querySelector('header');
const inputSearch = document.querySelector('#search');
const filters = document.querySelector('#filters');
const btnTop = document.querySelector('.btn-top');
const aside = document.querySelector('aside');
// event which open window with description
document.addEventListener('click', ({ target }) => {
	if(target.closest('p')) target.classList.toggle('show-overview');
});

window.addEventListener('scroll', () => {
	if(this.scrollY > 10 ) {
		header.classList.add('sticky-effect');
		filters.classList.add('sticky-effect');
	} else if (this.scrollY == 0) {
		header.classList.remove('sticky-effect');
		filters.classList.remove('sticky-effect');
	}
})

const toTop = () => {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

btnTop.addEventListener('click', () => toTop());

let filteredGeners = [];
let cache = {};

const showLoader = bool => loader.hidden = bool;

const lazyLoadInstance = new LazyLoad({
	elements_selector: ".lazy"
});

const debounce = (func, delay) => {
	let inDebounce
	return function() {
		const context = this
		const args = arguments
		clearTimeout(inDebounce)
		inDebounce = setTimeout(() => func.apply(context, args), delay)
	};
};
// getting movies
const getMovies = async (key, page, url = `${API_DISCOVER_URL}?api_key=${key}&page=${page}`) => {
	if(cache[url]) {
		renderUi(cache[url]);
		return;
	}
	try {
		showLoader(false);
		const response = await fetch(url);
		const data = await response.json();
		cache[url] = data;
			renderUi(data);
		} catch (error) {
				return `Caught an error: ${error}`
		} finally {
			showLoader(true);
	};
};
// searching movies
const getSearch = async (query, page = 1, url = `${API_SEARCH_URL}?api_key=${API_KEY}&query=${query}&page=${page}`) => {
	if(cache[url]) {
		renderUi(cache[url]);
		attachPaginationHandlers(function() {
			paginateSearch.call(this, query)
		});
		return;
	}
	try{
		if (!query) return;
		showLoader(false);
		const response = await fetch(url);
		const data = await response.json();
		cache[url] = data;
		renderUi(data);
		lazyLoadInstance.update();
		attachPaginationHandlers(function() {
			paginateSearch.call(this, query)
		});
	} catch (error) {
			return `Caught an error: ${error}`
	}	finally {
			showLoader(true);
	};
};

const getFilters = async (key, url = `${API_DISCOVER_GENRE_URL}?api_key=${key}&language=en-En`) => {
	try{
		showLoader(false);
		const response = await fetch(url);
		const  { genres }  = await response.json();
		renderFilters(genres, filters);
		attachFilterHandlers(filters);
	} catch (error) {
			return `Caught an error: ${error}`
	} finally {
		showLoader(true);
	};
};

// getting pagination
function paginate () {
	getMovies(API_KEY, this.dataset.page);
};
// getting current paggination from search
function paginateSearch(query){
	getSearch(query, this.dataset.page);
};
// attach event on butt on
function attachPaginationHandlers(handler) {
	const buttons = pagination.querySelectorAll('button');
	buttons.forEach(btn => btn.addEventListener('click', handler));
};

function attachFilterHandlers(elem) {
	const checkboxs = elem.querySelectorAll('input[type="checkbox"]');
	checkboxs.forEach(checkbox => {
		checkbox.addEventListener('change', ({target}) => {
			if(target.checked) {
				filteredGeners.push(target.value);
				getMovies(API_KEY, `${API_DISCOVER_URL}?api_key=${API_KEY}&language=en-En&with_genres=${[...filteredGeners].join()}`);
				return;
			}
			filteredGeners = filteredGeners.filter(generId => {
				return	generId !== target.value;
			});
		});
	});
};
// rendering UI elements
function renderUi({ results, total_pages, page }) {
	renderMovies(results, container);
	renderPagination(page, total_pages, pagination);

	attachPaginationHandlers(paginate);
	lazyLoadInstance.update();
}
// rendering all movies
function renderMovies(data, wrapper) {
	wrapper.innerHTML = data.map(({ title, overview, poster_path }) =>
		`<section class="movie">
			<figure class="poster">
				<img class="lazy" data-src="${API_IMAGE_URL}/${poster_path}" alt="alt" />
				<figcaption class="title">${title}</figcaption>
			</figure>
			<p class="overview">${overview}</p>
		</section>`,
	).join('');
	const movies = wrapper.querySelectorAll('.movie');
	movies.forEach(movie => ScrollReveal().reveal(movie, {origin:'bottom', delay: 250, easing:'ease-in-out', opacity:1, distance:'25rem', duration: 1000}))
};
// rendering paggination
function renderPagination(page = 1, total_pages, wrapper) {
	wrapper.innerHTML = `
	<button type="button" class="${ page - 1 === 0 ? 'disabled' : '' }" data-page="${ page - 1 }"><i class="fa fa-arrow-left"></i></button>
		<span>${page}</span>
	<button type="button" class="${ page + 1 > total_pages ? 'disabled' : '' }" data-page="${ page + 1 }"><i class="fa fa-arrow-right"></i></button>`;
};
// rendering filters
function renderFilters(data, wrapper) {
	wrapper.innerHTML = data.map(({id, name }) => `
			<label for="${id}">${name}
				<input id="${id}" type="checkbox" value="${id}" />
				<span class="checkmark"></span>
			</label>
		`,
	).join('');
};
// Serching movies
inputSearch.addEventListener('input', debounce(({ target: { value } }) => getSearch(value), 250));

getFilters(API_KEY);
getMovies(API_KEY);
// Animations
	const tl = new TimelineMax ();
		tl.fromTo(header, 1, {y: '-8vh'}, {y:'0px', ease:Power1.ease});
		tl.fromTo(container, 1.5, {opacity:0}, {opacity:1, ease:Power2.ease}, '-=.5');
		tl.fromTo(pagginationWrapper, .5, {x: '5vw', opacity:0}, {x:'0', opacity:1, ease:Power1.ease}, '-=1');
		tl.fromTo(aside, .5, {x: '-10vw', opacity:0}, {x:'0', opacity:1, ease:Power1.ease}, '-=1.5');