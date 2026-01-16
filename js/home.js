import { mountHeader, fetchJSON, qs, money, escapeHTML } from "./app.js";

mountHeader();

const grid = qs("#moviesGrid");
const searchInput = qs("#searchInput");
const genreSelect = qs("#genreSelect");

let movies = [];

function render(list){
  grid.innerHTML = list.map(m => `
    <article class="card">
      <div class="card-media">
        <img src="${escapeHTML(m.poster)}" alt="${escapeHTML(m.title)} poster" loading="lazy" />
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(m.title)}</h3>
        <div class="meta">
          <span class="badge">${escapeHTML(m.genre)}</span>
          <span class="badge">${m.duration} min</span>
          <span class="badge">⭐ ${m.rating}</span>
        </div>
        <div class="card-actions">
          <a class="btn secondary" href="movie.html?movieId=${m.id}">Details</a>
        </div>
      </div>
    </article>
  `).join("");
}

function applyFilters(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const g = genreSelect.value;

  const filtered = movies.filter(m => {
    const okTitle = !q || m.title.toLowerCase().includes(q);
    const okGenre = g === "all" || m.genre === g;
    return okTitle && okGenre;
  });

  render(filtered);
}

function fillGenres(list){
  const genres = [...new Set(list.map(x => x.genre))].sort();
  for(const g of genres){
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreSelect.appendChild(opt);
  }
}

(async function init(){
  movies = await fetchJSON("data/movies.json");
  fillGenres(movies);
  render(movies);

  searchInput.addEventListener("input", applyFilters);
  genreSelect.addEventListener("change", applyFilters);
})();
