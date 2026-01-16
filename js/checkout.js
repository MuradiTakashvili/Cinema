import {
  mountHeader, fetchJSON, qs, getParam, money,
  requireLoginOrRedirect,
  getTakenSeats, setTakenSeats,
  getBookings, setBookings
} from "./app.js";

mountHeader();

const sessionId = Number(getParam("sessionId"));
const redirectHere = `checkout.html?sessionId=${encodeURIComponent(String(sessionId))}`;
if(!requireLoginOrRedirect(redirectHere)){
} else {
  init();
}

async function init(){
  const pendingRaw = sessionStorage.getItem("cinema_pending_checkout");
  if(!pendingRaw){
    location.href = "index.html";
    return;
  }
  const pending = JSON.parse(pendingRaw);

  const [movies, sessions] = await Promise.all([
    fetchJSON("data/movies.json"),
    fetchJSON("data/sessions.json")
  ]);

  const session = sessions.find(s => s.id === sessionId);
  if(!session){
    location.href = "index.html";
    return;
  }
  const movie = movies.find(m => m.id === session.movieId);

  qs("#backBtn").href = `seats.html?sessionId=${sessionId}`;

  qs("#oMovie").textContent = movie ? movie.title : "—";
  qs("#oSession").textContent = `${session.date} ${session.time}`;
  qs("#oHall").textContent = session.hallId;
  qs("#oCount").textContent = String(pending.selectedSeats.length);
  qs("#oSeats").innerHTML = pending.selectedSeats.map(s => `<span class="chip">${s}</span>`).join("");
  qs("#oTotal").textContent = money(pending.totalPrice);

  const cardEl = qs("#card");
  const expEl = qs("#exp");
  const cvvEl = qs("#cvv");

  if(cardEl) cardEl.addEventListener("input", onCardInput);
  if(expEl)  expEl.addEventListener("input", onExpInput);
  if(cvvEl)  cvvEl.addEventListener("input", onCvvInput);

  qs("#payBtn").addEventListener("click", () => onPay({ pending, session, movie }));
}

function showErr(msg){
  const el = qs("#payErr");
  el.textContent = msg;
  el.style.display = "block";
}

function clearErr(){
  const el = qs("#payErr");
  el.textContent = "";
  el.style.display = "none";
}

function normalizeDigits(s){ return (s || "").replace(/\D/g, ""); }

function validateForm(){
  clearErr();

  const name = (qs("#name").value || "").trim();
  const cardDigits = normalizeDigits(qs("#card").value);
  const exp = (qs("#exp").value || "").trim();
  const cvvDigits = normalizeDigits(qs("#cvv").value);

  if(!name) return { ok:false, msg:"Name is required." };
  if(cardDigits.length !== 16) return { ok:false, msg:"Card number must be 16 digits." };
  if(!/^\d{2}\/\d{2}$/.test(exp)) return { ok:false, msg:"Exp must be MM/YY." };

  const [mm, yy] = exp.split("/").map(x => Number(x));
  if(!(mm >= 1 && mm <= 12)) return { ok:false, msg:"Exp month must be 01-12." };
  if(!(yy >= 0 && yy <= 99)) return { ok:false, msg:"Exp year is invalid." };

  if(cvvDigits.length !== 3) return { ok:false, msg:"CVV must be 3 digits." };

  return { ok:true, data:{ name, cardLast4: cardDigits.slice(-4), exp } };
}

function makeBookingId(){
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `BKG-${Date.now()}-${rand}`;
}

function onPay(ctx){
  const v = validateForm();
  if(!v.ok){
    showErr(v.msg);
    return;
  }

  const { pending, session, movie } = ctx;

  const taken = getTakenSeats(String(session.id));
  const conflict = pending.selectedSeats.find(s => taken.includes(s));
  if(conflict){
    showErr(`Seat ${conflict} already taken. Go back and select again.`);
    return;
  }

  const nextTaken = [...new Set([...taken, ...pending.selectedSeats])];
  setTakenSeats(String(session.id), nextTaken);

  const bookingId = makeBookingId();
  const bookings = getBookings();
  bookings[bookingId] = {
    bookingId,
    movieId: session.movieId,
    sessionId: session.id,
    movieTitle: movie ? movie.title : null,
    date: session.date,
    time: session.time,
    hallId: session.hallId,
    seats: pending.selectedSeats,
    totalPrice: pending.totalPrice,
    paidAt: new Date().toISOString(),
    cardLast4: v.data.cardLast4
  };
  setBookings(bookings);

  sessionStorage.removeItem("cinema_pending_checkout");

  location.href = `success.html?bookingId=${encodeURIComponent(bookingId)}`;
}

function onCardInput(e){
  const el = e.target;
  let digits = (el.value || "").replace(/\D/g, "").slice(0,16);
  const groups = digits.match(/.{1,4}/g);
  el.value = groups ? groups.join(" ") : digits;
  try{ el.selectionStart = el.selectionEnd = el.value.length; } catch(_) {}
}

function onExpInput(e){
  const el = e.target;
  let digits = (el.value || "").replace(/\D/g, "").slice(0,4);
  if(digits.length <= 2){
    el.value = digits;
  } else {
    el.value = digits.slice(0,2) + "/" + digits.slice(2);
  }
  try{ el.selectionStart = el.selectionEnd = el.value.length; } catch(_) {}
}

function onCvvInput(e){
  const el = e.target;
  el.value = (el.value || "").replace(/\D/g, "").slice(0,3);
  try{ el.selectionStart = el.selectionEnd = el.value.length; } catch(_) {}
}
