// INPUTS
const API_KEY = '5b2df9a01c179a66af55f96a1e8cb829';
const API_IMAGE_URL = 'https://image.tmdb.org/t/p/w300/';
const API_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const API_DISCOVER_URL = 'https://api.themoviedb.org/3/discover/movie';
const API_DISCOVER_GENRE_URL = 'https://api.themoviedb.org/3/genre/movie/list';

// ELEMENTS
const pagination = document.querySelector('#pagination');
const container = document.querySelector('#movies');
const loader = document.querySelector('#loader');
const header = document.querySelector('header');
const inputSearch = document.querySelector('#search');
const filters = document.querySelector('#filters');
// event which open window with description
document.addEventListener('click', ({ target }) => {
	if(target.closest('p')) target.classList.toggle('show-overview');
});

window.addEventListener('scroll', () => {
	if(this.scrollY == 100) {
		header.classList.add('sticky-effect');
		filters.classList.add('sticky-effect');
	} else if (this.scrollY == 0) {
		header.classList.remove('sticky-effect');
		filters.classList.remove('sticky-effect');
	}
})

const showLoader = bool => loader.hidden = bool;

const debounce = (func, delay) => {
	let inDebounce
	return function() {
			const context = this
			const args = arguments
			clearTimeout(inDebounce)
			inDebounce = setTimeout(() => func.apply(context, args), delay)
	}
}
// getting movies
const getMovies = async (key, page) => {
	try {
		showLoader(false);
		const response = await fetch(`${API_DISCOVER_URL}/?api_key=${key}&page=${page}`);
		const data = await response.json();
			renderUi(data);
			attachPaginationHandlers(paginate);
		} catch (error) {
				return `Caught an error: ${error}`
		} finally {
			showLoader(true);
	};
};
// searching movies
const getSearch = async (query, page = 1) => {
	try{
		if (!query) return;
		showLoader(false);
		const response = await fetch(`${API_SEARCH_URL}?api_key=${API_KEY}&query=${query}&page=${page}`);
		const data = await response.json();
		renderUi(data);
		attachPaginationHandlers(function() {
			paginateSearch.call(this, query)
		});
	} catch (error) {
			return `Caught an error: ${error}`
	}	finally {
			showLoader(true);
	};
};

const getFilters = async () => {
	try{
		showLoader(false);
		const response = await fetch(`${API_DISCOVER_GENRE_URL}?api_key=${API_KEY}&language=en-En`);
		const  { genres }  = await response.json();
		renderFilters(genres, filters);
	} catch (error) {
			return `Caught an error: ${error}`
	} finally {
		showLoader(true);
	};
}

// getting pagination
function paginate () {
	getMovies(API_KEY, this.dataset.page);
};
function paginateSearch(query){
	getSearch(query, this.dataset.page);
}
// attach event on butt on
function attachPaginationHandlers(handler) {
	const buttons = pagination.querySelectorAll('button');
	buttons.forEach(btn => btn.addEventListener('click', handler));
}
// rendering UI elements
function renderUi({ results, total_pages, page }) {
	renderMovies(results, container);
	renderPagination(page, total_pages, pagination);
}
// rendering all movies
function renderMovies(data, wrapper) {
	wrapper.innerHTML = data.map(({ title, overview, poster_path }) =>
		`<section class="movie">
			<figure class="poster">
				<img src="${API_IMAGE_URL}/${poster_path}" alt="alt" />
				<figcaption class="title">${title}</figcaption>
			</figure>
			<p class="overview">${overview}</p>
		</section>`,
	).join('');
};
// rendering paggination
function renderPagination(page = 1, total_pages, wrapper) {
	wrapper.innerHTML = `
	<button type="button" class="${ page - 1 === 0 ? 'disabled' : '' }" data-page="${ page - 1 }"><i class="fa fa-arrow-left"></i></button>
		<span>${page}</span>
	<button type="button" class="${ page + 1 > total_pages ? 'disabled' : '' }" data-page="${ page + 1 }"><i class="fa fa-arrow-right"></i></button>`;
};

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

getFilters();
getMovies(API_KEY);
