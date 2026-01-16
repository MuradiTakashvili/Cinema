import {
  mountHeader, fetchJSON, qs, getParam, money,
  getTakenSeats
} from "./app.js";

mountHeader();

const sessionId = Number(getParam("sessionId"));
const seatGrid = qs("#seatGrid");
const continueBtn = qs("#continueBtn");
const errEl = qs("#err");

const sessionInfo = qs("#sessionInfo");
const sumSession = qs("#sumSession");
const sumPrice = qs("#sumPrice");
const sumCount = qs("#sumCount");
const sumSeats = qs("#sumSeats");
const sumTotal = qs("#sumTotal");
const ruleNote = qs("#ruleNote");

const ROWS = 8;
const COLS = 10;
const MAX_PER_ORDER = 6;

let session = null;
let movie = null;
let price = 0;

let taken = [];
let selected = new Set();

ruleNote.textContent = `Rule: maximum ${MAX_PER_ORDER} seats per order.`;

function seatId(r, c){
  const rowLetter = String.fromCharCode("A".charCodeAt(0) + r);
  return `${rowLetter}${c+1}`;
}

function renderGrid(){
  seatGrid.innerHTML = "";

  for(let r=0; r<ROWS; r++){
    const row = document.createElement("div");
    row.className = "seat-row";

    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = String.fromCharCode("A".charCodeAt(0) + r);
    row.appendChild(label);

    for(let c=0; c<COLS; c++){
      const id = seatId(r,c);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seat";
      btn.dataset.seat = id;
      btn.textContent = c+1;

      if(taken.includes(id)){
        btn.classList.add("taken");
        btn.disabled = true;
      }
      if(selected.has(id)){
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => onSeatClick(id));
      row.appendChild(btn);
    }

    seatGrid.appendChild(row);
  }
}

function onSeatClick(id){
  errEl.style.display = "none";
  errEl.textContent = "";

  if(taken.includes(id)){
    showErr("This seat is already taken.");
    return;
  }

  if(selected.has(id)){
    selected.delete(id);
  }else{
    if(selected.size >= MAX_PER_ORDER){
      showErr(`Max ${MAX_PER_ORDER} seats allowed.`);
      return;
    }
    selected.add(id);
  }

  renderGrid();
  renderSummary();
}

function renderSummary(){
  sumSession.textContent = session ? `${session.date} ${session.time} (Hall ${session.hallId})` : "—";
  sumPrice.textContent = money(price);

  const seatsArr = [...selected].sort((a,b)=>a.localeCompare(b));
  sumCount.textContent = String(seatsArr.length);
  sumSeats.innerHTML = seatsArr.map(s => `<span class="chip">${s}</span>`).join("");
  sumTotal.textContent = money(seatsArr.length * price);

  continueBtn.disabled = seatsArr.length === 0;
}

function showErr(msg){
  errEl.textContent = msg;
  errEl.style.display = "block";
}

continueBtn.addEventListener("click", () => {
  const seatsArr = [...selected].sort((a,b)=>a.localeCompare(b));
  const total = seatsArr.length * price;

  const payload = {
    sessionId,
    selectedSeats: seatsArr,
    totalPrice: total
  };

  sessionStorage.setItem("cinema_pending_checkout", JSON.stringify(payload));
  location.href = `checkout.html?sessionId=${sessionId}`;
});

(async function init(){
  const [movies, sessions] = await Promise.all([
    fetchJSON("data/movies.json"),
    fetchJSON("data/sessions.json")
  ]);

  session = sessions.find(s => s.id === sessionId);
  if(!session){
    sessionInfo.textContent = "Session not found.";
    return;
  }

  movie = movies.find(m => m.id === session.movieId);
  price = Number(session.price);

  taken = getTakenSeats(String(sessionId));
  sessionInfo.textContent = `${movie ? movie.title : "Movie"} • ${session.date} ${session.time} • Hall ${session.hallId}`;

  renderGrid();
  renderSummary();
})();
