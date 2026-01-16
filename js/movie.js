import { mountHeader, fetchJSON, qs, getParam, escapeHTML, money } from "./app.js";

mountHeader();

const movieId = Number(getParam("movieId"));
const poster = qs("#poster");
const titleEl = qs("#title");
const metaEl = qs("#meta");
const descEl = qs("#desc");
const timesEl = qs("#times");

(async function init(){
  const [movies, sessions] = await Promise.all([
    fetchJSON("data/movies.json"),
    fetchJSON("data/sessions.json")
  ]);

  const movie = movies.find(m => m.id === movieId);
  if(!movie){
    titleEl.textContent = "Movie not found";
    return;
  }

  poster.src = movie.poster;
  poster.alt = `${movie.title} poster`;
  titleEl.textContent = movie.title;
  metaEl.innerHTML = `
    <span class="badge">${escapeHTML(movie.genre)}</span>
    <span class="badge">${movie.duration} min</span>
    <span class="badge">⭐ ${movie.rating}</span>
  `;
  descEl.textContent = movie.description;

  const showtimes = sessions
    .filter(s => s.movieId === movieId)
    .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

  timesEl.innerHTML = showtimes.length ? showtimes.map(s => `
    <div class="time-row">
      <div class="left">
        <strong>${escapeHTML(s.date)} — ${escapeHTML(s.time)}</strong>
        <span class="small">Hall ${escapeHTML(s.hallId)} • ${money(s.price)} / seat</span>
      </div>
      <a class="btn" href="seats.html?sessionId=${s.id}">Book</a>
    </div>
  `).join("") : `<div class="small">No sessions available.</div>`;
})();
